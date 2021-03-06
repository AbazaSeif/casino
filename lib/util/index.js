/**
 * @module lib/util
 * @description Various utility functions
 */
'use strict';

/**
 * @global
 * @typedef FunctionValidationArguments
 * @property {string} name the property name to check for.
 * @property {Object} type constructor of the value to match.
 * @property {Object} [arrayType] if type is array, this is the type of all the elements.
 */

/**
 * Loads polyfills and other things that only need to be loaded once.
 */
module.exports.once = function () {
  require('./array');
  require('./object');
  require('./event');
  require('./classList');
  require('./jquery');
};

/**
* Dummy version of _.forEach that doesn't account for all use cases
* @param {Array|Object} array iteratable entity
* @param {function} iterator function applied to each item
* @param {*} context this context to be applied to iterator.
* @returns {Array|Object} returns array passed in.
*/
module.exports.forEach = function (array, iterator, context) {
 var thisp = typeof context !== 'undefined' ? context : this;
 var isArray = typeof array.length !== 'undefined';
 var enumerable = isArray ? array : Object.keys(array);
 var length = enumerable.length;
 var i = -1;
 while (++i < length) {
   var index = isArray ? i : enumerable[i];
   if (iterator.call(thisp, array[index], index, array) === false) {
     break;
   }
 }
 return array;
};

/**
 * Utility function for performing validation of arguments passed to functions
 * @param {*} thisp when validation succeeds, the element value is added to this object
 * @param {*} inputs associative array having it's values checked
 * @param {Array.FunctionValidationArguments} elements rules to check for.
 */
module.exports.functionValidation = function (thisp, inputs, elements) {

  // iterate over all the rules
  elements.forEach(function (element) {

    var input = inputs[element.name];

    // check that the passed parameter is present in the argument at all, throw exception if not.
    if (typeof input === 'undefined') {
      console.warn(element.name + ' was not provided!');
    }

    // check that the passed parameter is of the correct type, throw exception if not
    else if (isInvalid(input, element.type)) {
      console.warn(element.name + ' was not the valid type. Expecting: ' + element.type.name);
    }

    // when constructor is array, check for presence of arrayType and compare all elements against it
    else if (element.type === Array && typeof element.arrayType !== 'undefined' && inputs[element.name].some(function (item) {return isInvalid(item, element.arrayType); })) {
      console.warn(element.name + ' is an array type but not all elements were of type ' + element.arrayType.name);
    }

    // if the property is both present and of the correct type, add it to provided reference
    else {
      thisp[element.name] = inputs[element.name];
    }

  });

  function isInvalid (item, type) {
    return !(item.constructor === type || item instanceof type);
  }

};
