/* global Chips, GameInterface, Game, Blackjack */
/**
 * @file index.js
 * Main script file for index.htm
 * @requires Chips
 * @requires GameInterface
 * @requires Game
 * @requires BlackJack
 */
'use strict';

(function ($) {

  // onload function
  $(function () {

    // remove the no-js classes
    $('.no-js').removeClass('no-js');

    // temporary
    var Game1 = function () {
      this.name = 'sample-game-1';
      this.label = 'Sample Game #1';
    };
    Game1.prototype = new Game();

    // this shows how to call a super-method
    Game1.prototype.css = function () {
      // do the unholy javascript prototype dance
      var game = Object.getPrototypeOf(this);
      var css = Object.getPrototypeOf(game).css.call(this);
      // add something
      return css + '#' + this.name + '{color:blue}';
    };

    var Game2 = function () {
      this.name = 'sample-game-2';
      this.label = 'Sample Game #2';
    };
    Game2.prototype = new Game();

    // create a new game interface.
    var gameInterface = new GameInterface({
      'output': $('#output')[0],
      'games': [
        new Game1(),
        new Game2(),
        new Blackjack()
      ],
      'bets': new Chips(144)
    });

  });

})(jQuery);
