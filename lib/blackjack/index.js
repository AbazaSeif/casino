'use strict';

/**
 * @module lib/blackjack
 * @description Blackjack
 */

var Game = require('../game');

var Blackjack = module.exports = function () {
  console.log('todo');
  this.name = 'blackjack';
  this.label = 'Blackjack';
};

Blackjack.prototype = Object.create(Game.prototype);
Blackjack.prototype.constructor = Blackjack;
