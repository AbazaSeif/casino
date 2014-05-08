
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
      while (amount > element.value * 2) {
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
  $(".stack", this.container).each(function() {
    var $this = $(this);
    var value = $this.attr('data-value');
    var count = stacks[value]
    $this
      .attr('data-count', count)
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
    $this.css('height', (($this.data('count') - 1) * 9) + 'px')
      .html('<span class="value">'+$this.data('value')+'</span>')
  });
  
  // ensure margins are set properly on stackgroup
  var $stackgroup = $('.stack-group')
  var stack_siblings = $stackgroup.children().size()
  $stackgroup
    .css('margin-top', stack_siblings * 9 + 'px')
    .css('margin-bottom', stack_siblings * 9 + 'px');
  
  // set up z-index and top positioning for stacks
  $('.stack-group .stack', this.container).each(function() {
    var $this = $(this);
    var index = $this.index();
    var sibling_count = $this.parent().children().size();
    var count = $this.data('count');
    $(this)
      .css('top', (index * 9) + 'px')
      .css('zIndex', sibling_count - index);
  });
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
  var chips = e.data.chips;
  chips.betsCallback.call();
}

/**
 * Chips.prototype.abort
 * This gets called when a user leaves the game with a pending bet operation.
 */
Chips.prototype.abort = function() {
  
}

Chips.prototype.finish = function() {

}

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

  this.container = $bets[0];
  return this.container;
}

Chips.prototype.css = function() {
  var css = "";
  
  css += "\n#bets-winnings{ margin-bottom:12pt;}"
  
  // add generic stack class
  css += "\n.stack[data-count]{";
  css += "\n  position:relative; ";
  css += "\n  background: url("+this.imgRoot+"/middle.png) repeat center 27px;";
  css += "\n  width: 75px;";
  css += "\n  margin: 26px 0 13px;" 
  css += "\n  display:inline-block;";
  css += "\n  vertical-align: bottom;"
  css += "\n}  ";
  
  // add before/after pseudo-selectors for the top/bottom backgrounds/masks
  css += "\n.stack:before {";
  css += "\n  content:'';";
  css += "\n  position:absolute;";
  css += "\n  top: -26px;";
  css += "\n  width: 75px;";
  css += "\n  height: 26px;";
  css += "\n  background: url(img/top.png) no-repeat top center;";
  css += "\n  -webkit-mask:url(img/mask-top-webkit.png) no-repeat top center;";
  css += "\n  mask: url(img/mask.svg#chip-mask-top);";
  css += "\n}";
  
  css += "\n.stack:after {";
  css += "\n  content:'';";
  css += "\n  position:absolute;";
  css += "\n  bottom: -13px;";
  css += "\n  width: 75px;";
  css += "\n  height: 13px;";
  css += "\n  background: url(img/bottom.png) no-repeat bottom center;";
  css += "\n  -webkit-mask: url(img/mask-bottom-webkit.png) no-repeat bottom center;";
  css += "\n  mask: url(img/mask.svg#chip-mask-bottom);";
  css += "\n} ";
  
  // stack group fixes - ensure they are stacked on top of eachother & margins work.
  css += "\n .stack-group .stack[data-count] { display: block }";
  css += "\n .stack-group .stack[data-count]:first-child { margin-bottom: 0 }";
  css += "\n .stack-group .stack[data-count]:nth-last-child(n+2):nth-child(n+2) { margin: 0 }";
  css += "\n .stack-group .stack[data-count]:last-child { margin-top: 0 }";
  css += "\n .stack-group .stack[data-count]:only-child { margin: 26px 0 13px; }";
  
  // ensure those with a count of zero are not visible
  css += "\n.stack[data-count='0']{";
  css += "\n  display:none;"
  css += "\n}"
  
  // set up the 3d transformation for the text element
  css += "\ndiv.stack[data-value] span.value{ ";
  css += "\n  display: block;";
  css += "\n  position: relative;";
  css += "\n  top: -23px;";
  css += "\n  text-align: center;";
  css += "\n  -webkit-transform: rotateX(50deg) rotateZ(21deg); ";
  css += "\n  transform: rotateX(50deg) rotateZ(21deg);";
  css += "\n}";
  
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



})(jQuery)
