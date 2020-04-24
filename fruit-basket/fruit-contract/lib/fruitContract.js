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
        super('org.fruitbasket.fruitcontract');
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

        let basketKey = FruitBasket.makeKey([seller, id]);
        let existingBasket = await ctx.fruitBasketList.getFruitBasket(basketKey);
        if (existingBasket) {
            throw new Error(`Fruit Basket with key ${basketKey} already exists!`);
        }

        // create an instance of the basket
        let basket = FruitBasket.createInstance(seller, id, owner, fruitName, Number.parseFloat(price));

        // Add the basket to the list of all similar fruit baskets in the ledger world state
        await ctx.fruitBasketList.addFruitBasket(basket);

        // Must return a serialized basket to caller of smart contract
        return basket;
    }

    /**
     * Buy a FruitBasket
     */
    async buy(ctx, seller, id, newOwner, buyingPrice) {

        // Retrieve the fruit basket using key fields provided
        let basketKey = FruitBasket.makeKey([seller, id]);
        let basket = await ctx.fruitBasketList.getFruitBasket(basketKey);

        if (!basket) {
            throw new Error(`The fruit basket with key ${basketKey} doesn't exist!`);
        }

        // Check if currentOwner is different from newOwner
        if (basket.getOwner() === newOwner) {
            throw new Error('You can\'t buy your own basket!');
        }

        // Validate buying price
        if (basket.getPrice() > Number.parseFloat(buyingPrice)) {
            throw new Error(`FruitBasket ${basketKey} with price: ${basket.getPrice()}
            can't be bought with ${Number.parseFloat(buyingPrice)}`);
        }

        basket.setOwner(newOwner);
        basket.setPrice(Number.parseFloat(buyingPrice));

        // Update the basket
        await ctx.fruitBasketList.updateFruitBasket(basket);
        return basket;
    }

    /**
     * Query for a specific FruitBasket given its seller and id
     */

    async queryBasket(ctx, seller, id) {
        let basketKey = FruitBasket.makeKey([seller, id]);
        const basket = await ctx.fruitBasketList.getFruitBasket(basketKey);
        if (!basket) {
            throw new Error(`The fruit basket with key ${basketKey} doesn't exist!`);
        }

        return basket;
    }


}

module.exports = FruitBasketContract;
