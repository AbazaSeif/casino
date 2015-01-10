/*eslint-env mocha*/
'use strict';

var chai = require('chai');
var sinon = require('sinon');

var expect = chai.expect;

var Util = require('../lib/util');


describe('FunctionValidation', function () {

  var spy;
  var resultObj = {};
  var checkSchema = [
    {'name': 'testNumber', 'type': Number},
    {'name': 'testString', 'type': String},
    {'name': 'testBoolean', 'type': Boolean},
    {'name': 'testStringArray', 'type': Array, 'arrayType': String},
    {'name': 'testNumberArray', 'type': Array, 'arrayType': Number},
    {'name': 'testBooleanArray', 'type': Array, 'arrayType': Boolean}
  ];

  before(function () {
    console.warn = function () {}; // silence console.warn
    spy = sinon.spy(console, 'warn');
  });

  beforeEach(function () {
    resultObj = {};
  });

  it('Should populate properties if valid', function () {
    var checkObj = {
      'testNumber': 123,
      'testString': 'test',
      'testBoolean': true,
      'testStringArray': ['test', 'test2'],
      'testNumberArray': [123, 123],
      'testBooleanArray': [true, false, true]
    };

    Util.functionValidation(resultObj, checkObj, checkSchema);

    Object.keys(checkObj).forEach(function (key) {
      expect(resultObj[key]).to.equal(checkObj[key]);
    });

  });

  it('Should not populate if properties are invalid', function () {
    var checkObj = {
      'testNumber': '123',
      'testString': 123,
      'testBoolean': 'true',
      'testStringArray': [true, false],
      'testNumberArray': ['123', '123'],
      'testBooleanArray': ['true', 'false', 'true']
    };

    Util.functionValidation(resultObj, checkObj, checkSchema);

    Object.keys(checkObj).forEach(function (key) {
      var msg;
      var element = checkSchema.find(function (item) { return item.name === key; });
      if (checkObj[key].constructor === Array) {
        msg = key + ' is an array type but not all elements were of type ' + element.arrayType.name;
      }
      else {
        msg = key + ' was not the valid type. Expecting: ' + element.type.name;
      }
      expect(spy.calledWith(msg)).to.equal(true);
    });

  });

});
