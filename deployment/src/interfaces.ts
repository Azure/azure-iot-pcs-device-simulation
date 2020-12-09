// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface DeploymentParameterDefinition{
    value: string
}

export interface IArmTemplateParameters{

    aadTenantId: DeploymentParameterDefinition,
    subscriptionId: DeploymentParameterDefinition,
    solutionName: DeploymentParameterDefinition,
    deploymentRegion: DeploymentParameterDefinition,
    azureWebsiteName: DeploymentParameterDefinition,
    adminUsername: DeploymentParameterDefinition,
    adminPassword: DeploymentParameterDefinition,
    remoteEndpointSSLThumbprint: DeploymentParameterDefinition,
    remoteEndpointCertificate: DeploymentParameterDefinition,
    remoteEndpointCertificateKey: DeploymentParameterDefinition,
    aadClientId: DeploymentParameterDefinition,
    domain: DeploymentParameterDefinition,
    aadClientServicePrincipalId: DeploymentParameterDefinition,
    aadClientSecret: DeploymentParameterDefinition,
    pcsReleaseVersion: DeploymentParameterDefinition,
    pcsDockerTag: DeploymentParameterDefinition,
    storageEndpointSuffix: DeploymentParameterDefinition
}