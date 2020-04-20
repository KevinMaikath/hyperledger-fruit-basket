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
        let basket = FruitBasket.createInstance(seller, id, owner, fruitName, price);

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
            throw new Error('You can\'t buy your own basket!');
        }

        // Validate buying price
        if (basket.getPrice() > buyingPrice) {
            throw new Error('FruitBasket ' + basketKey + ' is not that cheap!');
        }

        basket.setOwner(newOwner);
        basket.setPrice(buyingPrice);

        // Update the basket
        await ctx.fruitBasketList.updateFruitBasket(basket);
        return basket;
    }

    // /**
    //  * Redeem commercial paper
    //  *
    //  * @param {Context} ctx the transaction context
    //  * @param {String} issuer commercial paper issuer
    //  * @param {Integer} paperNumber paper number for this issuer
    //  * @param {String} redeemingOwner redeeming owner of paper
    //  * @param {String} redeemDateTime time paper was redeemed
    //  */
    // async redeem(ctx, issuer, paperNumber, redeemingOwner, redeemDateTime) {
    //
    //     let paperKey = CommercialPaper.makeKey([issuer, paperNumber]);
    //
    //     let paper = await ctx.paperList.getPaper(paperKey);
    //
    //     // Check paper is not REDEEMED
    //     if (paper.isRedeemed()) {
    //         throw new Error('Paper ' + issuer + paperNumber + ' already redeemed');
    //     }
    //
    //     // Verify that the redeemer owns the commercial paper before redeeming it
    //     if (paper.getOwner() === redeemingOwner) {
    //         paper.setOwner(paper.getIssuer());
    //         paper.setRedeemed();
    //     } else {
    //         throw new Error('Redeeming owner does not own paper' + issuer + paperNumber);
    //     }
    //
    //     await ctx.paperList.updatePaper(paper);
    //     return paper;
    // }

}

module.exports = FruitBasketContract;
