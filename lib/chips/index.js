/**
 * @module lib/chips
 * @description Fancier interface to work with bets.
 */
'use strict';

var locale = require('../util/locale');
var Bets = require('../bets');
var events = require('./events');
var Util = require('../util');

require('./styles');

module.exports = Chips;

locale.load({
  'en': require('./locale/en.json'),
  'fr': require('./locale/fr.json')
});

/**
 * @class
 * @alias Chips
 * @augments Bets
 * @param {number} [initial=100] winnings value to start with
 */
function Chips(initial) {
  this.winningsContainer = '#winnings-interrface';
  this.name = 'chips';
  this.winnings = initial || 100;
  this.types = [
    { 'value': 1, 'cssColor': '#000', 'cssBackground': '#ccc', 'selectedBackground': 'yellow' },
    { 'value': 5, 'cssColor': '#000', 'cssBackground': '#c00', 'selectedBackground': 'yellow' },
    { 'value': 25, 'cssColor': '#000', 'cssBackground': '#0c0', 'selectedBackground': 'yellow' },
    { 'value': 100, 'cssColor': '#fd0', 'cssBackground': '#222', 'selectedBackground': 'yellow' }
  ];
  this.stacks = {};
  this.types.forEach(function (e) {
    this.stacks[e.value] = 0;
  }, this);
  this.split(this.winnings);
  /**
   * When a dragging operation occurs, this reference is set.
   * @type {DomElement}
   */
  this.dragSrc = null;
}


Chips.prototype = Object.create(Bets.prototype);
Chips.prototype.constructor = Chips;

/**
 * Creates a DIV element for the stack.
 * @param {number} value the value of the stack.
 * @param {number} [count=0] the number of chips in the stack
 * @returns {DomNode} dom node for the stack.
 */
Chips.prototype.createStack = function (value, count) {
  count = count || 0;
  return '<div class="stack" data-value="' + value + '" data-count="' + count + '"></div>';
};

/**
 * Takes a value and splits into a series of chips
 * @param {number} amount winnings to split between stacks.
 */
Chips.prototype.split = function (amount) {
  this.types
    .sort(function (a, b) {
      return b.value - a.value;
    })
    .forEach(function (element) {
      while (amount >= element.value) {
        this.stacks[element.value]++;
        amount -= element.value;
      }
    }, this);
};

/**
 * Updates the user interface with current values.
 */
Chips.prototype.update = function () {
  var self = this;
  var stacks = this.stacks; // jquery provides no [this] context in .each

  // verify a stack exists for each value, if no create it.
  Util.forEach(stacks, function (count, value) {
    var $stack = $('.stack[data-value=' + value + ']', this.winningsContainer);
    if ($stack.size() === 0) {
      // if the stack doesn't exit, create and append it - make sure it's draggable
      $(self.createStack(value, 0)).appendTo($('.stack-group', this.winningsContainer));
    }
  }, this);

  var $stacks = $('.stack');

  // update the data-count attribute with internal stack count
  $stacks.each(function () {
    $(this).attr('data-count', stacks[$(this).attr('data-value')]);
  });

  // perform css fixes assuming the new values
  this.fix($stacks);
};

/**
 * Performs fixes for things that can't be done with static CSS
 * There is a magic number used throughout this, 9 -- it is the height of a chip.
 * @param {*} els jQuery of '.stack' elements to fix
 */
Chips.prototype.fix = function (els) {

  // fix up the heights of the elements based on data-count
  els.each(function () {
    // set up the height based on count, and add the date-value to an inner span.
    $(this).css('height', ($(this).attr('data-count') - 1) * 9 + 'px')
      .html('<span class="value">' + $(this).attr('data-value') + '</span>');
  });
};

/**
 * Performs fixes to stack groups that can't be done with static CSS
 * Magic number 9 is height of chip, 30 is "just right" for proper height
 * @param {*} stackGroups jQuery of '.stack-group' elements to fix
 */
Chips.prototype.fixStackGroups = function (stackGroups) {
  stackGroups.each(function () {
    var chipCount = 0;
    $('.stack', this).each(function () {
      var $stack = $(this);
      var index = $stack.index();
      $(this)
        .css('top', index * 9 + 'px')
        .css('zIndex', 100 - index);
      chipCount += parseInt($stack.attr('data-count'));
    });
    $(this).css('height', 30 + chipCount * 9 + 'px');
  });
};


