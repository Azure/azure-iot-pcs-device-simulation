// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Client } from '@microsoft/microsoft-graph-client';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types'
import moment = require('moment');
import { buildApplicationCreateParameters } from './aadAppCreateparameters';
import { credentials } from './auth';
import { aadConstants } from './constants';
import { IArmTemplateParameters } from './interfaces';
import { createGraphClient } from './utils';

let _client: Client;

/**
 * Register an AAD app in Azure
 * 
 * @param  {IArmTemplateParameters} config
 * @param  {credentials} creds
 * @returns Promise
 */
export async function createAadApp(config: IArmTemplateParameters, creds: credentials): Promise<string>{

    const tokenResponse = await creds.graphCredentials.getToken();

    _client = createGraphClient(tokenResponse.accessToken);

    if(!_client){
        throw new Error('Unable to create Microsoft Graph client.')
    }

    let appCreationResponse: MicrosoftGraph.Application;

    // Build AAD app
    try{

        console.log(`Registering AAD app '${config.solutionName.value}'...`);
        const applicationCreateParameters = buildApplicationCreateParameters(config, creds);

        // Create the AAD app
        appCreationResponse = await _client.api('/applications').post(applicationCreateParameters);
        console.log(`AAD application '${appCreationResponse.displayName}' created. Setting credentials...`);

        // Set credentials for the app
        const passwordCredential = _buildPasswordCredential()
        await _client.api(`/applications/${appCreationResponse.id}/addPassword`).post(passwordCredential);
        console.log(`Password credentials updated for AAD application '${appCreationResponse.displayName}'.`);
        
        return appCreationResponse.appId;

    }catch(ex){

        // TODO: extract error for client response
        console.log(`Error while attempting to register an AAD application with the name '${config.solutionName.value}'...`);
        throw new Error(ex);

    }
}
/**
 * Given an AAD app ID, create a service principal in Azure
 * 
 * @param  {string} appId
 * @returns Promise
 */
export async function createServicePrincipal(appId: string): Promise<MicrosoftGraph.ServicePrincipal>{
    
    const servicePrincipalCreateParameters: any = {
        accountEnabled: true,
        appId: appId
    };

    try{
        return await _client.api('/servicePrincipals').post(servicePrincipalCreateParameters);
    }catch(ex){
        const msg = ex.message? ex.message : '';
        throw new Error(`Service-principal creation failed. ${msg}`);
    }
}
/**
 * Associate the provided service principal with the currently logged in user by
 * assigning the app admin role to the user's account.
 * 
 * @param  {MicrosoftGraph.ServicePrincipal} sp - The service principal 
 */
export async function createAppRoleAssignment(sp: MicrosoftGraph.ServicePrincipal): Promise<void>
{
    console.log('Attempting to assign app admin role to your account...');

    // obtain the ID of the logged in user, for use creating an app role assignment
    const userResponse = await _client.api('/me').get();

    const appRoleAssigment: MicrosoftGraph.AppRoleAssignment = {
        principalId: userResponse.id,  // The unique identifier (id) for the user, group or service principal being granted the app role.
        resourceId: sp.id,             // The unique identifier (id) for the resource service principal for which the assignment is made.
        appRoleId: aadConstants.adminAppRoleId
    }

    await _client.api(`/users/${userResponse.id}/appRoleAssignments`).post(appRoleAssigment);

    console.log('Successfully applied role assignment.');
}


function _buildPasswordCredential(): MicrosoftGraph.PasswordCredential{
    
    const startDate = new Date(Date.now());
    let endDate = new Date(startDate.toISOString());
    const m = moment(endDate);
    m.add(1, 'years');
    endDate = new Date(m.toISOString());

    const passwordCredential: MicrosoftGraph.PasswordCredential = {
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString()
    }

    return passwordCredential;
}