
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
  this.stacks = {}
  this.types.forEach(function(element, index, value){
    this.stacks[element.value] = 0;
  }, this)
  this.split(this.winnings);
}

Chips.prototype = new Bets();

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
  var stacks = this.stacks; // jquery provides no [this] context in .each
  
  // update the data-value attribtues in the winnnig stacks with internal stack count
  $("#winnings .stack", this.container).each(function() {
    var $this = $(this);
    var value = $this.attr('data-value');
    var count = stacks[value]
    $this.attr('data-count', count)
  });
  
  // perform css fixes assuming the new values
  this.fix();
}

/**
 * Chips.prorotype.fix
 * Performs fixes for things that can't be done with CSS
 * ( p.s., full support for calc, attr and masking would be welcome here)
 * There is a magic number used throughout this, 9 -- it is the height of a chip.
 */
Chips.prototype.fix = function() {

  // fix up the heights of the elements based on data-count
  $('.stack', this.container).each(function() {
    var $this = $(this);
    var count = $this.attr('data-count');
    $this.css('height', ((--count) * 9) + 'px')
      .html('<span class="value">'+$this.attr('data-value')+'</span>')
  });
  

  var stack_siblings = $('.stack-group').children().size()
    
  // set up z-index and top positioning for stacks, also use this loop to count chips
  var chip_count = 0;
  $('.stack-group .stack', this.container).each(function() {
    var $this = $(this);
    var index = $this.index();
    chip_count += parseInt($this.attr('data-count'));
    $(this)
      .css('top', (index * 9) + 'px')
      .css('zIndex', stack_siblings - index);
  });
  
  // ensure height of stack group is set properly.
  // height of absolutly positioned pseudoelements is not taken into account.
  $('.stack-group').css('height', ((chip_count * 9)) + 'px')
  
  
}


/**
 * Chips.prototype.start
 * Called by games to solicit the current bet from the user.
 * 
 * @param callback
 *  Function to call once a valid bet has been set.
 */

Chips.prototype.start = function(callback) {
  this.callback = callback;
  $("#current-bet-interface").css('display', '');
  $("#winnings .stack", this.container).on("click", {bets:this}, winningChipClick);
  $(".stack-group", this.container).on("click", '.stack', {bets:this}, pendingChipClick);
}

/**
 * Chips.prototype.finish
 * Used to signify a bet has been set.  Must call callback set in 'start'.
 * 
 * @remarks 
 *  This is a jQuery event. Assuming e.data.bets includes a reference to [this]
 *
 */

Chips.prototype.finish = function(e) {
  var chips = e.data.bets;
  $pendingChips = $('.stack-group .stack', this.container);
  $betsError = $("#bet-error", this.container);
  if ($pendingChips.size() === 0) {
    $betsError.html("You must select some chips to bet!")
  }
  else {
    $betsError.html("");
    var pendingChipValues = 0;
    $pendingChips.each(function() {
      pendingChipValues += $(this).attr('data-count') * $(this).attr('data-value');
    });
    $("#current-bet-interface").css('display', 'none');
    $("#winnings .stack", this.container).off("click", winningChipClick);
    $(".stack-group", this.container).off("click", pendingChipClick);
    $(".stack-group").empty();
    chips.currentBet = pendingChipValues;
    chips.callback.call();
    chips.callback = null;
  }
}

/**
 * Chips.prototype.win
 * Called by GamesInterface, signifies the user has won (or lost)
 *
 * @param winning boolean
 *  True for a win, false for a loss
 */
Chips.prototype.win = function (winning) {
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
  this.currentBet = null;
  this.callback = null;
  $("#current-bet-interface").css('display', 'none');
  $("#winnings .stack", this.container).off("click", winningChipClick);
  $(".stack-group", this.container).off("click", pendingChipClick);
}


/**
 * Chips.prototype.output
 * Provides user interface for the GameInterface
 */
Chips.prototype.output = function() {
  var bets = this;
  var $bets = $("<fieldset id='bets-interface'></fieldset>")
      .append("<legend>Betting Interface</legend>")
      .append( function () { 
        var ret = $("<div id='bets-winnings'>Your winnings: </div>")
          .append(function () {
            var ret = $("<div id='winnings'></div>")
              .append ( function () {
                return bets.types.map(function(currentValue, index, array){
                  var $stack = $("<div></div>")
                    .addClass('stack')
                    .attr('data-value', currentValue.value)
                    .attr('data-count', 0)
                  return $stack;
                }, bets)
              });
            return ret;
          });
        return ret;
      })
      .append( function () {
        var ret = $("<div id='current-bet-interface'></div>")
          .css('display', 'none')
          .append("<div id='bet-message'>Click chips above to bet them. Click finished once ready.</div>")
          .append("<div class='stack-group'></div>")
          .append(function() {
            var ret = $("<button id='finish-bet'>Finished</button>")
              .on('click', {bets:bets}, bets.finish);
            return ret;
          })
          .append("<div id='bet-error'></div>");
                  
        return ret;
      });

  this.container = $bets[0];
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

/**
 * winningChipClick
 * jQuery click handler for the winning chips stack.
 * 
 * This is attached when a pending bet is called and detatched when finished or upon abort
 * Clicking a chip adds it to the pending stack and removes it from winning chips.
 *
 * @param e 
 *  Event handler, assumes :
 *   e.data.bets - reference to Bets object
 */
function winningChipClick (e) {
  var $this = $(this);
  var value = $this.attr('data-value');
  e.data.bets.stacks[value]--;
  
  var $stack = $('.stack-group .stack[data-value="'+value+'"]', this.container)
  if ($stack.size() === 0) {
    $("<div></div>")
      .attr('data-value', value)
      .attr('data-count', '1')
      .addClass('stack')
      .appendTo('.stack-group');
  }
  else {
    $stack.attr('data-count', parseInt($stack.attr('data-count')) + 1);
  }
  e.data.bets.update();
}

/**
 * pendingChipClick
 * jQuery click handler for the pending chips stack.
 * 
 * This is attached when a pending bet is called and detatched when finished or upon abort
 *
 * @param e 
 *  Event handler, assumes :
 *   e.data.bets - reference to Bets object
 */
function pendingChipClick (e) {
  var $this = $(this);
  var value = $this.attr('data-value');
  var count = $this.attr('data-count');
  e.data.bets.stacks[value]++;
  $this.attr('data-count', --count);
  if(count === 0 ) {
    $this.remove();
  }
  e.data.bets.update();
}


})(jQuery)
