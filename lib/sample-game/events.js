'use strict';

/**
 * @module lib/game/events
 * @description provide events for the game.
 */

/**
 * Click handler for the start button.
 * @param {event} e jQuery event object
 * @param {Game} e.data.game the current game.
 */
module.exports.start = function (e) {
  e.data.game.start();
};

/**
 * Click handler for the finish bets button.
 * @param {event} e jQuery event object
 * @param {Game} e.data.game the current game.
 */
module.exports.finishBet = function (e) {
  e.data.game.bets.finish();
};

/**
 * Click handler for the "Win" button.
 * @param {event} e jQuery event object
 * @param {Game} e.data.game the current game.
 */
module.exports.win = function (e) {
  e.data.game.end(true);
};

/**
 * Click handler for the "Lose" button.
 * @param {event} e jQuery event object
 * @param {Game} e.data.game the current game.
 */
module.exports.lose = function (e) {
  e.data.game.end(false);
};
