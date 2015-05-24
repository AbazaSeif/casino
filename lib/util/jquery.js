/*global jQuery*/

/**
 * jQuery plugins/helpers
 * @modules util/jquery
 */

'use strict';

/**
 * Calls localization library for a given element.
 * @returns {jQuery} jquery for chaining.
 */
jQuery.fn.__ = function () {
  var key = arguments[0];
  var args = Array.prototype.slice.call(arguments, 1);
  return $(this)
    .attr('data-translatable', key)
    .attr('data-args', JSON.stringify(args))
    .html(i18n.t.apply(i18n, [key].concat(args)));
};

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
