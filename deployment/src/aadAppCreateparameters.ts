// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { aadConstants } from './constants';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types'
import { credentials } from './auth';
import { IArmTemplateParameters } from './interfaces';
import { getWebsiteUrl } from './utils';

const readOnlyAppRoleId = 'e5bbd0f5-128e-4362-9dd1-8f253c6082d7';

/**
 * Build a Microsoft Graph application that will be used to specify the
 * creation of an AAD app registration. 
 * 
 * @param  {IArmTemplateParameters} config
 * @param  {credentials} creds
 * @returns MicrosoftGraph
 */
export function buildApplicationCreateParameters(
    config: IArmTemplateParameters,
    creds: credentials): MicrosoftGraph.Application
{
    const homepage = getWebsiteUrl(config.solutionName.value, creds);
    const identifierUris = [ homepage ];

    // Allowing Graph API to sign in and read user profile for newly created application
    const requiredResourceAccess: MicrosoftGraph.RequiredResourceAccess[] = [{
        resourceAccess: [
            {
                // This guid represents Sign in and read user profile
                // http://www.cloudidentity.com/blog/2015/09/01/azure-ad-permissions-summary-table/
                id: '311a71cc-e848-46a1-bdf8-97ff7156d8e6',
                type: 'Scope'
            }
        ],
        // This guid represents Directory Graph API ID
        resourceAppId: '00000002-0000-0000-c000-000000000000'
    }];

    const appRoles: MicrosoftGraph.AppRole[] = [
        {
            allowedMemberTypes: [
                'User'
            ],
            description: 'Administrator access to the application',
            displayName: 'Admin',
            id: aadConstants.adminAppRoleId,
            isEnabled: true,
            value: 'Admin'
        },
        {
            allowedMemberTypes: [
                'User'
            ],
            description: 'Read only access to device information',
            displayName: 'Read Only',
            id: readOnlyAppRoleId,
            isEnabled: true,
            value: 'ReadOnly'
        }
    ];

    const appSpecification: MicrosoftGraph.Application = {
        appRoles: appRoles,
        signInAudience: 'AzureADMyOrg',
        displayName: config.solutionName.value,
        identifierUris: identifierUris,
        web: {
            implicitGrantSettings: {
                enableAccessTokenIssuance: true,
                enableIdTokenIssuance: true
            },
            redirectUris: [homepage] // Note: this can also be set in publicClient/redirectUris
        },
        optionalClaims: {
            idToken: [{
                essential: true,
                name: 'role'
            }]
        },
        requiredResourceAccess
    };

    return appSpecification;
}