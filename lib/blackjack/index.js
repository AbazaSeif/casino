'use strict';

/**
 * @module lib/blackjack
 * @description Blackjack
 */

var locale = require('../util/locale');
var Game = require('../game');
var Deck = require('../util/deck');

var events = require('./events');
require('./styles');

locale.load({
  'en-CA': require('./locale/en-CA.json'),
  'fr-CA': require('./locale/fr-CA.json')
});

module.exports = Blackjack;

var SHOE_SIZE = 6;


/**
 * @class
 * @alias Blackjack
 * @augments Game
 */
function Blackjack() {
  this.name = 'blackjack';
  // get the superclass and save for later.
  var blackjack = Object.getPrototypeOf(this);
  this.game = Object.getPrototypeOf(blackjack);
  this.shoe = Array.populate(SHOE_SIZE, function () { return new Deck(); });
}

Blackjack.prototype = Object.create(Game.prototype);
Blackjack.prototype.constructor = Blackjack;

/**
 * Perform initializations - attach events
 */
Blackjack.prototype.init = function () {
  this.game.init.call(this);
  var self = this;
  this.bets.start(function () {
    $(self.container).removeClass('betting').addClass('playing');
    self.start();
  }, this.name);
  $(this.container)
    .addClass('betting')
    .on('click', '#hit', {'game': this}, events.hit)
    .on('click', '#stand', {'game': this}, events.stand)
    .on('click', '#double', {'game': this}, events.double)
    .on('click', '#surrender', {'game': this}, events.surrender)
    .on('click', '#insurance', {'game': this}, events.insurance)
    .on('click', '#split', {'game': this}, events.split);
};

/**
 * Perform cleanup - make all elements invisible
 */
Blackjack.prototype.fin = function () {
  $(this.container)
    .removeClass('insurable')
    .removeClass('playing')
    .off('click', events.hit)
    .off('click', events.stand)
    .off('click', events.double)
    .off('click', events.surrender)
    .off('click', events.insurance)
    .off('click', events.split);
  this.game.fin.call(this);
};

/**
 * Provides the user interface for the game.
 * @returns {string} HTML for game container.
 */
Blackjack.prototype.output = function () {
  var gameMarkup = require('./markup')({
    '__': locale.__,
    'id': this.name
  });
  var betMarkup = require('./bets')({
    '__': locale.__
  });
  var betsMarkup = this.bets.bets(betMarkup, this.name);
  return this.game.output.call(this, gameMarkup, betsMarkup);
};

/**
 * Dynamic css required to render the game
 * @returns {string} css to use.
 */
Blackjack.prototype.css = function () {
  return '';
};

/**
 * Deals cards for the dealer and initial cards to users.
 */
Blackjack.prototype.start = function () {
  $(this.container)
    .removeClass('insurable')
    .removeClass('hitable')
    .removeClass('doublable')
    .removeClass('splittable');

  var dealerStack = $(this.container).find('.row.dealer .card-stack');
  dealerStack.append(this.shoe.random(false).getBlank());
  dealerStack.append(this.shoe.random(false).get());

  var userStack = $(this.container).find('.row.user .card-stack');
  userStack.append(this.shoe.random(false).get());
  userStack.append(this.shoe.random(false).get());

  var userCards = userStack.find('.card');

  if (isBlackjack(userStack)) {
    // this hand is finished, dealer can go.
  }
  else {
    // special conditions
    if (dealerStack.find('[data-value="Ace"]').size() > 0) {
      $(this.container).addClass('insurable');
    }

    if (userCards[0].dataset.value === userCards[1].dataset.value) {
      $(this.container).addClass('splittable');
    }

  }


};

/**
 * Performs checks on current cards to enable/disable buttons.
 */
Blackjack.prototype.step = function () {

};

/**
 * Once user is finished, dealer does their deal.
 */
Blackjack.prototype.dealer = function () {

};

function isBlackjack (stack) {
  return stack.find('[data-value="Ace"]').size() > 0 && stack.find('[data-value="King"], [data-value="Queen"], [data-value="Jack"], [data-value="Ten"]').size() > 0;
}
