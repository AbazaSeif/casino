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
var Game = require('../game');
require('./styles');
module.exports = SampleGame;

__.load({
  'en-CA': require('./locale/en-CA.json'),
  'fr-CA': require('./locale/fr-CA.json')
});

var events = require('./events');

/**
 * Base class for Games.
 * @class
 * @alias SampleGame
 * @augments Game
 * @description Provides some examples of how to work within the system.
 */
function SampleGame () {
  this.name = 'sample-game';
  var sampleGame = Object.getPrototypeOf(this);
  this.game = Object.getPrototypeOf(sampleGame);
}

SampleGame.prototype = Object.create(Game.prototype);
SampleGame.prototype.constructor = SampleGame;

/**
 * Overwrite toString function to make identification easier.
 * @returns {string} Name of the string.
 */
SampleGame.prototype.toString = function () {
  return 'Game [' + this.name + ']';
};

/**
 * Perform initializations - attach events
 */
SampleGame.prototype.init = function () {
  this.game.init.call(this);
  this.$status = $('#' + this.name + '--status');
  $(this.container)
    .on('click', '.start-game', {'game': this}, events.start)
    .on('click', '.win-game', {'game': this}, events.win)
    .on('click', '.lose-game', {'game': this}, events.lose);
  this.restart();
};

/**
 * Perform cleanup - make all elements invisible
 */
SampleGame.prototype.fin = function () {
  $(this.container)
    .removeClass('bust')
    .removeClass('playing')
    .off('click', '.start-game', events.start)
    .off('click', '.win-game', events.win)
    .off('click', '.lose-game', events.lose);
  this.game.fin.call(this);
};

/**
 * Called before each game has started.
 */
SampleGame.prototype.restart = function () {
  var bust = this.bets.winnings === 0;
  $(this.container)
    .removeClass('playing')
    .toggleClass('bust', bust);
    this.$status.__(bust ? 'sample-game.bust' : 'sample-game.start');
};

/**
 * Sets up the game's user interface on the board.
 */
SampleGame.prototype.start = function () {
  var self = this;
  var status = this.$status;
  $(this.container).addClass('betting');

  // let the bets interface know we are waiting for a bet
  // when it's finished make the game's interface visible
  this.bets.start(status, function () {
    $(self.container)
      .removeClass('betting')
      .addClass('playing');
  }, this.name);
};

/**
 * Notifies user of results and applies changes to winnings.
 * @param {boolean} winning whether the user won or not.
 */
SampleGame.prototype.end = function (winning) {
  this.bets.win(winning);
  this.restart();
  this.$status.__(winning ? 'sample-game.win' : 'sample-game.lose');
};

/**
 * Provides the user interface for the game.
 * @returns {string} HTML for game container.
 */
SampleGame.prototype.output = function () {
  var gameMarkup = require('./markup')({'__': __, 'id': this.name});
  var betMarkup = require('./bets')({'__': __});
  var betsMarkup = this.bets.bets(betMarkup, this.name);
  return this.game.output.call(this, gameMarkup, betsMarkup);
};

/**
 * Dynamic css required to render the game
 * @returns {string} css to use.
 */
SampleGame.prototype.css = function () {
  var css = '';
  return css;
};
