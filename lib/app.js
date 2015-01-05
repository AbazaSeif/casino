/**
 * @module app
 * @summary Main script file for index.htm
 * @requires lib/chips
 * @requires lib/game-interface
 * @requires lib/game
 * @requires lib/blackjack
 */
'use strict';

var Game = require('./game');
var GameInterface = require('./game-interface');
var Chips = require('./chips');
var Blackjack = require('./blackjack');

require('./styles/app');

window.addEventListener('DOMContentLoaded', function () {

  var noJs = document.getElementsByClassName('no-js');
  for (var x = noJs.length - 1; x >= 0; x -= 1) {
    noJs[x].classList.remove('no-js');
  }

  // temporary
  var Game1 = function () {
    this.name = 'sample-game-1';
    this.label = 'Sample Game #1';
  };
  Game1.prototype = Object.create(Game.prototype);
  Game1.prototype.constructor = Game1;

  // this shows how to call a super-method
  Game1.prototype.css = function () {
    // do the unholy javascript prototype dance
    var game = Object.getPrototypeOf(this);
    var css = Object.getPrototypeOf(game).css.call(this);
    // add something
    return css + '#' + this.name + '{color:blue}';
  };

  var Game2 = function () {
    this.name = 'sample-game-2';
    this.label = 'Sample Game #2';
  };
  Game2.prototype = Object.create(Game.prototype);
  Game2.prototype.constructor = Game2;

  // create a new game interface.
  var gameInterface = new GameInterface({
    'output': document.getElementById('output'),
    'games': [new Game1(), new Game2(), new Blackjack()],
    'bets': new Chips(144)
  });

});
