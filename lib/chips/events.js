/* global DataTransfer */
/**
 * @module lib/chips/events
 * @description events for the chips interface
 */
'use strict';

/**
 * This fires when a draggable element (.stack) has started a drag event
 * @param {Event} e event data.
 */
module.exports.chipDragStart = function (e) {
  // this is a jQuery event. Grab the originalEvent to get at 'dataTransfer' and other fun stuff
  var ev = e.originalEvent;
  var $target = $(this);

  // get details about how many chips they are dragging and the stack value
  // the quantity calculation is weird and will fail because of the circular nature of the chips - works if dragging the middle (sorta)
  // @todo Fix bug in IE11 where the quantity can return one too many, resulting in broken shit.
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
};

/**
 * This fires when the mouse enters a .stack-group element during drag event.
 */
module.exports.chipDragEnter = function () {
  this.classList.add('over');
};

/**
 * This fires when the mouse is hovering a .stack-group element during drag event
 * Using jQuery event delegation ensures this only fires for .stack-group.
 * Setting dropEffect and calling preventDefault allows elements to be dragged here.
 * @param {event} e event data
 * @returns {boolean} identifies the drag proceeds
 */
module.exports.chipDragOver = function (e) {
  e.originalEvent.dataTransfer.dropEffect = 'move';
  e.preventDefault();
  return false;
};

/**
 * This fires when the mouse leaves a .stack-group during a drag event
 */
module.exports.chipDragLeave = function () {
  this.classList.remove('over');
};

/**
 * Fires when an element is dropped during a drag event
 * This updates the data-count values of the source and target of the drop
 * Calling preventDefault ensures we don't navigate away from the current page.
 * @param {event} e event data
 * @param {Bets} e.data.bets the betting interface.
 */
module.exports.chipDragDrop = function (e) {

  var bets = e.data.bets;

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
    $stack = $(bets.createStack(data.value, data.quantity))
      .attr('draggable', true)
      .appendTo(this);
  }

  // decrement the data-count on the source stack by however many
  // also, remove the element if data-count equals 0.
  var $source = $(bets.dragSrc);
  var newCount = parseInt($source.attr('data-count')) - data.quantity;
  $source.attr('data-count', newCount);
  $source.filter('[data-count="0"]').remove();

  // perform any css fixes to the changed stacks.
  this.classList.remove('over');
  bets.fix($stack.add($source));
  bets.fixStackGroups(bets.targets);
};

/**
 * This fires when the user releases their mouse regardless of whether drop was successful
 * Remove the dragSrc reference on e.data.bets, that is, [this]
 * @param {event} e event data.
 * @param {Bets} e.data.bets the betting interface.
 * @access private
 */
module.exports.chipDragEnd = function (e) {
  this.classList.remove('over');
  e.data.bets.dragSrc = null;
};
