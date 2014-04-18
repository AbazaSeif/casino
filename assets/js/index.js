/**
 * @file index.js
 * Main script file for index.htm
 */

(function($){
  
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
        new game2()
      ],
      'bets': new Bets()
    });
    
  });

})(jQuery)