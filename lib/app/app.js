/**
 * @module lib/app
 * @summary Main script file for index.htm
 * @requires lib/util
 * @requires lib/chips
 * @requires lib/game-interface
 * @requires lib/game
 * @requires lib/blackjack
 * @requires lib/hilow
 */
'use strict';

require('../util').once();

var __ = require('../util/locale');
__.init();
__.load({
  'en-CA': require('./locale/en-CA.json'),
  'fr-CA': require('./locale/fr-CA.json')
});

require('./styles');

document.body.innerHTML = require('./markup')({ '__': __ });

$('a.lng-change').click(function () {
  __.update(this.dataset.lng);
  $('#page-title').__('casino.name').letterize();
});

$('#page-title').letterize();

var SampleGame = require('../sample-game');
var GameInterface = require('../game-interface');
var Chips = require('../chips');
var Blackjack = require('../blackjack');
var HiLow = require('../hilow');

var noJs = document.getElementsByClassName('no-js');
for (var x = noJs.length - 1; x >= 0; x -= 1) {
  noJs[x].classList.remove('no-js');
}

var sampleGame1 = new SampleGame();
sampleGame1.name = 'sample-game-1';
sampleGame1.label = 'Sample Game #1';

var sampleGame2 = new SampleGame();
sampleGame2.name = 'sample-game-2';
sampleGame2.label = 'Sample Game #2';
sampleGame2.css = function () {
  var game = Object.getPrototypeOf(this);
  var css = game.css.call(this);
  return css + '#' + this.name + '{color:blue}';
};

// create a new game interface.
var gameInterface = new GameInterface({
  'output': document.getElementById('output'),
  'games': [
    sampleGame1,
    sampleGame2,
    new Blackjack(),
    new HiLow()
  ],
  'bets': new Chips(144)
});

__.update(i18n.lng());
