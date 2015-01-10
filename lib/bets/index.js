/**
 * @module lib/bets
 * @description Abstract class describing generic bet interace.
 * @abstract
 */
'use strict';

module.exports = Bets;

/**
 * @class
 * @alias Bets
 * @abstract
 * @summary Keeps track of users' winnings.
 * Provides user interface for increasing/decreasing bets.
 * @param {number} [initial=100] The amount to start off with.
 */
function Bets (initial) {

  /**
   * Value of the user's amount of winnings
   * @type {number}
   */
  this.winnings = initial || 100;

  /**
   * Value of the current betting operation.
   * @type {number}
   */
  this.currentBet = null;

  /**
   * Name of this interface (in theory, could support multiple)
   * @type {string}
   */
  this.name = 'sample-bets';

  /**
   * Callback fired when the user has finished betting.
   * @type {function}
   */
  this.callback = null;
}


/**
 * Called by games to solicit the current bet from the user.
 * Sets {@link Bets#callback|callback} and intializes the betting interface.
 * @param {function} callback Call once a valid bet has been set.
 */
Bets.prototype.start = function (callback) {
  throw new Error('start routine must be implemented by a subclass.');
};

/**
 * Used to signify a bet has been set. Must call {@link Bets#callback|callback} set in {@link Bets#start|start}.
 */
Bets.prototype.finish = function () {
  throw new Error('finish routine must be implemented by a subclass.')
};

/**
 * This is called when a user leaves the game with a pending bet operation.
 */
Bets.prototype.abort = function () {
  throw new Error('abort routine must be implemented by a subclass.')
};

/**
 * Called by games to report back on what the outcome of a game was
 * @param {boolean} winning true for a win; false for a loss
 */
Bets.prototype.win = function (winning) {
  throw new Error('win routine must be implemented by a subclass.')
};

/**
 * Provide any css styling for the betting interface
 * @returns {string} css
 */
Bets.prototype.css = function () {
  throw new Error('css routine must be implemented by a subclass.')
};

/**
 * Provides betting user interface for the GameInterface
 * @returns {string} Container
 */
Bets.prototype.output = function () {
  throw new Error('output routine must be implemented by a subclass.')
};
