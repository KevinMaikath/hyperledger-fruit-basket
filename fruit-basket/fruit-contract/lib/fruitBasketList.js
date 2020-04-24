/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('../ledger-api/statelist.js');

const FruitBasket = require('./fruitBasket.js');

class FruitBasketList extends StateList {

    constructor(ctx) {
        super(ctx, FruitBasketList.getListName());
        this.use(FruitBasket);
    }

    static getListName() {
        return 'org.fruitbasket.fruitbasketlist';
    }

    async addFruitBasket(fruitBasket) {
        return this.addState(fruitBasket);
    }

    async getFruitBasket(fruitBasketKey) {
        return this.getState(fruitBasketKey);
    }

    async updateFruitBasket(fruitBasket) {
        return this.updateState(fruitBasket);
    }
}


module.exports = FruitBasketList;
