/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const {Wallets, Gateway} = require('fabric-network');

// Validate input params
function validateInputs() {
    if (process.argv[2] === 'all') {
        console.warn('QueryAll has not been implemented yet.');
        return false;
    } else if (!process.argv[2] || !process.argv[3]) {
        console.error('ERROR: invalid parameters. Seller name and basket ID must be provided correctly');
        return false;
    } else {
        return true;
    }
}

// Main program function
async function main() {

    if (!validateInputs()) {
        return;
    }

    const envUser = process.env.CURRENTUSER;
    if (!envUser) {
        console.log('Environment current user is not set.');
        console.log('Please set the current user as follows: export CURRENTUSER="isabella" (or "balaji")');
        return;
    }

    let wallet;
    let userName;
    let connectionProfile;

    if (envUser === 'isabella') {
        // A wallet stores a collection of identities for use
        wallet = await Wallets.newFileSystemWallet('../organization/magnetocorp/identity/user/isabella/wallet');

        // Specify userName for network access
        userName = 'isabella';

        // Load connection profile; will be used to locate a gateway
        connectionProfile = yaml.safeLoad(fs.readFileSync('../organization/magnetocorp/gateway/connection-org2.yaml', 'utf8'));

    } else if (envUser === 'balaji') {
        wallet = await Wallets.newFileSystemWallet('../organization/digibank/identity/user/balaji/wallet');
        userName = 'balaji';
        connectionProfile = yaml.safeLoad(fs.readFileSync('../organization/digibank/gateway/connection-org1.yaml', 'utf8'));
    } else {
        console.log(`The specified current user is invalid. Please use 'isabella' or 'balaji'`);
        return;
    }

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: {enabled: true, asLocalhost: true}

        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.papernet.fruitbasket smart contract.');

        const contract = await network.getContract('fruitbasket');

        // query fruit baskets
        console.log('Submit fruit basket query transaction.');
        console.log('----------------------- Smart Contract Execution ---------------------------');
        const queryResponse = await contract.submitTransaction('queryBasket', process.argv[2], process.argv[3]);

        // process response
        let basketResponse = JSON.parse(queryResponse.toString());
        console.log('Basket:');
        console.log(basketResponse);
        console.log('--------------------------- Transaction complete ---------------------------');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}


main().then(() => {

    console.log('Query program complete.');

}).catch((e) => {

    console.log('Query program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
