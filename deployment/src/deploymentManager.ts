// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ResourceManagementClient } from '@azure/arm-resources'
import { Deployment, ResourceGroup, ResourceGroupsCreateOrUpdateResponse } from '@azure/arm-resources/esm/models';
import { credentials } from './auth';
import { armConstants, solutionConstants } from './constants';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types'
import { IArmTemplateParameters } from './interfaces';
import { AuthorizationManagementClient } from '@azure/arm-authorization'
import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { createCertificate } from './createCertificate';
import { buildResourceGroupUrl, getWebsiteUrl, sleep } from './utils';
import { armTemplateParameters } from './armTemplateParameters';


/**
 * This function will start the process of deploying the full set of Azure resources necessary to run 
 * IoT device simulation. It creates a resource group on Azure, assigns the contributor role to the current
 * user, validates the deployment configuration and, finally, initiates the deployment of an ARM template
 * to Azure.
 * 
 * @param  {IArmTemplateParameters} config
 * @param  {credentials} creds
 * @param  {MicrosoftGraph.ServicePrincipal} sp - The service principal used for device simulation
 */
export async function deployAzureResources(config: IArmTemplateParameters, creds: credentials, sp: MicrosoftGraph.ServicePrincipal): Promise<void>{

    console.log(`Beginning deployment of Azure resources for solution '${config.solutionName.value}'...`);

    const _client = new ResourceManagementClient(creds.armCredentials, config.subscriptionId.value);

    console.log(`Creating resource group '${config.solutionName.value}' in subscription '${config.subscriptionId.value}'`)

    // Define resource group
    const rgSpec: ResourceGroup = {
        location: config.deploymentRegion.value,
        tags: {IotSolutionType: solutionConstants.solutionType}
    }

    // Create resource group
    const rgResult = await _client.resourceGroups.createOrUpdate(config.solutionName.value, rgSpec);
    const rgUrl = buildResourceGroupUrl(rgResult, creds);

    console.log(`Successfully created resource group '${config.solutionName.value}':.`);
    console.log(`>>> Resource group URL: '${rgUrl}'.`);

    await assignContributorRoleOnResourceGroup(rgResult.name, creds, sp.id, config);

    const deployment = buildDeployment(config, creds, sp);

    await validateDeployment(deployment, _client, config);

    await deployArmTemplate(deployment, rgResult, rgUrl, creds, _client, config);

}

function buildParameters(
    config: IArmTemplateParameters,
    creds: credentials,
    sp: MicrosoftGraph.ServicePrincipal): IArmTemplateParameters{

    const parameters: armTemplateParameters = config;
    const cert = createCertificate();

    config.azureWebsiteName = config.solutionName;
    
    parameters.remoteEndpointSSLThumbprint.value = cert.thumbprint;
    parameters.remoteEndpointCertificate.value = cert.cert;
    parameters.remoteEndpointCertificateKey.value = cert.key;
    parameters.aadClientId.value = sp.appId;
    parameters.domain.value = creds.armCredentials.domain;
    parameters.aadClientServicePrincipalId.value = sp.id;
    parameters.aadClientSecret.value = '';
    parameters.storageEndpointSuffix.value = creds.environment.storageEndpointSuffix;

    return parameters;
}

function buildDeployment(config: IArmTemplateParameters, creds: credentials, sp: MicrosoftGraph.ServicePrincipal): Deployment{

    const armTemplatePath = '.' + path.sep + solutionConstants.ARM_TEMPLATE_FOLDERNAME + path.sep + 'template.json';

    console.log(`Attempting to read ARM template file: '${armTemplatePath}'`);

    const template = JSON.parse(fs.readFileSync(armTemplatePath, {encoding: 'utf-8'}));

    console.log(`Successfully read ${armTemplatePath}`);

    const parameters = buildParameters(config, creds, sp);

    return {
        properties: {
            mode: 'Incremental',
            parameters: parameters,
            template: template
        }
    };
}

