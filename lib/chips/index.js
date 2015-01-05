/* global DataTransfer */
/**
 * @file chips.js
 * Fancier interface to work with bets.
 */
'use strict';

var Bets = require('../bets');

require('./styles')

/**
 * @constructor Chips
 * @param {number} initial initial winnings value to start with
 */
var Chips = module.exports = function Chips(initial) {
  this.name = 'chips';
  this.winnings = initial || 100;
  this.types = [
    { 'value': 1, 'cssColor': '#000', 'cssBackground': '#ccc', 'selectedBackground': 'yellow' },
    { 'value': 5, 'cssColor': '#000', 'cssBackground': '#c00', 'selectedBackground': 'yellow' },
    { 'value': 25, 'cssColor': '#000', 'cssBackground': '#0c0', 'selectedBackground': 'yellow' },
    { 'value': 100, 'cssColor': '#fd0', 'cssBackground': '#222', 'selectedBackground': 'yellow' }
  ];
  this.chipStacks = $(this.types.map(function (v) {
    return createStack(v.value, 0);
  }));
  this.stacks = {};
  this.types.forEach(function (e) {
    this.stacks[e.value] = 0;
  }, this);
  this.split(this.winnings);
};

Chips.prototype = Object.create(Bets.prototype);
Chips.prototype.constructor = Chips;

function createStack(value, count) {
  count = count || 0;
  var item = document.createElement('div');
  item.classList.add('stack');
  item.dataset.value = value;
  item.dataset.count = count;
  return item;
}

/**
 * @function Chips.split
 * @summary Takes a value and splits into a series of chips
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
 * @function Chips.update
 * @summary Updates the user interface with current values.
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
 * @function Chips.fix
 * @summary Performs fixes for things that can't be done with static CSS
 * @param {*} els jQuery of '.stack' elements to fix
 * There is a magic number used throughout this, 9 -- it is the height of a chip.
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
 * @function Chips.fixStackGroups
 * @summary Performs fixes to stack groups that can't be done with static CSS
 * @param {*} stackGroups jQuery of '.stack-group' elements to fix
*  Magic number 9 is height of chip, 30 is "just right" for proper height
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
 * @function Chips.start
 * @summary Called by games to solicit the current bet from the user.
 * @param {function} callback Function to call once a valid bet has been set.
 * @param {*} $targets jQuery of elements that can accept the bets.
 */
Chips.prototype.start = function (callback, $targets) {
  $('.bet-interface, #bets-interface')
    .on('dragstart', '.stack', {'bets': this}, chipDragStart)
    .on('dragenter', '.stack-group', {'bets': this}, chipDragEnter)
    .on('dragleave', '.stack-group', {'bets': this}, chipDragLeave)
    .on('drop', '.stack-group', {'bets': this}, chipDragDrop)
    .on('dragover', '.stack-group', {'bets': this}, chipDragOver)
    .on('dragend', '.stack', {'bets': this}, chipDragEnd);
  $('.stack', this.container).attr('draggable', true);
  $targets.addClass('stack-group');
  this.callback = callback;
  this.targets = $targets;
};

/**
 * @function Chips.finish
 * @summary Used to signify a bet has been set.  Must call callback set in 'start'.
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
 * chipDragStart
 * @access private
 * @param {Event} e event data.
 * This fires when a draggable element (.stack) has started a drag event
 */
function chipDragStart (e) {
  // this is a jQuery event. Grab the originalEvent to get at 'dataTransfer' and other fun stuff
  var ev = e.originalEvent;
  var $target = $(this);

  // get details about how many chips they are dragging and the stack value
  // the quantity calculation is weird and will fail because of the circular nature of the chips - works if dragging the middle (sorta)
  // TODO:  Fix bug in IE11 where the quantity can return one too many, resulting in broken shit.
  var offsetY = ev.offsetY || ev.clientY - $target.offset().top;
  var chipQuantity = offsetY < 9 ? 1 : Math.ceil((offsetY - 3) / 9);
  var chipValue = $target.attr('data-value');

  // we also want to save this element for later use in the drop event.
  e.data.bets.dragSrc = $target;

  // IE doesnt support setDragImage so do some feature detection here to avoid JS errors
  if ('setDragImage' in DataTransfer.prototype) {
    // make a clone of the event target, make some slight changes to to it based on where the user clicked the element
    // and do a quick insert so it works with setDragImage and remove before next repaint via requestAnimationFrame.
    var $dragImage = $target.clone(false)
      .attr('data-count', chipQuantity)
      .css('position', 'absolute')
      .css('left', ev.pageX)
      .css('top', ev.pageY)
      .css('zIndex', '-100')
      .appendTo(document.body);
    e.data.bets.fix($dragImage);
    window.requestAnimationFrame(function () { $dragImage.remove(); });
    ev.dataTransfer.setDragImage($dragImage[0], 0, 0);
  }

  // set up the dragging values, including the image above and the allowed effect.
  // need to send some sort of data otherwise firefox doesnt start the drag
  ev.dataTransfer.effectAllowed = 'move';
  ev.dataTransfer.setData('Text', JSON.stringify({
    'quantity': chipQuantity,
    'value': chipValue
  }));
}

