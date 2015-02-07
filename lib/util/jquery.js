/*global jQuery*/

/**
 * jQuery plugins/helpers
 * @modules util/jquery
 */

'use strict';

/**
 * Splits letters in textnode of provided element into a series of spans
 * @returns {jQuery} jquery for chaining.
 */
jQuery.fn.letterize = function () {

  return $(this).each(function (i, item) {
    $(item).contents().each(iterate);
  });

  function iterate (index, node) {
    switch (node.nodeType) {
      case Node.ELEMENT_NODE:
        $(node).contents().each(iterate);
      break;
      case Node.TEXT_NODE:
        letterize($(node));
      break;
    }
  }

  function letterize ($node) {
    $node.replaceWith($node.text().split('').map(function (letter) {
      return $('<span>' + letter + '</span>');
    }));
  }

};
