// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Client } from '@microsoft/microsoft-graph-client';
import { configurationConstants, msGraphConstants, solutionConstants } from './constants';
import { IArmTemplateParameters } from './interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { ResourceGroupsCreateOrUpdateResponse } from '@azure/arm-resources/esm/models';
import { credentials } from './auth';
import { Environment } from '@azure/ms-rest-azure-env';
import { armTemplateParameters } from './armTemplateParameters';

/**
 * Given an access token string, create a Microsoft Graph client
 * 
 * @param  {string} token - the access token that the Graph client will use to communicate
 *                          with Microsoft Graph.
 */
export function createGraphClient(token: string): Client
{
    return Client.initWithMiddleware({
        authProvider: {
            getAccessToken: async () => token,
        },
        fetchOptions: {
            timeout: msGraphConstants.timeoutInMs,
        },
        debugLogging: false
    });
}

/**
 * Load the 'parameters.json' configuration file.
 * 
 * @returns IArmTemplateParameters
 */
export function loadDeploymentConfig(): IArmTemplateParameters{

    const armParametersPath = '.' + path.sep + solutionConstants.ARM_TEMPLATE_FOLDERNAME + path.sep + 'parameters.json';

    console.log(`Attempting to read configuration file: '${armParametersPath}'`);

    const parameters = JSON.parse(fs.readFileSync(armParametersPath, {encoding: 'utf-8'})) as Partial<armTemplateParameters>;
    return new armTemplateParameters(parameters);
}

/**
 * Returns a valid Azure resource group URL
 * 
 * @param  {ResourceGroupsCreateOrUpdateResponse} rgResult
 * @param  {credentials} creds
 * @returns string
 */
export function buildResourceGroupUrl(rgResult: ResourceGroupsCreateOrUpdateResponse, creds: credentials): string{

    if(!rgResult) throw new Error(`Unable to build resource group URL due to 'rgResult' argument being null in ${buildResourceGroupUrl.name}`);
    if(!creds) throw new Error(`Unable to build resource group URL due to null value for 'creds' argument in ${buildResourceGroupUrl.name}`);

    return `${creds.environment.portalUrl}/${creds.armCredentials.domain}#resource${rgResult.id}`;
}
/**
 * awaitable wrapper around setTimeout
 * 
 * @param  {number} ms - the number of milliseconds to sleep
 * @returns Promise
 */
export function sleep(ms: number): Promise<void>{
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Validate the parameters.json configuration file
 * 
 * @param  {IArmTemplateParameters} config
 */
export function validateConfig(config: IArmTemplateParameters): void{
    const solutionNameRegex = /^[-a-zA-Z0-9_]{1,64}[^.]$/;

    const validationMsg: string[] = [];
    
    /* Password requirements: https://docs.microsoft.com/en-us/azure/virtual-machines/linux/faq
                              #what-are-the-password-requirements-when-creating-a-vm
        Passwords must be 12 - 123 characters in length and meet 3 out of the following 4 complexity requirements:
        Have lower characters
        Have upper characters
        Have a digit
        Have a special character (Regex match [\W_])
    */
    // tslint:disable
    const passwordRegex = /^((?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)|(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^a-zA-Z0-9])|(?=.*?[A-Z])(?=.*?\d)(?=.*?[^a-zA-Z0-9])|(?=.*?[a-z])(?=.*?\d)(?=.*?[^a-zA-Z0-9])).{12,72}$/;

    console.log('Validating configuration...');

    // Solution name
    if(!solutionNameRegex.test(config.solutionName.value)){
        validationMsg.push(configurationConstants.INVALID_SOLUTION_NAME_MSG);
    }

    // validate that the deployment type and SKU are supported in the specified environment?

    /* User name requirements: https://docs.microsoft.com/en-us/azure/virtual-machines/linux/faq
                               #what-are-the-username-requirements-when-creating-a-vm
       Usernames can be a maximum of 20 characters in length and cannot end in a period ('.').
    */
    const userNameRegex = /^(.(?!\.$)){1,20}$/;

    ['1', '123', 'a', 'actuser', 'adm', 'admin', 'admin1', 'admin2','administrator',
     'aspnet','backup','console','david','guest','john','owner','root','server','sql',
     'support_388945a0','support','sys','test','test1','test2','test3','user','user1',
     'user2','user3','user4','user5','video'].map(
        (x: string) => {
            if(x === config.adminUsername.value.trim()){
               validationMsg.push(configurationConstants.INVALID_USERNAME_MSG);
               validationMsg.push(`Invalid parameter value: ${config.adminUsername.value}`);
            }
        });
        
    if(!userNameRegex.test(config.adminUsername.value)){
        validationMsg.push(configurationConstants.INVALID_USERNAME_MSG);
        validationMsg.push(`Invalid parameter value: ${config.adminUsername.value}`);
    }

    // password
    if(!passwordRegex.test(config.adminPassword.value)){
        validationMsg.push(configurationConstants.INVALID_PASSWORD_MSG);
    }

    // TODO:
    // Verify that the region specified supports all resource types that are going
    // to be deployed

    // TODO:
    // Validate other configuration parameters...
    // subscription

    if(validationMsg.length > 0){

        let msg = '';
        
        validationMsg.map(x => msg += '\n\n' + x);

        throw new Error(msg);
    }
}

export function getWebsiteUrl(hostName: string, creds: credentials): string {
    const domain = getDomain(creds);
    return `https://${hostName}${domain}`;
}

// TODO: verify that these suffixes are still accurate
function getDomain(creds: credentials): string {
    let domain = '.azurewebsites.net';
    switch (creds.environment.name) {
        case Environment.AzureCloud.name:
            domain = '.azurewebsites.net';
            break;
        case Environment.ChinaCloud.name:
            domain = '.chinacloudsites.cn';
            break;
        case Environment.GermanCloud.name:
            domain = '.azurewebsites.de';
            break;
        case Environment.USGovernment.name:
            domain = '.azurewebsites.us';
            break;
        default:
            domain = '.azurewebsites.net';
            break;
    }
    return domain;
}