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

module.exports = Game;

/**
 * Base class for Games.
 * @class
 * @alias Game
 * @abstract
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
 * @param {string} output additional html to render.
 * @returns {string} HTML for game container.
 */
Game.prototype.output = function (output) {
  return require('./markup')({
    'name': this.name,
    'label': this.label,
    'bets': this.bets,
    'output': output
  });
};

/**
 * Dynamic css required to render the game
 * @returns {string} css to use.
 */
Game.prototype.css = function () {
  return '';
};
