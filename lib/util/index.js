/**
 * @file lib.js
 * Various utility functions
 */
'use strict';

require('./array');
require('./object');
require('./event');
require('./classList');

/**
 * @typedef FunctionValidationArguments
 * @property {string} name the property name to check for.
 * @property {Object} type constructor of the value to match.
 * @property {Object} [arrayType] if type is array, this is the type of all the elements.
 */

/**
 * @function Util.FunctionValidation
 * @description Utility function for performing validation of arguments passed to functions
 * @param {*} thisp when validation succeeds, the element value is added to this object
 * @param {*} inputs associative array having it's values checked
 * @param {Array<FunctionValidationArguments>} elements rules to check for.
 * @throws {TypeError} identifying what actually failed
 */
module.exports.functionValidation = function (thisp, inputs, elements) {

  // iterate over all the rules
  elements.forEach(function (element) {

    // check that the passed parameter is present in the argument at all, throw exception if not.
    if (typeof inputs[element.name] === 'undefined') {
      console.warn(element.name + ' was not provided!');
    }

    // check that the passed parameter is of the correct type, throw exception if not
    else if (!isValid(element, 'type')) {
      console.warn(element.name + ' was not the valid type. Expecting: ' + element.type.name);
    }

    // when constructor is array, check for presence of arrayType and compare all elements against it
    else if (element.type === Array && typeof element.arrayType !== 'undefined' && inputs[element.name].some(function (item) { return !isValid(item, 'arrayType'); })) {
      console.warn(element.name + ' is an array type but not all elements were of type ' + element.arrayType.name);
    }

    // if the property is both present and of the correct type, add it to provided reference
    else {
      thisp[element.name] = inputs[element.name];
    }

  });

  function isValid (item, type) {
    return inputs[item.name] === item.type || inputs[item.name] instanceof item[type];
  }

};