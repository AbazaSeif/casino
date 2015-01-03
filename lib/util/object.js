/**
 * @file Object prototype polyfills
 */

'use strict';

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
 */
if (typeof Object.create !== 'function') {
  Object.create = (function () {
    var Object = function () {};
    return function (prototype) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof prototype !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      Object.prototype = prototype;
      var result = {};
      Object.prototype = null;
      return result;
    };
  })();
}

/**
 * Object.keys polyfill for IE<9
 */
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var hasDontEnumBug = !{'toString': null}.propertyIsEnumerable('toString');
    var dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError(obj + ' is not an object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
