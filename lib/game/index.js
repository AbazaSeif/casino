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

require('./styles');
module.exports = Game;

var events = require('./events');

/**
 * Base class for Games.
 * @class
 * @description Provides some examples of how to work within the system.
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
  $(this.container).on('click', '.start-game', {'game': this}, events.start);
  $(this.container).on('click', '.win-game', {'game': this}, events.win);
  $(this.container).on('click', '.lose-game', {'game': this}, events.lose);
  $(this.container).on('click', '.finish-bet', {'game': this}, events.finishBet);
  $(this.container).addClass('init');
  this.restart();
};

/**
 * Perform cleanup - make all elements invisible
 */
Game.prototype.fin = function () {
  $(this.container).off('click', '.start-game', events.start);
  $(this.container).off('click', '.win-game', events.win);
  $(this.container).off('click', '.lose-game', events.lose);
  $(this.container).off('click', '.finish-bet', events.finishBet);
  $(this.container).removeClass('bust');
  $(this.container).removeClass('init');
  $(this.container).removeClass('playing');
};

/**
 * Called before each game has started.
 */
Game.prototype.restart = function () {
  var bust = this.bets.winnings === 0;
  $(this.container).removeClass('playing').toggleClass('bust', bust);
  $('.status').html( bust ? 'You have no money - get out of here you lazy bum!' : 'Press start to continue');
};

/**
 * Sets up the game's user interface on the board.
 */
Game.prototype.start = function () {
  var self = this;
  $(this.container).addClass('betting');
  $('.status').html('Drag chips here and press Finish.');

  // let the bets interface know we are waiting for a bet
  // when it's finished make the game's interface visible
  this.bets.start( function () {
    $(self.container)
      .removeClass('betting')
      .addClass('playing');

    $('.status', self.container)
      .html('Current bet is ' + self.bets.currentBet);

  }, $('.spot', this.container) );
};

/**
 * Notifies user of results and applies changes to winnings.
 * @param {boolean} winning whether the user won or not.
 */
Game.prototype.end = function (winning) {
  this.bets.win(winning);
  this.game.restart();
  $('.status').prepend( winning ? 'You win! ' : 'You lose... ' );
};

/**
 * Provides the user interface for the game.
 * @returns {string} HTML for game container.
 */
Game.prototype.output = function () {
  return require('./markup')({
    'name': this.name,
    'label': this.label
  });
};

/**
 * Dynamic css required to render the game
 * @returns {string} css to use.
 */
Game.prototype.css = function () {
  var css = '';
  return css;
};
