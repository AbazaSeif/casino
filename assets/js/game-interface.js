/**
 * @file game-interface.js
 * This file provides the idea of the "Game Interface"
 *
 * Each game shows up on the select box and the user is allowed to choose one.
 * Once started, a game creates itself and once finished, performs any cleanup.
 * In addition to the games, a bets object is also required - this keeps track of chips.
 * For more information on either of these @see bets.js, game.js
 * 
 * todo: rework to use classes over IDs. 
 */
;(function($){

/**
 * GameInterface
 * The game provides a user interface to start and stop games
 * and to keep track of winnings between games.
 * 
 * @see Game, @see Bets
 * 
 * @param opts
 * Associative array of the options that make up the game, including:
 * - output: DOMElement that the user interface is attached to.
 * - games: Array of objects that inhert from Game.
 * - bets: Object that inherits from Bets
 *
 */
  window["GameInterface"] = function GameInterface (opts) {
    
    FunctionValidation(this, opts, [
      {name: 'output', type: HTMLElement},
      {name: 'games', type: Array, arrayType: Game},
      {name: 'bets', type: Bets}
    ]);
    
    // set this up for the jQuery callbacks below
    var game = this;

    // iterate over the games array and ensure the bets reference exists.
    // this occurs above output because the output functions require bets being present.
    this.games.forEach( function (game, index, array) {
      game.bets = this.bets;
    }, this);
    
    // Add styles for both bets and all games.
    Array.prototype.concat(this.games, this.bets).forEach(function(element, index, array){
      var id = (element instanceof Game ? "game" : "bet") + "--" + element.name;
      var $styles = $("#" + id);
      var css = element.css();
      if ($styles.size() === 0) {
        $('head').append('<style type="text/css" id="'+ id +'">' + css + '</style>');
      } 
      else {
        $styles.html(css);
      }  
    });
            
    // we set this in the creation scripts and add to it later...
    var $select;
    
    // add the user interface to the output
    $(this.output)
    
      // output the game chooser interface
      .append( function () {
        var ret = $("<fieldset id='game-chooser'></fieldset>")
        .append("<legend>Game Chooser</legend>")
        .append( function () {
          // append the game selection dropdown
          $select =  $("<select id='game-selection'></select>")
            .append("<option value=''>Select One</option>")
            .append( function (){
              return game.games.map( function (g, index) {
                return "<option value='"+ index +"'>"+g.label+"</option>";
              });
            })
          return $select;
        })
        .append( function () {
          // append the game starter button
          var ret = $("<button id='game-starter'>Start</button>")
            .click( function (e) {
              $selected = $("#game-selection").val();
              if($selected != "") {
                $("#game-selection").css('display', 'none');
                $("#game-starter").css('display', 'none');
                $("#game-ender").css('display', '');
                game.current = game.games[$selected];
                game.current.init();
              }
            });
          return ret;
        })
        .append( function () {
          // append the game ender button
          var ret = $("<button id='game-ender'>Leave</button>")
            .css('display', 'none')
            .click( function (e) {
              $("#game-selection").css('display', '');
              $("#game-starter").css('display', '');
              $("#game-ender").css('display', 'none');
              game.current.fin();
              game.current = undefined;
              game.bets.abort();
            });
          return ret;
        });
        return ret;
      })
      
      // add each game's user interface with display:none
      .append( function () {
        return game.games.map( function (game) {
          var $game = $(game.output());
          $game.attr('id', game.name);
          return $game; //.css('display', 'none');
        });
      })
      
      // add the bet's user interface
      .append(this.bets.output())
      this.bets.update(); // todo, rethink this
  // end jQuery chain
  ;
  
};

})(jQuery);
