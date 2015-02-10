
/**
 * @modules util/deck
 * @requires util/sprite
 */
'use strict';

module.exports = Deck;

var Sprite = require('./sprite');


function Deck() {
  this.cards = new Sprite({
    'filename': 'img/card-deck.png',
    'blankFile': 'img/blank.png',
    'id': 'card',
    'row_height': 153,
    'col_width': 97,
    'row_id': 'suit',
    'col_id': 'value',
    'col_data': ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King'],
    'row_data': ['Clubs', 'Diamonds', 'Hearts', 'Spades']
  });

  this.reset();
}

Deck.prototype.reset = function () {
  this.deck = this.cards.get();
  $('.card').remove();
};

Deck.prototype.get = function () {
  return this.deck.random();
};

Deck.prototype.getBlank = function () {
  return this.cards.blank();
};

Deck.prototype.revealBlank = function () {
  var self = this;
  $('.card.blank').each(function () {
    $(this).replaceWith(self.deck.random());
  });
};
