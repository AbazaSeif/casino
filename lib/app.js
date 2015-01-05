/**
 * @module app
 * @summary Main script file for index.htm
 * @requires lib/chips
 * @requires lib/game-interface
 * @requires lib/game
 * @requires lib/blackjack
 */
'use strict';

var SampleGame = require('./sample-game');
var GameInterface = require('./game-interface');
var Chips = require('./chips');
var Blackjack = require('./blackjack');

require('./styles/app');

window.addEventListener('DOMContentLoaded', function () {

  var noJs = document.getElementsByClassName('no-js');
  for (var x = noJs.length - 1; x >= 0; x -= 1) {
    noJs[x].classList.remove('no-js');
  }

  var sampleGame1 = new SampleGame();
  sampleGame1.name = 'sample-game-1';
  sampleGame1.label = 'Sample Game #1';

  var sampleGame2 = new SampleGame();
  sampleGame2.name = 'sample-game-1';
  sampleGame2.label = 'Sample Game #1';
  sampleGame2.css = function () {
    var game = Object.getPrototypeOf(this);
    var css = game.css.call(this);
    return css + '#' + this.name + '{color:blue}';
  };

  // create a new game interface.
  var gameInterface = new GameInterface({
    'output': document.getElementById('output'),
    'games': [sampleGame1, sampleGame2, new Blackjack()],
    'bets': new Chips(144)
  });

});
