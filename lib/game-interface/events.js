'use strict';

/**
 * @module lib/game-interface/events
 * @description Provides events for the game interface.
 */

/**
 * jQuery click handler for the start button
 * @param {Event} e event data
 */
module.exports.startGame = function (e) {
  var selected = $('#game-selection').val();
  if (selected !== '') {
    e.data.game.start(selected);
  }
};

/**
 * jQuery click handler for the end button
 * @param {Event} e event data
 */
module.exports.endGame = function (e) {
  e.data.game.end();
};
