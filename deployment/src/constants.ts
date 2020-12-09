// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export const aadConstants = {
    tokenAudience: 'https://graph.microsoft.com',
    adminAppRoleId: '9B895D92-2CD3-44C7-9D02-A6AC2D5EA5C3' // https://docs.microsoft.com/en-us/azure/active-directory/roles/permissions-reference#role-template-ids
}

export const msGraphConstants = {
    timeoutInMs: 15000, // 15 seconds
};

export const solutionConstants = {
    solutionType: 'devicesimulation',
    ARM_TEMPLATE_FOLDERNAME: 'armtemplate',
}

export const configurationConstants = {
    INVALID_SOLUTION_NAME_MSG:  'solutionName parameter has an invalid value. Please enter a valid solution name.\n' +
                                'Valid characters are: ' +
                                'alphanumeric (A-Z, a-z, 0-9), ' +
                                'underscore (_), parentheses, ' +
                                'and hyphen(-)',

    INVALID_USERNAME_MSG: 'Invalid user name. See the following reference documentation for details on supported user names.\n' +
                          'https://docs.microsoft.com/en-us/azure/virtual-machines/linux/faq#what-are-the-username-requirements-when-creating-a-vm',

    INVALID_PASSWORD_MSG: 'The supplied password must be between 12-72 characters long and must satisfy at least ' +
                          '3 of password complexity requirements from the following: 1) Contains an uppercase character\n2) ' + 
                          'Contains a lowercase character\n3) Contains a numeric digit\n4) Contains a special character\n5) Control characters are not allowed',
}

export const armConstants = {
    CONTRIBUTOR_ROLE_ID: 'b24988ac-6180-42a0-ab88-20f7382dd24c',
    OWNER_ROLE_ID: '8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
    SLEEP_TIME: 5000,
    MAX_RETRYCOUNT: 36,

    // PCS_RELEASE_VERSION maps to a Git tag which is used to build a URL reference
    // to a GitHub repository with the following format:
    //
    //    https://raw.githubusercontent.com/Azure/azure-iot-pcs-device-simulation/<PCS_RELEASEVERSION>/arm-deployment/devicesimulation
    //
    // This URL is passed to the Azure Resource Manager (ARM) during deployment as an 
    // argument which is eventually consumed during Azure VM setup. During Azure VM 
    // setup this path value is used to download a VM setup script.
    PCS_RELEASE_VERSION: 'DS-2.0.9',

    // PCS_DOCKER_TAG is used as the tag on a Docker repository to reference the Docker
    // containers that contain various Simulation microservices/components
    //   Ex: azureiotpcs/device-simulation-dotnet:${PCS_DOCKER_TAG}
    PCS_DOCKER_TAG: 'DS-2.0.9'
}