/**
 * This fires when the mouse enters a .stack-group element during drag event.
 * @access private
 */
function chipDragEnter () {
  this.classList.add('over');
}

/**
 * This fires when the mouse is hovering a .stack-group element during drag event
 * Using jQuery event delegation ensures this only fires for .stack-group.
 * Setting dropEffect and calling preventDefault allows elements to be dragged here.
 * @access private
 * @param {event} e event data
 * @returns {boolean} identifies the drag proceeds
 */
function chipDragOver (e) {
  e.originalEvent.dataTransfer.dropEffect = 'move';
  e.preventDefault();
  return false;
}


/**
 * This fires when the mouse leaves a .stack-group during a drag event
 */
function chipDragLeave () {
  this.classList.remove('over');

}

/**
 * This fires when an element is dropped during a drag event
 * This will update the data-count values of the source and target of the drop
 * Calling @preventDefault ensures we don't navigate away from the current page.
 * @param {event} e event data
 */
function chipDragDrop (e) {

  // make sure the browser doesn't redirect...
  e.preventDefault();

  // grab data that was set in the dragstart event
  var data = JSON.parse(e.originalEvent.dataTransfer.getData('Text'));

  // find the right stack for the drop
  var $stack = $('.stack[data-value="' + data.value + '"]', this);
  if ($stack.size() > 0) {
    // add the dragging quantity to the data-count attribute
    var oldCount = parseInt($stack.attr('data-count'));
    $stack.attr('data-count', oldCount + data.quantity);
  }
  else {
    // if the stack doesn't exit, create and append it - make sure it's draggable
    $stack = $(createStack(data.value, data.quantity))
      .attr('draggable', true)
      .appendTo(this);
  }

  // decrement the data-count on the source stack by however many
  // also, remove the element if data-count equals 0.
  var $source = $(e.data.bets.dragSrc);
  var newCount = parseInt($source.attr('data-count')) - data.quantity;
  $source.attr('data-count', newCount);
  $source.filter('[data-count="0"]').remove();

  // perform any css fixes to the changed stacks.
  this.classList.remove('over');
  e.data.bets.fix($stack.add($source));
  e.data.bets.fixStackGroups(e.data.bets.targets);
}

/**
 * This fires when the user releases their mouse regardless of whether drop was successful
 * Remove the dragSrc reference on e.data.bets, that is, [this]
 * @param {event} e event data.
 */
function chipDragEnd (e) {
  this.classList.remove('over');
  e.data.bets.dragSrc = null;
}

/**
 * @function Chips.win
 * @summary Called by GamesInterface, signifies the user has won (or lost)
 * @instance
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
 * @function Chips.abort
 * @summary Called when a user leaves the game with a pending bet operation.
 * @instance
 */
Chips.prototype.abort = function () {
  this.clean();
};


/**
 * @function Chips.clean
 * @instance
 * @summary Performs cleanup of properties/listeners after a finish or abort.
 */
Chips.prototype.clean = function () {
  $('.stack', this.container).add(this.targets)
    .attr('draggable', false)
    .off('dragstart', chipDragStart)
    .off('dragenter', chipDragEnter)
    .off('dragleave', chipDragLeave)
    .off('drop', chipDragDrop)
    .off('dragover', chipDragOver)
    .off('dragend', chipDragEnd);
  this.currentBet = null;
  this.callback = null;
  this.targets = null;
};

/**
 * @function Chips.output
 * @instance
 * @summary Provides user interface for the GameInterface
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
 * @function Chips.css
 * @instance
 * @summary Provide dynamic css styling for the betting interface.
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
