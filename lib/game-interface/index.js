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

var locale = require('../util/locale');
var Util = require('../util');
var Bets = require('../bets');
var Game = require('../game');

require('./styles');

locale.load({
  'en': require('./locale/en.json'),
  'fr': require('./locale/fr.json')
});

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
 * @alias GameInterface
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

  // iterate over the games array and ensure the bets reference exists.
  // this occurs above output because the output functions require bets being present.
  this.games.forEach(function (game) {
    game.bets = this.bets;
  }, this);

  // Add styles for both bets and all games.
  this.games.concat(this.bets).forEach(function (item) {
    var css = item.css();
    if (css === '') { return; }

    var id = (item instanceof Game ? 'game' : 'bet') + '-css--' + item.name;
    var $styles = $('#' + id);
    if ($styles.size() === 0) {
      $('head').append('<style type="text/css" id="' + id + '">' + css + '</style>');
    }
    else {
      $styles.html(css);
    }
  });

  var html = require('./markup')({
    '__': locale.__,
    'games': this.games,
    'bets': this.bets
  });
  var events = require('./events');

  $(this.output).append(html);
  $(this.output).on('click', '#game-starter', {'game-interface': this}, events.startGame);
  $(this.output).on('click', '#game-ender', {'game-interface': this}, events.endGame);
  $('#game-choose').removeClass('playing');
  $('#game-choose').addClass('choosing');
  this.bets.update(); // todo, rethink this
}

/**
 * Starts a game. Fires the game's {@link Game#init|init} function.
 * @param {string} game The id of the game to start.
 */
GameInterface.prototype.start = function (game) {
  $('#game-choose').removeClass('choosing');
  $('#game-choose').addClass('playing');
  var sel = this.games.filter(function (item) {return item.name === game;});
  this.current = sel[0];
  this.current.init();
};

/**
 * Ends a game. Fires the game's {@link Game#fin|fin} function.
 */
GameInterface.prototype.end = function () {
  $('#game-choose').removeClass('playing');
  $('#game-choose').addClass('choosing');
  this.current.fin();
  this.bets.abort();
  delete this.current;
};
