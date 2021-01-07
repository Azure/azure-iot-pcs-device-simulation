// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { createAadApp, createAppRoleAssignment, createServicePrincipal } from './aadApp';
import {login} from './auth';
import { deployAzureResources } from './deploymentManager';
import { checkNodeVersion, loadDeploymentConfig, validateConfig } from './utils';

async function main(){

    checkNodeVersion();

    // Read config
    const deploymentConfig = loadDeploymentConfig();

    // Validation configuration file
    validateConfig(deploymentConfig);

    // log in to Azure
    const credentials = await login(deploymentConfig);

    // Create an AAD app
    const appId = await createAadApp(deploymentConfig, credentials);

    // Create service principal
    const servicePrincipal = await createServicePrincipal(appId);

    // Create app role assignment
    await createAppRoleAssignment(servicePrincipal);

    // Deploy Azure resources
    await deployAzureResources(deploymentConfig, credentials, servicePrincipal);

    // TODO: clean up resources on a failed deployment (AAD apps)?

}

main()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        error.message ? console.error(error.message) : console.log(error);
        process.exit(1);
    });
