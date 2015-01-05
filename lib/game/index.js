/**
 * @file game.js
 * This game provides a base class for a Game.
 *
 * Each game must implement the following routines
 * - init will initialize the game, i.e. make elements visible.
 * - output returns DOM elements required for the game.
 * - css returns a string of any additional css required.
 * - fin will finish the game, i.e. make elements invisible.
 * Also the following properties must be set:
 * - name - a machine-readable name of the game
 * - label - a human-readable name of the game.
 * ...
 * To pass validation, implementors must set the prototype to new Game
 * e.g.,
 * function MyGame(){}
 * MyGame.prototype = new Game();
 * games.push[ new MyGame() ]
 *
 * When added to the GameInterface, a game is given the following references:
 * - bets: reference the bet object.
 * This reference can be used to solicit bets from the user before the game starts.
 * @see Game.prototype.start
 */

'use strict';

require('./styles');

var events = require('./events');

/**
 * @summary Base class for Games.
 * @constructor Game
 * @description Provides some examples of how to work within the system.
 */
var Game = module.exports = function Game () {
  this.name = 'sample-game';
  this.label = 'Sample Game';
};

/**
 * @function Game.toString
 * @instance
 * @description Overwrite toString function to make identification easier.
 * @returns {string} Name of the string.
 */
Game.prototype.toString = function () {
  return 'Game [' + this.name + ']';
};

/**
 * @function Game.init
 * @instance
 * @description Perform initializations - make elements display:block
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
 * @function Game.fin
 * @instance
 * @description Perform cleanup - make all elements invisible
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
 * @function Game.start
 * @instance
 * @description jQuery click event handler. Sets up the game's user interface on the board.
 * @param {event} e event data. e.data.game contains a reference to [this]
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
 * @function Game.end
 * @instance
 * @description This cleans up once the user is finished.
 *  - e.data.game contains a reference to [this]
 *  - e.data.winning is a boolean indicating the result of the game.
 * @param {boolean} winning whether the user won or not.
 */
Game.prototype.end = function (winning) {
  this.bets.win(winning);
  this.game.restart();
  $('.status').prepend( winning ? 'You win! ' : 'You lose... ' );
};

/**
 * @function Game.output
 * @instance
 * @description Provides the user interface for the game.
 * @returns {string} HTML for game container.
 */
Game.prototype.output = function () {
  return require('./markup')({
    'name': this.name,
    'label': this.label
  });
};

/**
 * @function Game.prototype.css
 * @instance
 * @description This css is added to the page and is used to render the game
 * @returns {string} css to use.
 */
Game.prototype.css = function () {
  var css = '';
  return css;
};
