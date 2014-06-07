/**
 * @file bets.js
 * This file provides a generic bet interace for the user.
 * This can be called from games via the 'start' function.
 * 
 * e.g., 
 *
 *  // solicit bets from the user
 *  game.bets.start( function () {
 *    // bet has been provided, 
 *    // make the game form visible
 *  });
 * 
 * todo: 
 * - GREARLY improve user interface
 * - provide persistent storage of winnings
 * - on-hand winnings (can't go below 0) vs. bank winnings (all-time, can go negative)
 */

;(function($){
  /**
   * Bets
   * Keeps track of users' winnings.
   * Provides user interface for increasing/decreasing bets.
   *
   * @param initial
   * The amount to start off with, defaults to 100
   */
  window["Bets"] = function Bets (initial) {
    this.winnings = initial || 100;
    this.currentBet = null;
    this.name = "sample-bets";
  }
  
  /**
   * Bets.prototype.start
   * Called by games to solicit the current bet from the user.
   * 
   * @param callback
   *  Function to call once a valid bet has been set.
   */
  Bets.prototype.start = function (callback) {
    this.betsCallback = callback;
    $("#current-bet-interface").css('display', '');
  }
  
  /**
   * Bets.prototype.finish
   * Used to signify a bet has been set.  Must call callback set in 'start'.
   * 
   * @remarks 
   *  This is a jQuery event. Assuming e.data.bets includes a reference to [this]
   *
   */
  Bets.prototype.finish = function (e) {
    var bets = e.data.bets;
    var currentBet = parseInt($('#currentBet').val(), 10);
    if (isNaN(currentBet)) {
      $("#bet-error").html("Enter a number, dummy.");
    }
    else if (currentBet > bets.winnings) {
      $("#bet-error").html("You don't have that much to bet!");
    }
    else if (currentBet < 0) { 
      $("#bet-error").html("The bet needs to be positive!");
    }
    else {
      $("#bet-error").html("");
      bets.winnings -= currentBet;
      bets.currentBet = currentBet;
      bets.betsCallback.call();
      $("#winnings").html( bets.winnings );
      $("#current-bet-interface").css('display', 'none');
    }
  }
  
  /**
   * Bets.prototype.abort
   * This gets called when a user leaves the game with a pending bet operation.
   */
  Bets.prototype.abort = function () {
    this.currentBet = null;
    this.betsCallback = null;
    $("#bet-error").html("");
    $("#current-bet-interface").css('display', 'none');
  }
  
  /**
   * Bets.prototype.win
   * Called by games to report back on what the outcome of a game was
   * 
   * @param winning Boolean
   *  true for a win; false for a loss
   */
  Bets.prototype.win = function (winning) {
    this.winnings += (winning ? 2 : 0) * this.currentBet;
    this.currentBet = null;
    $("#winnings").html(this.winnings);
  }
  
  /**
   * Bets.prototype.css
   * Provide any css styling for the betting interface
   */
  Bets.prototype.css = function () {
    return '';
  }
  
  /**
   * Bets.prototype.output
   * Provides betting user interface for the GameInterface
   */
  Bets.prototype.output = function () {
    var bets = this;
    var $bets = $("<fieldset id='bets-interface'></fieldset>")
      .append("<legend>Betting Interface</legend>")
      .append( function () { 
        var ret = $("<div id='bets-winnings'>Your winnings: </div>")
          .append($("<span id='winnings'>"+ bets.winnings +"</span>"));
        return ret;
      })
      .append( function () {
        var ret = $("<div id='current-bet-interface'></div>")
          .css('display', 'none')
          .append( "<div id='bet-error'></div>")
          .append( function () {
            var ret = $("<form action='javascript:void(0);'></form>")
              .append( "<label for='currentBet'>Current Bet</label>")
              .append( "<input value='5' type='text' id='currentBet'>")
              .append( $("<input type='submit' value='Set it'>").click({bets:bets}, bets.finish))
            return ret;
          });
        return ret;
      });
    return $bets[0];
  }

})(jQuery);