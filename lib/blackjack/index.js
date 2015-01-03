'use strict';

var Game = require('../game');

var Blackjack = module.exports = function () {
  console.log('todo');
}

Blackjack.prototype = Object.create(Game.prototype);
Blackjack.prototype.constructor = Blackjack;
