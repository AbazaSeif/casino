'use strict';

/**
 * @module lib/blackjack
 * @description Blackjack
 */

var Game = require('../game');

/**
 * @class
 * @alias Blackjack
 * @augments Game
 */
var Blackjack = module.exports = function () {
  console.log('todo');
  this.name = 'blackjack';
  this.label = 'Blackjack';
};

Blackjack.prototype = Object.create(Game.prototype);
Blackjack.prototype.constructor = Blackjack;

Blackjack.prototype.init = function () {};
Blackjack.prototype.fin = function () {};
Blackjack.prototype.css = function () {};
Blackjack.prototype.output = function () {};