async function validateDeployment(
    deployment: Deployment,
    client: ResourceManagementClient,
    config: IArmTemplateParameters
){

    console.log('Beginning validation of ARM template...');
    const validationResponse =  await client.deployments.validate(config.solutionName.value, buildDeploymentName(config), deployment);

    if(validationResponse && validationResponse._response.status !== 200){
        throw new Error(`Deployment validation failed: ${validationResponse.error.message}`);
    }

    console.log('ARM template validation successful.');
}

function buildDeploymentName(config: IArmTemplateParameters): string{
    return 'deployment-' + config.solutionName.value;
}

async function deployArmTemplate(
    deployment: Deployment,
    rg: ResourceGroupsCreateOrUpdateResponse,
    rgUrl: string, 
    creds: credentials,
    client: ResourceManagementClient, 
    config: IArmTemplateParameters){

    console.log('Beginning deployment of resource to Azure...');

    const lro = await client.deployments.beginCreateOrUpdate(rg.name, buildDeploymentName(config), deployment);
    
    let latestState: string;

    // Poll until the operation completes
    while(!lro.isFinished()){

        latestState = await lro.poll();
        console.log(`Latest state = ${latestState}`);

        await sleep(armConstants.SLEEP_TIME);
    }

    if(latestState === 'Failed'){
        console.log(`Deployment failed. View deployment information here: ${rgUrl}/deployments`)
    }else{
        console.log(`Deployment ${latestState}.`);
        console.log(`>> You can access the Simulation website here: ${getWebsiteUrl(config.solutionName.value, creds)}`);
        console.log(`>> You can access the deployed Azure resources here: ${rgUrl}`);
    }
}

async function assignContributorRoleOnResourceGroup(
    resourceGroupName: string,
    creds: credentials, 
    servicePrincipalId: string, 
    config: IArmTemplateParameters)
{
    console.log(`Attempting to assign contributor role to resource group '${resourceGroupName}'...`);

    const scope = `/subscriptions/${config.subscriptionId.value}/resourceGroups/${resourceGroupName}`;

    await createRoleAssignmentWithRetry(servicePrincipalId, scope, armConstants.CONTRIBUTOR_ROLE_ID, config, creds);

    console.log(`Successfully assigned contributor role to resource group '${resourceGroupName}'`);
}

// After creating the new application, the propagation takes sometime and hence we need to try
// multiple times until the role assignment is successful or it fails after max try.
async function createRoleAssignmentWithRetry(
    principalId: string, 
    scope: string, 
    roleId: string, 
    config: IArmTemplateParameters,
    creds: credentials): Promise<boolean>
{
    const roleDefinitionId = `${scope}/providers/Microsoft.Authorization/roleDefinitions/${roleId}`;
    // clearing the token audience
    const baseUri = creds.environment ? creds.environment.resourceManagerEndpointUrl : undefined;
    const authzClient = new AuthorizationManagementClient(creds.armCredentials, config.subscriptionId.value, {baseUri});
    const assignmentName = uuid.v1();
    const roleAssignment = {
            principalId,
            roleDefinitionId,
            scope
    };
    let retryCount = 0;
    const promise = new Promise<any>((resolve, reject) => {
        const timer: NodeJS.Timer = setInterval(
            () => {
                retryCount++;
                if(retryCount > 1){
                    console.log(`Retry ${retryCount} of ${armConstants.MAX_RETRYCOUNT}...`);
                }
                return authzClient.roleAssignments.create(scope, assignmentName, roleAssignment)
                    .then((roleResult: any) => {
                        // Sometimes after role assignment it takes some time before they get propagated
                        // this failes the ACS deployment since it thinks that credentials are not valid
                        setTimeout(
                            () => {
                                clearInterval(timer);
                                resolve(true);
                            },
                            armConstants.SLEEP_TIME);
                    })
                    .catch((error: Error | any) => {
                        if (retryCount >= armConstants.MAX_RETRYCOUNT) {
                            clearInterval(timer);
                            console.log(error);
                            reject(error);
                        } else if (error.statusCode && error.statusCode === 403) {
                            // Current user do not have permission to assign the role
                            clearInterval(timer);
                            resolve(false);
                        }
                    });
            },
            armConstants.SLEEP_TIME);
    });
    return await promise;
}