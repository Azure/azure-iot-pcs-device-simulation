// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {Environment} from '@azure/ms-rest-azure-env';
import {interactiveLoginWithAuthResponse, InteractiveLoginOptions, DeviceTokenCredentials} from '@azure/ms-rest-nodeauth';
import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as adal from 'adal-node';
import { aadConstants } from './constants';
import { IArmTemplateParameters } from './interfaces';

// let cachedAuthResponse: any;
const simTmpDir: string = os.homedir() + path.sep + '.iot-device-simulation';
const cacheFilePath: string = simTmpDir + path.sep + 'cache.json';

export interface credentials{
    graphCredentials: DeviceTokenCredentials,
    armCredentials: DeviceTokenCredentials,
    environment: Environment
}

/**
 * Performs device login against both Microsoft Graph and management.azure.com. 
 * After login succeeds, credentials are cached to disk for later use.
 * 
 * @param  {IArmTemplateParameters} deploymentConfig
 * @returns Promise<credentials>
 */
export async function login(deploymentConfig: IArmTemplateParameters): Promise<credentials> {
    
    const cachedCredentials = await getCachedAuthResponse();

    if(!cachedCredentials){
        // TODO: support other clouds?
        const environment = Environment.AzureCloud;
        const loginOptionsGraph: InteractiveLoginOptions = {
            environment,
            tokenAudience: aadConstants.tokenAudience,
            domain: deploymentConfig.aadTenantId.value
        };

        const loginOptionsArm: InteractiveLoginOptions = {
            environment,
            domain: deploymentConfig.aadTenantId.value
        }

        console.log('Logging in to Azure (we need to do this twice)...');

        const graphLoginResponse = await interactiveLoginWithAuthResponse(loginOptionsGraph);
        const armLoginResponse = await interactiveLoginWithAuthResponse(loginOptionsArm);
        saveAuthResponse({
            graph: graphLoginResponse.credentials,
            arm: armLoginResponse.credentials
        });

        return {
            graphCredentials: graphLoginResponse.credentials as DeviceTokenCredentials,
            armCredentials: armLoginResponse.credentials as DeviceTokenCredentials,
            environment: graphLoginResponse.credentials.environment
        };

    }else{
        return cachedCredentials;
    }
}

function saveAuthResponse(credentials: any): void {
    const data = {
        graphCredentials: credentials.graph,
        armCredentials: credentials.arm
    };
    //cachedAuthResponse = data;
    if (!fs.existsSync(simTmpDir)) {
        fs.mkdirSync(simTmpDir);
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(data));
    console.log(`${chalk.green('Successfully logged in')}`);
}

async function getCachedAuthResponse(): Promise<credentials> {
    if (!fs.existsSync(cacheFilePath)) {
        return null;
    } else {
        const parsedCredentials = JSON.parse(fs.readFileSync(cacheFilePath, {encoding: 'utf-8'}));

        let expiredToken = false;

        // We need to convert expiresOn back to a date
        Object.keys(parsedCredentials).forEach((x : any) => {
            parsedCredentials[x].tokenCache._entries.forEach(
                (token: any) => {
                    token.expiresOn = token.expiresOn ? new Date(token.expiresOn) : token.expiresOn;

                    if(token.expiresOn){
                        token.expiresOn = new Date(token.expiresOn);
                        if(token.expiresOn - Date.now() < 0){
                            console.log('Expired authentication token found. Please log in again.');
                            expiredToken = true;
                        }
                    }
                }
            );
        });

        if(expiredToken){
            return null;
        }

        return {
            graphCredentials: await processCachedCredentials(parsedCredentials.graphCredentials),
            armCredentials: await processCachedCredentials(parsedCredentials.armCredentials),
            environment: parsedCredentials.graphCredentials.environment
        };
    }
}

async function processCachedCredentials(cachedCredential: any): Promise<DeviceTokenCredentials>{

    // Convert parsed tokens to a memory stream
    const cache = new adal.MemoryCache();
    await addTokenToCache(cache, cachedCredential.tokenCache._entries);
    cachedCredential.tokenCache = cache;

    return new DeviceTokenCredentials(
        cachedCredential.clientId,
        cachedCredential.domain,
        cachedCredential.username,
        cachedCredential.tokenAudience,
        cachedCredential.environment,
        cachedCredential.tokenCache
    );
}

async function addTokenToCache(cache: adal.MemoryCache, tokens: adal.TokenResponse[]) {
    return new Promise((resolve, reject) => {
        cache.add(tokens, (err, result) => {
            if (err) {
                return reject(err);
            } else { resolve(result); }
        });
    });
}