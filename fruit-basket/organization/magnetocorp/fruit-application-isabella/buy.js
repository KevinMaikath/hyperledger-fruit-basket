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

// Initialize fruit basket values
function initializeFruitBasket() {

    let basket = {
        seller: 'Isabella',
        id: Math.floor(Math.random() * 1000).toString(),
        owner: 'Isabella',
        fruitName: 'fruit',
        price: '10'
    };

    process.argv.forEach((val, index) => {
        if (val.startsWith('fruitname=')) {
            basket.fruitName = val.split('=')[1];
        } else if (val.startsWith('price=')) {
            basket.price = val.split('=')[1];
        } else if (val.startsWith('id')) {
            basket.id = val.split('=')[1];
        } else if (val.startsWith('seller=')) {
            basket.seller = val.split('=')[1];
        }
    });

    return basket;
}

// Main program function
async function main() {

    // A wallet stores a collection of identities for use
    const wallet = await Wallets.newFileSystemWallet('../identity/user/isabella/wallet');


    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        const userName = 'isabella';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/connection-org2.yaml', 'utf8'));

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

        // Get addressability to fruit basket paper contract
        console.log('Use org.papernet.fruitbasket smart contract.');

        const contract = await network.getContract('fruitbasket');

        // buy commercial paper
        console.log('Submit fruit basket buy transaction.');

        const fruitBasket = initializeFruitBasket();
        const buyResponse = await contract.submitTransaction('buy', fruitBasket.seller, fruitBasket.id, fruitBasket.owner, fruitBasket.price);

        // process response
        console.log('Process buy transaction response.');

        let basketResponse = JSON.parse(buyResponse.toString());

        console.log(`${basketResponse.seller} fruit basket : ${basketResponse.id} successfully bought with ${basketResponse.fruitName} at price: ${basketResponse.price}`);
        console.log('Transaction complete.');

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

    console.log('Buy program complete.');

}).catch((e) => {

    console.log('Buy program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});
