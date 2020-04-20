/*
 *  SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const {Wallets} = require('fabric-network');
const path = require('path');

const fixtures = path.resolve(__dirname, '../../test-network');

async function addToWalletIsabella() {
    // Main try/catch block
    try {
        // A wallet stores a collection of identities
        const wallet = await Wallets.newFileSystemWallet('../organization/magnetocorp/identity/user/isabella/wallet');

        // Identity to credentials to be stored in the wallet
        const credPath = path.join(fixtures, '/organizations/peerOrganizations/org2.example.com/users/User1@org2.example.com');
        const certificate = fs.readFileSync(path.join(credPath, '/msp/signcerts/User1@org2.example.com-cert.pem')).toString();
        const privateKey = fs.readFileSync(path.join(credPath, '/msp/keystore/priv_sk')).toString();

        // Load credentials into wallet
        const identityLabel = 'isabella';

        const identity = {
            credentials: {
                certificate,
                privateKey
            },
            mspId: 'Org2MSP',
            type: 'X.509'
        };

        await wallet.put(identityLabel, identity);

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

async function addToWalletBalaji() {
    // Main try/catch block
    try {

        // A wallet stores a collection of identities
        const wallet = await Wallets.newFileSystemWallet('../organization/digibank/identity/user/balaji/wallet');

        // Identity to credentials to be stored in the wallet
        const credPath = path.join(fixtures, '/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com');
        const certificate = fs.readFileSync(path.join(credPath, '/msp/signcerts/Admin@org1.example.com-cert.pem')).toString();
        const privateKey = fs.readFileSync(path.join(credPath, '/msp/keystore/priv_sk')).toString();

        // Load credentials into wallet
        const identityLabel = 'balaji';

        const identity = {
            credentials: {
                certificate,
                privateKey
            },
            mspId: 'Org1MSP',
            type: 'X.509'
        };

        await wallet.put(identityLabel, identity);

    } catch (error) {
        console.log(`Error adding to wallet. ${error}`);
        console.log(error.stack);
    }
}

async function main() {
    const envUser = process.env.CURRENTUSER;
    if (!envUser) {
        console.log('Environment current user is not set.');
        console.log('Please set the current user as follows: export CURRENTUSER="isabella" (or "balaji")');
        return;
    }

    if (envUser === 'isabella') {
        await addToWalletIsabella();
    } else if (envUser === 'balaji') {
        await addToWalletBalaji();
    } else {
        console.log(`The specified current user is invalid. Please use 'isabella' or 'balaji'`);
    }
}

main().then(() => {
    console.log('done');
}).catch((e) => {
    console.log(e);
    console.log(e.stack);
    process.exit(-1);
});
