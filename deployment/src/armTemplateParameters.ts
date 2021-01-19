// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IArmTemplateParameters } from "./interfaces";

export class armTemplateParameters implements IArmTemplateParameters {

    deploymentRegion = {value: ""};
    solutionName = { value: ''};
    azureWebsiteName = { value: ''};
    adminUsername = { value: ''};
    adminPassword = { value: ''};
    remoteEndpointSSLThumbprint = { value: ''};
    remoteEndpointCertificate = { value: ''};
    remoteEndpointCertificateKey = { value: ''};
    aadTenantId = { value: ''};
    aadClientId = { value: ''};
    domain = { value: ''};
    subscriptionId = { value: ''};
    aadClientServicePrincipalId = { value: ''};
    aadClientSecret = { value: ''};
    pcsReleaseVersion = { value: ''};
    pcsDockerTag = { value: ''};
    storageEndpointSuffix = { value: ''};

    constructor(parameters: Partial<armTemplateParameters> = {}){
        Object.assign(this, parameters);
    }
}