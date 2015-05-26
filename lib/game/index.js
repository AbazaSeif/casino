/**
 * @module lib/game
 * @description This game provides a base class for a Game.
 * When added to a game interface, the game is given a references to {Bets}{@see module:lib/bets}
 * This can be used to solicit bets from the user before the game starts.
 * @example
 * var Game = require('lib/game');
 * function MyGame(){
 *  this.name = 'my-game';
 *  this.label = 'My Game';
 * }
 * MyGame.prototype = Object.create(Game.prototype);
 * MyGame.prototype.constructor = MyGame;
 * var interface = require('lib/game-interface')(...);
 * interface.push[ new MyGame() ]
 */

'use strict';

var __ = require('../util/locale');
require('./styles');
module.exports = Game;

/**
 * Base class for Games.
 * @class
 * @alias Game
 * @abstract
 * @example
 * // sample implementation
 * function NewGame() {
 *   var newGame = Object.getPrototypeOf(this);
 *   this.game = Object.getPrototypeOf(newGame);
 * }
 *
 * NewGame.prototype = Object.create(Game.prototype);
 * NewGame.prototype.constructor = NewGame
 *
 * NewGame.prototype.init = function () {
 *   this.game.init.call(this);
 * }
 *
 * NewGame.prototype.fin = function () {
 *   this.game.fin.call(this);
 * }
 *
 * NewGame.prototype.output = function () {
 *   this.game.output.call(this, "string");
 * }
 */
function Game () {
  this.name = 'sample-game';
  this.label = 'Sample Game';
}

/**
 * Overwrite toString function to make identification easier.
 * @returns {string} Name of the string.
 */
Game.prototype.toString = function () {
  return 'Game [' + this.name + ']';
};

/**
 * Perform initializations - attach events
 */
Game.prototype.init = function () {
  this.container = '#game-container--' + this.name;
  $(this.container).addClass('init');
};

/**
 * Perform cleanup - make all elements invisible
 */
Game.prototype.fin = function () {
  $(this.container).removeClass('init');
};

/**
 * Provides the user interface for the game.
 * @param {string} gameMarkup html to render for the game.
 * @param {string} betsMarkup html to render for betting interface.
 * @returns {string} HTML for game container.
 */
Game.prototype.output = function (gameMarkup, betsMarkup) {
  return require('./markup')({
    'name': this.name,
    'label': this.label,
    'betsMarkup': betsMarkup,
    'gameMarkup': gameMarkup,
    '__': __
  });
};

/**
 * Dynamic css required to render the game
 * @returns {string} css to use.
 */
Game.prototype.css = function () {
  return '';
};