/**
 * Called by games to solicit the current bet from the user.
 * @param {function} callback Function to call once a valid bet has been set.
 * @param {string} gameId id of the game to start
 */
Chips.prototype.start = function (callback, gameId) {
  this.betsContainer = '#bets-interface--' + gameId;
  $(this.betsContainer + ',' + this.winningsContainer)
    .on('dragstart', '.stack', {'bets': this}, events.chipDragStart)
    .on('dragenter', '.stack-group', {'bets': this}, events.chipDragEnter)
    .on('dragleave', '.stack-group', {'bets': this}, events.chipDragLeave)
    .on('drop', '.stack-group', {'bets': this}, events.chipDragDrop)
    .on('dragover', '.stack-group', {'bets': this}, events.chipDragOver)
    .on('dragend', '.stack', {'bets': this}, events.chipDragEnd)
    .find('.stack').attr('draggable', true);
  this.targets = $('.spot', this.betsContainer).addClass('stack-group');
  this.callback = callback;
};

/**
 * Used to signify a bet has been set. Must call {@link Bets#callback|callback} set in {@link Bets#start|start}.
 */
Chips.prototype.finish = function () {
  var self = this;
  var total = 0;
  this.targets.each(function () {
    $(this).children().each(function () {
      var $item = $(this);
      var count = parseInt($item.data('count'), 10);
      var value = parseInt($item.data('value'), 10);
      self.stacks[value] -= count;
      total += count * value;
    });
  });

  if (total === 0) {
    locale.inline($('.status', this.betsContainer), 'chips.errors.empty-bet');
  }
  else {
    this.currentBet = total;
    this.callback();
    this.clean();
  }
};

/**
 * Called by GamesInterface, signifies the user has won (or lost)
 * @param {boolean} winning identifies whether user won or not.
 */
Chips.prototype.win = function (winning) {
  this.winnings += (winning ? 2 : 0) * this.currentBet;
  if (winning) {
    this.split( this.currentBet * 2);
  }
  this.currentBet = null;
  this.update();
};

/**
 * Called when a user leaves the game with a pending bet operation.
 */
Chips.prototype.abort = function () {
  this.currentBet = null;
  this.clean();
};


/**
 * Performs cleanup of properties/listeners after a finish or abort.
 */
Chips.prototype.clean = function () {
  $('.stack').attr('draggable', false);
  $(this.betsContainer + ',' + this.winningsContainer)
    .off('dragstart', '.stack', events.chipDragStart)
    .off('dragenter', '.stack-group', events.chipDragEnter)
    .off('dragleave', '.stack-group', events.chipDragLeave)
    .off('drop', '.stack-group', events.chipDragDrop)
    .off('dragover', '.stack-group', events.chipDragOver)
    .off('dragend', '.stack', events.chipDragEnd);
  if (this.betsContainer !== null) {
    $('.stack', this.betsContainer).remove();
    this.betsContainer = null;
  }
  this.callback = null;
  this.targets = null;
};

/**
 * Provides user interface for the GameInterface
 * @param {string} gameMarkup additional markup given by a game
 * @param {string} gameId name of the game.
 * @returns {string} html for the bet interface
 */
Chips.prototype.bets = function (gameMarkup, gameId) {
  var html = require('./bets')({
    '__': locale.__,
    'id': '#bets-interface--' + gameId,
    'output': gameMarkup
  });
  return html;
};

Chips.prototype.winningsMarkup = function () {
  var html = require('./winnings')({
    '__': locale.__,
    'id': this.winningsContainer,
    'stacks': this.types.map(function (v) {
      return this.createStack(v.value, 0);
    }, this)
  });
  return html;
};

/**
 * Provide dynamic css styling for the betting interface.
 * @returns {string} css
 */
Chips.prototype.css = function () {
  return this.types.map(function (element) {
    return [
      '\n.stack[data-value="' + element.value + '"],',
      '\n.stack[data-value="' + element.value + '"]:after,',
      '\n.stack[data-value="' + element.value + '"]:before { ',
      '\n  background-color: ' + element.cssBackground + ';',
      '\n  color: ' + element.cssColor + ';',
      '\n}',
      '\n.stack[data-value="' + element.value + '"].selected,',
      '\n.stack[data-value="' + element.value + '"].selected:after,',
      '\n.stack[data-value="' + element.value + '"].selected:before { ',
      '\n  background-color: ' + element.selectedBackground + ';',
      '\n}'
    ].join('');
  }).join('');
};
