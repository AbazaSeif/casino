/**
 * @file index.js
 * Main script file for index.htm
 */

;(function($){
  
  // onload function
  $(function() {
  
    // remove the no-js classes
    $('.no-js').removeClass('no-js');

    // temporary
    var game1 = function() {
      this.name = "sample-game-1";
      this.label = "Sample Game #1"
    };
    game1.prototype = new Game();
    
    // this shows how to call a super-method
    game1.prototype.css = function() {
      // do the unholy javascript prototype dance
      var game = Object.getPrototypeOf(this);
      var css = Object.getPrototypeOf(game).css.call(this);
      // add something
      return css + "#" + this.name + "{color:blue}";
    }
    
    var game2 = function() {
      this.name = "sample-game-2";
      this.label = "Sample Game #2"
    };
    game2.prototype = new Game();

    // create a new game interface.
    var game = new GameInterface({
      'output': $("#output")[0],
      'games': [
        new game1(),
        new game2(),
        new Blackjack()
      ],
      'bets': new Chips(144)
    });
    
  });

})(jQuery)