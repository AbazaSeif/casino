/**
 * @file game.js
 * This game provides a base class for a Game.
 * 
 * Each game must implement the following routines
 * - init will initialize the game, i.e. make elements visible.
 * - output returns DOM elements required for the game.
 * - css returns a string of any additional css required.
 * - fin will finish the game, i.e. make elements invisible.
 * Also the following properties must be set:
 * - name - a machine-readable name of the game
 * - label - a human-readable name of the game.
 * ...
 * To pass validation, implementors must set the prototype to new Game
 * e.g., 
 * function MyGame(){}
 * MyGame.prototype = new Game();
 * games.push[ new MyGame() ]
 *
 * When added to the GameInterface, a game is given the following references:
 * - bets: reference the bet object.
 * This reference can be used to solicit bets from the user before the game starts.
 * @see Game.prototype.start
 */

;(function($){ 

/**
 * Game
 * This it a stub and is intended to be inherited by different games.
 * It provides some examples of how to work within the system.
 */
  window["Game"] = function Game () {
    this.name = "sample-game";
    this.label = "Sample Game"
  }
  
  /**
   * Game.prototype.toString
   * Overwrite toString function to make identification easier.
   */
  Game.prototype.toString = function () {
    return "Game ["+ this.name +"]";
  }
  
  /**
   * Game.prototype.init
   * Perform initializations - make elements display:block
   */
  Game.prototype.init = function () {
    var bust = this.bets.winnings === 0;
    $(this.container)
      .removeClass()
      .addClass('game init')
      .toggleClass('bust', bust);
    $(".status", this.container)
      .html( bust ? "You have no money - get out of here you lazy bum!" : "Press start to continue");
  }
  
  /**
   * Game.prototype.fin
   * Perform cleanup - make all elements invisible
   */
  Game.prototype.fin = function () {
    $(this.container)
      .removeClass()
      .addClass('game');
  }
  /**
   * Game.prototype.start
   * jQuery click event handler.
   * This sets up the game's user interface on the board.
   *
   * @param e
   * Event Data. e.data.game contains a reference to [this]
   */
  Game.prototype.start = function (e) {
    var game = e.data.game;
    var container = game.container;
    var bets = game.bets;
    
    $(container)
      .removeClass()
      .addClass('game betting');
    
    $('.status', container)
      .html("Enter a bet to continue...");
    
    // let the bets interface know we are waiting for a bet
    // when it's finished make the game's interface visible
    bets.start( function () {
    
      $(container)
        .removeClass()
        .addClass('game playing');
        
      $('.status', container)
        .html("Current bet is " + bets.currentBet);
        
    });
    
  }
  /**
   * Game.prototype.end
   * This cleans up once the user is finished.
   *
   * @param e
   * Event Data. 
   *  - e.data.game contains a reference to [this]
   *  - e.data.winning is a boolean indicating the result of the game.
   */
  Game.prototype.end = function (e) {
    var winning = e.data.winning;
    var game = e.data.game;
    var bets = game.bets;
    
    bets.win(winning);
    game.init();
    
    $('.status', game.container)
      .prepend( winning ? "You win! " : "You lose... " );
  }
  
  /**
   * Game.prototype.output
   * This provides the user interface for the game.
   *
   * @returns DOMElement
   */ 
  Game.prototype.output = function () {
    var game = this;
    var $game = $("<fieldset class='game'></fieldset>")
      .append("<legend>" + this.label + "</legend>")
      .append( function () {
        var ret = $("<div class='commands'></div>")
          .append("<span class='status'></span>")
          .append($("<button class='start'>Start</button>").click({game:game}, game.start));
        return ret;
      })
      .append( function () {
        var ret= $("<div class='interface'></div>")
          .append($("<button>Win</button>").click({game: game, winning:true}, game.end))
          .append($("<button>Lose</button>").click({game: game, winning:false}, game.end));
        return ret;
      })
    ; // end jQuery chain
    this.container = $game[0];
    return this.container;
  }
  
  /**
   * Game.prototype.css
   * This css is added to the page and is used to render the game
   *
   * @returns css
   */
  Game.prototype.css = function() {
    var css = '';
    css += '.game { display:none; }';
    css += '.game.init { display:inherit; }';
    css += '.game.init .interface{ display:none; }';
    css += '.game.init .start{ display:inherit; }';
    css += '.game.betting { display:inherit; }';
    css += '.game.betting .interface { display:none; }';
    css += '.game.betting .start { display:none; }';
    css += '.game.playing { display:inherit; }';
    css += '.game.playing .interface { display:inherit; }';
    css += '.game.playing .start { display:none; }';
    css += '.game.bust { display:inherit; }';
    css += '.game.bust .start{ display:none; }';
    css += '.game.bust .interface{ display:none; }';
    return css;
  }
  
})(jQuery);