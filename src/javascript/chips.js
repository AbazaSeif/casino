
;(function($){

window["Chips"] = function Chips(initial) {
  this.name = "chips";
  this.winnings = initial || 100;
  this.types = [
    { value: 1,   cssColor: '#000', cssBackground: '#ccc', selectedBackground: 'yellow' },
    { value: 5,   cssColor: '#000', cssBackground: '#c00', selectedBackground: 'yellow' },
    { value: 25,  cssColor: '#000', cssBackground: '#0c0', selectedBackground: 'yellow' },
    { value: 100, cssColor: '#fd0', cssBackground: '#222', selectedBackground: 'yellow' }
  ];
  this.chipStacks = $(this.types.map(function(v){
    return createStack(v.value, 0);
  }));
  this.stacks = {}
  this.types.forEach(function(e){
    this.stacks[e.value] = 0;
  }, this)
  this.split(this.winnings);
}

Chips.prototype = new Bets();

function createStack(v, c) {
  var c = c || 0;
  var $stack = $("<div></div>")
    .addClass('stack')
    .attr('data-value', v)
    .attr('data-count', c)
  return $stack[0];
}

/**
 * Chips.prototype.split
 * Takes a value and splits into a series of chips
 *  
 */
Chips.prototype.split = function (amount) {
  this.types
    .sort(function(a,b) {
      return b.value - a.value;
    })
    .forEach(function(element, index, array){
      while (amount >= element.value) {
        this.stacks[element.value]++;
        amount -= element.value;
      }
    }, this);
}

/**
 * Chips.prototype.update
 * Updates the user interface with current values.
 */
Chips.prototype.update = function() {
  var $stacks = $(".stack", this.container);
  var stacks = this.stacks; // jquery provides no [this] context in .each
  
  // update the data-count attribute with internal stack count
  $stacks.each(function() {
    $(this).attr('data-count', stacks[$(this).attr('data-value')])
  });
  
  // perform css fixes assuming the new values
  this.fix($stacks);
}

/**
 * Chips.prorotype.fix
 * Performs fixes for things that can't be done with static CSS
 * 
 * @param els
 *  jQuery of '.stack' elements to fix
 * 
 * @remarks
 * There is a magic number used throughout this, 9 -- it is the height of a chip.
 */
Chips.prototype.fix = function(els) {

  // fix up the heights of the elements based on data-count
  els.each(function() {
    // set up the height based on count, and add the date-value to an inner span.
    $(this).css('height', (($(this).attr('data-count') - 1) * 9) + 'px')
      .html('<span class="value">'+$(this).attr('data-value')+'</span>')
  });
}

/** 
 * Chips.prototype.fixStackGroups
 * Performs fixes to stack groups that can't be done with static CSS
 *
 * @param stackGroups 
 *  jQuery of '.stack-group' elements to fix
 *
 * @remarks 
*  Magic number 9 is height of chip, 30 is "just right" for proper height
 */
Chips.prototype.fixStackGroups = function(stackGroups) {
  stackGroups.each(function(){
    var chip_count = 0;
    var siblings = $(this).children().filter(function(){
      return $(this).css('display') === 'none';
    });
    $('.stack', this).each(function(){
      var $stack = $(this);
      var index = $stack.index();
      $(this)
        .css('top', (index * 9) + 'px')
        .css('zIndex', 100 - index);
      chip_count += parseInt($stack.attr('data-count'));
    });
    $(this).css('height', (30 + (chip_count * 9)) + 'px')
  });
}


/**
 * Chips.prototype.start
 * Called by games to solicit the current bet from the user.
 * 
 * @param callback
 *  Function to call once a valid bet has been set.
 * 
 * @param targets
 *  jQuery of elements that can accept the bets.
 */
Chips.prototype.start = function(callback, $targets) {
  $('.bet-interface, #bets-interface')
    .on('dragstart', '.stack', {bets:this}, chipDragStart)
    .on('dragenter', '.stack-group', {bets:this}, chipDragEnter)
    .on('dragleave', '.stack-group', {bets:this}, chipDragLeave)
    .on('drop', '.stack-group' ,{bets:this}, chipDragDrop)
    .on('dragover', '.stack-group', {bets:this}, chipDragOver)
    .on('dragend', '.stack', {bets:this}, chipDragEnd);
  $('.stack', this.container).attr('draggable', true)
  $targets.addClass('stack-group')
  this.callback = callback;
  this.targets = $targets;
}

/**
 * Chips.prototype.finish
 * Used to signify a bet has been set.  Must call callback set in 'start'.
 * 
 * @remarks 
 *  This is a jQuery event. Assuming e.data.game includes a reference to the game
 *  The game should also have a reference back to [this] via 'bets'
 *
 */
Chips.prototype.finish = function(e) {
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
}

/**
 * chipDragStart
 * This fires when a draggable element (.stack) has started a drag event
 * 
 */
function chipDragStart (e) {
  // this is a jQuery event. Grab the originalEvent to get at 'dataTransfer' and other fun stuff
  var ev = e.originalEvent;
  var $target = $(this);

  // get details about how many chips they are dragging and the stack value
  // the quantity calculation is weird and will fail because of the circular nature of the chips - works if dragging the middle (sorta)
  // TODO:  Fix bug in IE11 where the quantity can return one too many, resulting in broken shit.
  var offsetY = (ev.offsetY || ev.clientY - $target.offset().top);
  var chipQuantity = offsetY < 9 ? 1 : Math.ceil((offsetY - 3) / 9)
  var chipValue = $target.attr('data-value');

  // we also want to save this element for later use in the drop event.
  e.data.bets.dragSrc = $target;

  // IE doesnt support setDragImage so do some feature detection here to avoid JS errors
  if("setDragImage" in DataTransfer.prototype) {
    // make a clone of the event target, make some slight changes to to it based on where the user clicked the element
    // and do a quick insert so it works with setDragImage and remove before next repaint via requestAnimationFrame.
    var $dragImage = $target.clone(false)
      .attr('data-count', chipQuantity)
      .css('position', 'absolute')
      .css('left', ev.pageX)
      .css('top', ev.pageY)
      .css('zIndex', '-100')
      .appendTo(document.body)
    e.data.bets.fix($dragImage)
    window.requestAnimationFrame(function(){$dragImage.remove();})
    ev.dataTransfer.setDragImage($dragImage[0], 0, 0);
  }

  // set up the dragging values, including the image above and the allowed effect.
  // need to send some sort of data otherwise firefox doesnt start the drag
  ev.dataTransfer.effectAllowed = 'move';
  ev.dataTransfer.setData('Text', JSON.stringify({
    quantity: chipQuantity,
    value: chipValue
  }));
}

/**
 * chipDragEnter
 * This fires when the mouse enters a .stack-group element during drag event.
 */
function chipDragEnter (e) {
  this.classList.add('over');  
}

/**
 * chipDragOver
 * This fires when the mouse is hovering a .stack-group element during drag event
 *
 * @remarks
 * Using jQuery event delegation ensures this only fires for .stack-group.
*  Setting dropEffect and calling preventDefault allows elements to be dragged here.
 */
function chipDragOver (e) {
  e.originalEvent.dataTransfer.dropEffect = 'move';
  e.preventDefault();
  return false;
}


/**
 * chipDragLeave
 * This fires when the mouse leaves a .stack-group during a drag event
 */
function chipDragLeave (e) {
  this.classList.remove('over');

}

/**
 * chipDragDrop
 * This fires when an element is dropped during a drag event
 *
 * @remarks
 * This will update the data-count values of the source and target of the drop
 * Calling @preventDefault ensures we don't navigate away from the current page.
 */
function chipDragDrop (e) {

  // make sure the browser doesn't redirect...
  e.preventDefault();

  // grab data that was set in the dragstart event
  var data = JSON.parse(e.originalEvent.dataTransfer.getData('Text'));

  // find the right stack for the drop
  var $stack = $('.stack[data-value="' + data.value +'"]', this);
  if($stack.size() > 0) {
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
  var $source = $(e.data.bets.dragSrc)
  var newCount = parseInt($source.attr('data-count')) - data['quantity'];
  $source.attr('data-count', newCount);
  $source.filter('[data-count="0"]').remove();

  // perform any css fixes to the changed stacks.
  this.classList.remove('over');  
  e.data.bets.fix($stack.add($source));
  e.data.bets.fixStackGroups(e.data.bets.targets);
}

/**
 * chipDragEnd
 * This fires when the user releases their mouse regardless of whether drop was successful
 * 
 * @remarks
 * Remove the dragSrc reference on e.data.bets, that is, [this]
 */
function chipDragEnd (e) {
  this.classList.remove('over');
  e.data.bets.dragSrc = null;
}

/**
 * Chips.prototype.win
 * Called by GamesInterface, signifies the user has won (or lost)
 *
 * @param winning boolean
 *  True for a win, false for a loss
 */
Chips.prototype.win = function (winning) {
  this.winnings += (winning ? 2 : 0) * this.currentBet;
  if (winning) {
    this.split( this.currentBet * 2); 
  }
  this.currentBet = null;
  this.update();
}

/**
 * Chips.prototype.abort
 * This gets called when a user leaves the game with a pending bet operation.
 */
Chips.prototype.abort = function() {
  this.clean();
}


/**
 * Chips.prototype.clean
 * Performs cleanup of properties/listeners after a finish or abort.
 */
Chips.prototype.clean = function() {
  $('.stack', this.container).add(this.targets)
    .attr('draggable', false)
    .off('dragstart', chipDragStart)
    .off('dragenter', chipDragEnter)
    .off('dragleave', chipDragLeave)
    .off('drop', chipDragDrop)
    .off('dragover', chipDragOver)
    .off('dragend', chipDragEnd)
  this.currentBet = null;
  this.callback = null;
  this.targets = null;
}

/**
 * Chips.prototype.output
 * Provides user interface for the GameInterface
 */
Chips.prototype.output = function() {
  var bets = this;
  var $bets = $("<fieldset id='bets-interface'></fieldset>")
      .append("<legend>Your Winnings</legend>")
      .append('<div class="stack-group"></div>')
      .append("<div id='bet-error'></div>")
  this.chipStacks.appendTo($bets.find('.stack-group'));
  this.container = $bets[0]
  return this.container;
}

/**
 * Chips.prototype.css
 * Provide any dynamic css styling for the betting interface
 */
Chips.prototype.css = function() {
  var css = "";
  
  // add the css for each of the chip types
  this.types.forEach(function (element, index, array) {
    css += "\n.stack[data-value='" + element.value + "'],"
    css += "\n.stack[data-value='" + element.value + "']:after,"
    css += "\n.stack[data-value='" + element.value + "']:before { "
    css += "\n  background-color: " + element.cssBackground + ";"
    css += "\n  color: " + element.cssColor + ";"
    css += "\n}"
    css += "\n.stack[data-value='" + element.value + "'].selected,"
    css += "\n.stack[data-value='" + element.value + "'].selected:after,"
    css += "\n.stack[data-value='" + element.value + "'].selected:before { "
    css += "\n  background-color: " + element.selectedBackground + ";"
    css += "\n}"    
  });
  
  return css;
}

})(jQuery);
