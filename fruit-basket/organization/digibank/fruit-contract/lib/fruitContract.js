/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const {Contract, Context} = require('fabric-contract-api');

// PaperNet specific classes
const FruitBasket = require('./fruitBasket.js');
const FruitBasketList = require('./fruitBasketList.js');

/**
 * A custom context provides easy access to list of all fruit baskets
 */
class FruitBasketContext extends Context {

    constructor() {
        super();
        // All fruit baskets are held in a list of fruit baskets
        this.fruitBasketList = new FruitBasketList(this);
    }

}

/**
 * Define fruit basket smart contract by extending Fabric Contract class
 *
 */
class FruitBasketContract extends Contract {

    constructor() {
        // Unique namespace when multiple contracts per chaincode file
        super('org.papernet.fruitbasket');
    }

    /**
     * Define a custom context for fruit basket
     */
    createContext() {
        return new FruitBasketContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     *  Sell a new FruitBasket
     */
    async sell(ctx, seller, id, owner, fruitName, price) {

        // create an instance of the basket
        let basket = FruitBasket.createInstance(seller, id, owner, fruitName, Number.parseFloat(price));

        // // Smart contract, rather than paper, moves paper into ISSUED state
        // paper.setIssued();

        // Newly issued basket is owned by the seller
        basket.setOwner(seller);

        // Add the basket to the list of all similar fruit baskets in the ledger world state
        await ctx.fruitBasketList.addFruitBasket(basket);

        // Must return a serialized basket to caller of smart contract
        return basket;
    }

    /**
     * Buy a fruit basket
     */
    async buy(ctx, seller, id, newOwner, buyingPrice) {

        // Retrieve the fruit basket using key fields provided
        let basketKey = FruitBasket.makeKey([seller, id]);
        let basket = await ctx.fruitBasketList.getFruitBasket(basketKey);

        // Check if currentOwner is different from newOwner
        if (basket.getOwner() === newOwner) {
            console.log('___________________SELLER == OWNER __________________');
            throw new Error('You can\'t buy your own basket!');
        }

        // Validate buying price
        if (Number.parseFloat(basket.getPrice()) > Number.parseFloat(buyingPrice)) {
            throw new Error('FruitBasket ' + basketKey + ' is not that cheap!');
        }

        basket.setOwner(newOwner);
        basket.setPrice(Number.parseFloat(buyingPrice));

        // Update the basket
        await ctx.fruitBasketList.updateFruitBasket(basket);
        return basket;
    }

    async queryBasket(ctx, seller, id) {
        let basketKey = FruitBasket.makeKey([seller, id]);
        return await ctx.fruitBasketList.getFruitBasket(basketKey);
    }


}

module.exports = FruitBasketContract;
