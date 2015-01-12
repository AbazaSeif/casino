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

var locale = require('../util/locale');
var Game = require('../game');
require('./styles');
module.exports = SampleGame;

locale.load({
  'en': require('./locale/en.json'),
  'fr': require('./locale/fr.json')
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
  $(this.container).on('click', '.start-game', {'game': this}, events.start);
  $(this.container).on('click', '.win-game', {'game': this}, events.win);
  $(this.container).on('click', '.lose-game', {'game': this}, events.lose);
  $(this.container).on('click', '.finish-bet', {'game': this}, events.finishBet);
  this.restart();
};

/**
 * Perform cleanup - make all elements invisible
 */
SampleGame.prototype.fin = function () {
  $(this.container).removeClass('bust');
  $(this.container).removeClass('playing');
  $(this.container).off('click', '.start-game', events.start);
  $(this.container).off('click', '.win-game', events.win);
  $(this.container).off('click', '.lose-game', events.lose);
  $(this.container).off('click', '.finish-bet', events.finishBet);
  this.game.fin.call(this);
};

/**
 * Called before each game has started.
 */
SampleGame.prototype.restart = function () {
  var bust = this.bets.winnings === 0;
  $(this.container).removeClass('playing').toggleClass('bust', bust);
  locale.inline($('.status'), bust ? 'sample-game.bust' : 'sample-game.start');
};

/**
 * Sets up the game's user interface on the board.
 */
SampleGame.prototype.start = function () {
  var self = this;
  $(this.container).addClass('betting');
  locale.inline($('.status'), 'sample-game.bet-instructions');

  // let the bets interface know we are waiting for a bet
  // when it's finished make the game's interface visible
  this.bets.start( function () {
    $(self.container)
      .removeClass('betting')
      .addClass('playing');

    locale.inline($('.status'), 'sample-game.bet-count', self.bets.currentBet);
  }, $(this.container + ' .spot'));
};

/**
 * Notifies user of results and applies changes to winnings.
 * @param {boolean} winning whether the user won or not.
 */
SampleGame.prototype.end = function (winning) {
  this.bets.win(winning);
  this.restart();
  locale.inline($('.status'), winning ? 'sample-game.win' : 'sample-game.lose');
};

/**
 * Provides the user interface for the game.
 * @returns {string} HTML for game container.
 */
SampleGame.prototype.output = function () {
  var markup = require('./markup')({
    '__': locale.__
  });
  return this.game.output.call(this, markup);
};

/**
 * Dynamic css required to render the game
 * @returns {string} css to use.
 */
SampleGame.prototype.css = function () {
  var css = '';
  return css;
};
