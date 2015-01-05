'use strict';

/**
 * @module lib/game-interface/events
 * @description Provides events for the game interface.
 */

/**
 * jQuery click handler for the start button.
 * Determines the selected game and fires {@link GameInterface#start|start}.
 * @param {Event} e event data
 * @param {GameInterface} e.data.game-interface the current game.
 */
module.exports.startGame = function (e) {
  var selected = $('#game-selection').val();
  if (selected !== '') {
    e.data['game-interface'].start(selected);
  }
};

/**
 * jQuery click handler for the end button
 * Fires {@link GameInterface#end|end}.
 * @param {Event} e event data
 * @param {GameInterface} e.data.game-interface the current game.
 */
module.exports.endGame = function (e) {
  e.data['game-interface'].end();
};
