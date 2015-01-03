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

var $ = require('jquery');

require('./styles');

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
  var bust = this.bets.winnings === 0;
  $(this.container)
    .removeClass('playing')
    .toggleClass('bust', bust);
  $('.status', this.container)
    .html( bust ? 'You have no money - get out of here you lazy bum!' : 'Press start to continue');
};

/**
 * @function Game.fin
 * @instance
 * @description Perform cleanup - make all elements invisible
 */
Game.prototype.fin = function () {
  $(this.container)
    .removeClass('bust');
};

/**
 * @function Game.start
 * @instance
 * @description jQuery click event handler. Sets up the game's user interface on the board.
 * @param {event} e event data. e.data.game contains a reference to [this]
 */
Game.prototype.start = function (e) {
  var game = e.data.game;
  var container = game.container;
  var bets = game.bets;

  $(container)
    .addClass('betting');

  $('.status', container)
    .html('Drag chips here and press Finish.');

  // let the bets interface know we are waiting for a bet
  // when it's finished make the game's interface visible
  bets.start( function () {

    $(container)
      .removeClass('betting')
      .addClass('playing');

    $('.status', container)
      .html('Current bet is ' + bets.currentBet);

  }, $('.spot', container) );

};

/**
 * @function Game.end
 * @instance
 * @description This cleans up once the user is finished.
 * @param {event} e Event Data.
 *  - e.data.game contains a reference to [this]
 *  - e.data.winning is a boolean indicating the result of the game.
 */
Game.prototype.end = function (e) {
  var winning = e.data.winning;
  var game = e.data.game;
  var bets = game.bets;

  bets.win(winning);
  game.init();

  $('.status', game.container)
    .prepend( winning ? 'You win! ' : 'You lose... ' );
};

/**
 * @function Game.output
 * @instance
 * @description Provides the user interface for the game.
 * @returns {DOMElement} Container for the game.
 */
Game.prototype.output = function () {
  var game = this;
  var $game = $('<fieldset class="game" id="' + this.name + '"></fieldset>')
    .append('<legend>' + this.label + '</legend>')
    .append( function () {
      var ret = $('<div class="commands"></div>')
        .append('<span class="status"></span>')
        .append($('<button class="start">Start</button>').click({'game': game}, game.start));
      return ret;
    })
    .append( function () {
      var ret = $('<div class="interface"></div>')
        .append($('<button>Win</button>').click({'game': game, 'winning': true}, game.end))
        .append($('<button>Lose</button>').click({'game': game, 'winning': false}, game.end));
      return ret;
    })
    .append( function () {
      var ret = $('<div class="bet-interface"></div>')
        .append('<div class="spot"></div>')
        .append('<div class="spot"></div>')
        .append('<div class="spot"></div>')
        .append('<div class="spot"></div>')
        .append($('<button>Finish</button>').click({'game': game}, game.bets.finish));
      return ret;
    });
  this.container = $game[0];
  return this.container;
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
