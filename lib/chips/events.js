/* global DataTransfer */
/**
 * @module lib/chips/events
 * @description events for the chips interface
 */
'use strict';

/**
 * @summary This fires when a draggable element (.stack) has started a drag event
 * @description Sets the {@link Chips#dragSrc|dragSrc} reference
 * <br>Creates a clone of the drag source and uses it as the DragImage property.
 * @memberof Chips
 * @alias chipDragStart
 * @param {Event} e event data.
 * @param {Chips} e.data.bets Reference to chips interface.
 * @event
 */
module.exports.chipDragStart = function (e) {
  // this is a jQuery event. Grab the originalEvent to get at 'dataTransfer' and other fun stuff
  var ev = e.originalEvent;
  var $target = $(this);

  // get details about how many chips they are dragging and the stack value
  // this is based upon the position of the mouse when user started dragging.
  // ensure it isn't less than 0 and isn't greater than the count of chips.

  var offsetY = parseInt(e.originalEvent.offsetY || e.originalEvent.clientY - $target.offset().top);
  var chipCount = $target.attr('data-count');
  var chipValue = $target.attr('data-value');
  var chipQuantity = Math.min(Math.max(parseInt((offsetY + 9) / 9), 1), chipCount);

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
      .appendTo($target.parent());
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
 * @summary This fires when the mouse enters a .stack-group element during drag event.
 * @description Sets a special class so the drop target can be identified.
 * @memberof Chips
 * @alias chipDragEnter
 * @event
 */
module.exports.chipDragEnter = function () {
  this.classList.add('over');
};

/**
 * @summary Fires when the mouse is hovering a .stack-group element during drag event
 * @description Using jQuery event delegation ensures this only fires for .stack-group.
 * <br>Setting dropEffect and calling preventDefault allows elements to be dragged here.
 * @memberof Chips
 * @alias chipDragOver
 * @event
 * @param {event} e event data
 * @param {Chips} e.data.bets Reference to chips interface.
 * @returns {boolean} identifies the drag proceeds
 */
module.exports.chipDragOver = function (e) {
  e.originalEvent.dataTransfer.dropEffect = 'move';
  e.preventDefault();
  return false;
};

/**
 * @summary Fires when the mouse leaves a .stack-group during a drag event
 * @description Removes the over class added in {@link Chips.event:chipDragEnter|chipDragEnter}.
 * @memberof Chips
 * @alias chipDragLeave
 * @event
 */
module.exports.chipDragLeave = function () {
  this.classList.remove('over');
};

/**
 * @summary Fires when an element is dropped during a drag event
 * @description Updates the data-count values of the source and target of the drop
 * <br>Calls preventDefault to ensure the user isn't navigated away from the current page.
 * @memberof Chips
 * @alias chipDragDrop
 * @event
 * @param {event} e event data
 * @param {Chips} e.data.bets Reference to chips interface.
 */
module.exports.chipDragDrop = function (e) {

  var bets = e.data.bets;

  // make sure the browser doesn't redirect...
  e.preventDefault();

  // grab data that was set in the dragstart event
  var data = JSON.parse(e.originalEvent.dataTransfer.getData('Text'));

  var $stackGroup = this.classList.contains('stack-group') ? $(this) : $('.stack-group', this);

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
      .appendTo($stackGroup);
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
 * @summary Fires when the user releases their mouse regardless of whether drop was successful
 * @description Removes {@link Chips#dragSrc|dragSrc} reference.
 * @memberof Chips
 * @alias chipDragEnd
 * @event
 * @param {event} e event data.
 * @param {Bets} e.data.bets the betting interface.
 */
module.exports.chipDragEnd = function (e) {
  this.classList.remove('over');
  e.data.bets.dragSrc = null;
};
