/**
 * @module lib/chips
 * @description Fancier interface to work with bets.
 */
'use strict';

var Bets = require('../bets');
var events = require('./events');

require('./styles');

/**
 * @class
 * @param {number} initial initial winnings value to start with
 */
function Chips(initial) {
  this.name = 'chips';
  this.winnings = initial || 100;
  this.types = [
    { 'value': 1, 'cssColor': '#000', 'cssBackground': '#ccc', 'selectedBackground': 'yellow' },
    { 'value': 5, 'cssColor': '#000', 'cssBackground': '#c00', 'selectedBackground': 'yellow' },
    { 'value': 25, 'cssColor': '#000', 'cssBackground': '#0c0', 'selectedBackground': 'yellow' },
    { 'value': 100, 'cssColor': '#fd0', 'cssBackground': '#222', 'selectedBackground': 'yellow' }
  ];
  this.chipStacks = $(this.types.map(function (v) {
    return this.createStack(v.value, 0);
  }), this);
  this.stacks = {};
  this.types.forEach(function (e) {
    this.stacks[e.value] = 0;
  }, this);
  this.split(this.winnings);
}

module.exports = Chips;

Chips.prototype = Object.create(Bets.prototype);
Chips.prototype.constructor = Chips;

/**
 * Creates a DIV element for the stack.
 * @param {number} value the value of the stack.
 * @param {number} count the number of chips in the stack
 * @returns {DomNode} dom node for the stack.
 */
Chips.prototype.createStack = function (value, count) {
  count = count || 0;
  var item = document.createElement('div');
  item.classList.add('stack');
  item.dataset.value = value;
  item.dataset.count = count;
  return item;
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

  var $stacks = $('.stack', this.container);
  var stacks = this.stacks; // jquery provides no [this] context in .each

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
 * @param {*} $targets jQuery of elements that can accept the bets.
 */
Chips.prototype.start = function (callback, $targets) {
  $('.bet-interface, #bets-interface')
    .on('dragstart', '.stack', {'bets': this}, events.chipDragStart)
    .on('dragenter', '.stack-group', {'bets': this}, events.chipDragEnter)
    .on('dragleave', '.stack-group', {'bets': this}, events.chipDragLeave)
    .on('drop', '.stack-group', {'bets': this}, events.chipDragDrop)
    .on('dragover', '.stack-group', {'bets': this}, events.chipDragOver)
    .on('dragend', '.stack', {'bets': this}, events.chipDragEnd);
  $('.stack', this.container).attr('draggable', true);
  $targets.addClass('stack-group');
  this.callback = callback;
  this.targets = $targets;
};

/**
 * Used to signify a bet has been set.  Must call callback set in 'start'.
 * This is a jQuery event. Assuming e.data.game includes a reference to the game
 * The game should also have a reference back to [this] via 'bets'
 */
Chips.prototype.finish = function () {
  /* this is all broken with advent of drag/drop chips
     need to iterate over [this].targets to perform validation

  var game = e.data.game;
  var chips = game.bets;
  var $betsError = $("#bet-error", chips.container);
  var pendingValue = 0;

  // iterate over the spots and count the number of chips (children) to get current bet.
  chips.targets.each(function(){
    $(this).children.each(function(){
      pendingValue += $(this).attr('data-count') * $(this).attr('data-value')
    })
  })

  if (pendingValue === 0) {
    // provide an error if no chips have been bet in any spot.
    $betsError.html("You must select some chips to bet!")
  }
  else {
    // otherwise, set up the currentBet value, remove from winnings & call the callback.
    $betsError.html("");
    chips.currentBet = pendingChipValues;
    chips.winnings -= pendingChipValues;
    chips.callback.call();
    // also perform cleanup of event listeners, properties, etc.
    chips.clean();
  }
  */
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
  this.clean();
};


/**
 * Performs cleanup of properties/listeners after a finish or abort.
 */
Chips.prototype.clean = function () {
  $('.stack', this.container).add(this.targets)
    .attr('draggable', false)
    .off('dragstart', events.chipDragStart)
    .off('dragenter', events.chipDragEnter)
    .off('dragleave', events.chipDragLeave)
    .off('drop', events.chipDragDrop)
    .off('dragover', events.chipDragOver)
    .off('dragend', events.chipDragEnd);
  this.currentBet = null;
  this.callback = null;
  this.targets = null;
};

/**
 * Provides user interface for the GameInterface
 * @returns {DomElement} container
 */
Chips.prototype.output = function () {
  var $bets = $('<fieldset id="bets-interface"></fieldset>')
      .append('<legend>Your Winnings</legend>')
      .append('<div class="stack-group"></div>')
      .append('<div id="bet-error"></div>');
  this.chipStacks.appendTo($bets.find('.stack-group'));
  this.container = $bets[0];
  return this.container;
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
