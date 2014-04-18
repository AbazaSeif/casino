/**
 * @file lib.js
 * Various utility functions
 */

;(function(){
  
  /**
   * FunctionValidation
   * Utility function for performing validation of arguments passed to functions
   *
   * @param thisp
   *  When validation succeeds, the element value is added to this object
   *
   * @param inputs
   *  Associative array having it's values checked 
   *
   * @param elements
   *  Array of objects defining the rules to check for. Expecting : 
   *  - name:  the property name to check for
   *  - type: the constructor of the value must match this
   *  - arrayType: when the type is array, all elements are checked for this type (optional)
   *
   * @returns 
   *  Nothing!  
   *
   * @throws
   *  TypeError identifying what actually failed
   */
  window["FunctionValidation"] = function (thisp, inputs, elements) {

    // grab the name of the caller for the exception message
    var caller = FunctionValidation.caller.name;

    // iterate over all the rules
    elements.forEach(function(element, index, array) {

      // check that the passed parameter is present in the argument at all, throw exception if not.
      if (typeof inputs[element.name] === 'undefined') {
        throw new TypeError("Exception in "+ caller +"(): " + element.name + " was not provided!");
      }

      // check that the passed parameter is of the correct type, throw exception if not
      // todo: verify this works in other browsers... I'm looking at you IE<=10
      else if (!(inputs[element.name].constructor === element.type || inputs[element.name] instanceof element.type )) {
        throw new TypeError("Exception in "+ caller +"(): " + element.name + " was not the valid type. Expecting: " + element.type.name);
      }

      // when constructor is array, check for presence of arrayType and compare all elements against it
      else if (element.type === Array && typeof element.arrayType !== 'undefined' && 
        inputs[element.name].filter(function(value){ return !(value.constructor === element.arrayType || value.constructor instanceof element.arrayType) }).length > 0) {
        throw new TypeError("Exception in " + caller + "(): " + element.name +" is an array type but not all elements were of type " + element.arrayType.name);
      }

      // if the property is both present and of the correct type, add it to provided reference
      else {
        thisp[element.name] = inputs[element.name];
      }

    });

  }

})(jQuery);
