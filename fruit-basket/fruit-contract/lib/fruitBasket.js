/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('../ledger-api/state.js');

/**
 * FruitBasket class extends State class
 * Class will be used by application and smart contract to define a fruit basket
 */
class FruitBasket extends State {

    constructor(obj) {
        super(FruitBasket.getClass(), [obj.seller, obj.id]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
     */
    getSeller() {
        return this.seller;
    }

    setSeller(newSeller) {
        this.seller = newSeller;
    }

    getOwner() {
        return this.owner;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

    getFruitName() {
        return this.fruitName;
    }

    setFruitName(newFruitName) {
        this.fruitName = newFruitName;
    }

    getPrice() {
        return this.price;
    }

    setPrice(newPrice) {
        this.price = newPrice;
    }

    /**
     * Useful methods to encapsulate commercial paper states
     */

    static fromBuffer(buffer) {
        return FruitBasket.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, FruitBasket);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(seller, id, owner, fruitName, price) {
        return new FruitBasket({seller, id, owner, fruitName, price});
    }

    static getClass() {
        return 'org.fruitbasket.fruitbasket';
    }
}

module.exports = FruitBasket;
