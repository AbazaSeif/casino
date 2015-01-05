'use strict';

var Game = require('../game');

var Blackjack = module.exports = function () {
  this.name = 'blackjack';
  this.label = 'Blackjack';
};

Blackjack.prototype = Object.create(Game.prototype);
Blackjack.prototype.constructor = Blackjack;
