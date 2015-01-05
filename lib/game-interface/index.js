/**
 * @module lib/game-interface
 * @description This file provides the idea of the 'Game Interface'
 * Each game shows up on the select box and the user is allowed to choose one.
 * Once started, a game creates itself and once finished, performs any cleanup.
 * In addition to the games, a bets object is also required - this keeps track of chips.
 * For more information on either of these @see bets.js, game.js
 * @todo rework to use classes over IDs.
 * @requires lib/util
 * @requires lib/game
 * @requires lib/bets
 */
'use strict';

var Util = require('../util');
var Bets = require('../bets');
var Game = require('../game');

require('./styles');

module.exports = GameInterface;

/**
 * @typedef {Object} GameInterfaceOptions
 * @description Associative array of the options that make up the game, including:
 * @param {DOMElement} output element the user interface is attached to.
 * @param {Array<Game>} games array of objects that inhert from Game.
 * @param {Bets} bets Object that inherits from Bets
*/

/**
 * @class
 * @summary Provides a user interface to start and stop games.
 * @see {lib/game}
 * @see {lib/bets}
 * @param {GameInterfaceOptions} opts options to use.
 */
function GameInterface (opts) {

  Util.functionValidation(this, opts, [
    {'name': 'output', 'type': HTMLElement},
    {'name': 'games', 'type': Array, 'arrayType': Game},
    {'name': 'bets', 'type': Bets}
  ]);

  // set this up for the jQuery callbacks below
  //var gameInterface = this;

  // iterate over the games array and ensure the bets reference exists.
  // this occurs above output because the output functions require bets being present.
  this.games.forEach(function (game) {
    game.bets = this.bets;
  }, this);

  // Add styles for both bets and all games.
  Array.prototype.concat(this.games, this.bets).forEach(function (element) {
    var id = (element instanceof Game ? 'game' : 'bet') + '--' + element.name;
    var $styles = $('#' + id);
    var css = element.css();
    if (css === '') { return; }
    if ($styles.size() === 0) {
      $('head').append('<style type="text/css" id="' + id + '">' + css + '</style>');
    }
    else {
      $styles.html(css);
    }
  });

  var html = require('./markup')({'games': this.games});
  var events = require('./events');

  $(this.output).append(html).append(this.bets.output());
  $(this.output).on('click', '#game-starter', {'game': this}, events.startGame);
  $(this.output).on('click', '#game-ender', {'game': this}, events.endGame);
  $('#game-choose').removeClass('playing');
  $('#game-choose').addClass('choosing');
  this.bets.update(); // todo, rethink this
}

GameInterface.prototype.start = function (game) {
  $('#game-choose').removeClass('choosing');
  $('#game-choose').addClass('playing');
  var sel = this.games.filter(function (item) {return item.name === game;});
  this.current = sel[0];
  this.current.init();
};

GameInterface.prototype.end = function () {
  $('#game-choose').removeClass('playing');
  $('#game-choose').addClass('choosing');
  this.current.fin();
  this.bets.abort();
  delete this.current;
};
