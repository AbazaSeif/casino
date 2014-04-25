
;(function($){

window["Chips"] = function Chips(initial) {
  this.name = "chips";
  this.winnings = initial || 100;
  this.types = [
    {
      value: 1,
      cssColor: '#000',
      cssBackground: '#ccc'
    },
    {
      value: 5,
      cssColor: '#000',
      cssBackground: '#c00'
    },
    {
      value: 25,
      cssColor: '#000',
      cssBackground: '#0c0'
    },
    {
      value: 100,
      cssColor: '#fd0',
      cssBackground: '#222'
    }
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
  var chips = this;
  $(".stack", this.container).each(function(index, element) {
    var value = $(element).attr('data-value');
    $(element)
      .attr('data-count', chips.stacks[value])
      .css('height', (chips.stacks[value] - 1) * 9 + 'px')
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
          .append($("<div id='winnings'></div>"))
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
      })

  this.container = $bets[0];
  return this.container;
}

Chips.prototype.css = function() {
  var css = "";
  
  // add generic stack class
  css += "\n.stack[data-count]{";
  css += "\n  position:relative; ";
  css += "\n  background-image: ";
  css += "\n    url("+this.imgRoot+"top.png), ";
  css += "\n    url("+this.imgRoot+"/middle.png),";
  css += "\n    url("+this.imgRoot+"/bottom.png);";
  css += "\n  background-position: top center, center 27px, bottom center;";
  css += "\n  background-repeat: no-repeat, repeat, no-repeat;";
  css += "\n  background-origin: border-box, padding-box, border-box;";
  css += "\n  background-clip: border-box, padding-box, border-box;  ";
  css += "\n  border-top: 26px solid transparent;";
  css += "\n  border-bottom: 13px solid transparent;";
  css += "\n  width: 75px;";
  css += "\n  display:inline-block;";
  css += "\n}  ";
  
  css += "\n.stack[data-count='0']{";
  css += "\n  display:none;"
  css += "\n}"
  
  // add css for the text content
  css += "\ndiv.stack[data-value]:before{ ";
  css += "\n  position:absolute;";
  css += "\n  top: -22px;";
  css += "\n  display:block; ";
  css += "\n  width: 75px; ";
  css += "\n  background-color: transparent !important;";
  css += "\n  content:attr(data-value); ";
  css += "\n  transform: rotate(20deg); ";
  css += "\n  -webkit-transform: rotate(20deg); ";
  css += "\n  text-align:center;";
  css += "\n  font-size:1.2em;";
  css += "\n  z-index:1;";
  css += "\n}";
  
  // add the css for each of the chip types
  this.types.forEach(function (element, index, array) {
    css += "\n.stack[data-value='" + element.value + "'],"
    css += "\n.stack[data-value='" + element.value + "']:before { "
    css += "\n  background-color: " + element.cssBackground + ";"
    css += "\n  color: " + element.cssColor + ";"
    css += "\n}"
  }, this);
  
  return css;
}



})(jQuery)
