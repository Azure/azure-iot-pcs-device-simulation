// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as forge from 'node-forge';

export interface ICertificate{
    cert: string,
    thumbprint: string,
    key: string;
}
/**
 * Creates a certificate for used in the creation of a web app
 * 
 * @returns ICertificate
 */
export function createCertificate(): ICertificate {
    const pki: any = forge.pki;
    // generate a keypair and create an X.509v3 certificate
    const keys = pki.rsa.generateKeyPair(2048);
    const certificate = pki.createCertificate();
    certificate.publicKey = keys.publicKey;
    certificate.serialNumber = '01';
    certificate.validity.notBefore = new Date(Date.now());
    certificate.validity.notAfter = new Date(Date.now());
    certificate.validity.notAfter.setFullYear(certificate.validity.notBefore.getFullYear() + 1);
    // self-sign certificate
    certificate.sign(keys.privateKey);
    const cert = forge.pki.certificateToPem(certificate);
    const thumbprint = forge.md.sha1.create().update(forge.asn1.toDer(pki.certificateToAsn1(certificate)).getBytes()).digest().toHex();
    return {
        cert,
        thumbprint,
        key: forge.pki.privateKeyToPem(keys.privateKey)
    };
}