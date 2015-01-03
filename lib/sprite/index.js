/**
 * @file sprite.js
 * This file handles taking a sprite image grid with details about what it means
 * and allows for creation of css rules and dom elements that reference them.
 * The DOM elements include meta data as data-* attributes and the CSS referenes these.
 * e.g.,
 *  html :
 *  <div data-suit="clubs" data-value="ace" class='card' />
 *  css :
 *   .card[data-suit="clubs"] { background-position-x: 999; }
 *   .card[data-value="ace"] { background-position-y: 999; }
 *   .card{ background-image: url(sprites.png); }
 * @todo: drop jquery requirement.
 * @requires Util
 */

'use strict';

var $ = require('jquery');

var Util = require('Util');

/**
 * @typedef {object} SpriteSchema associative array of data about the sprite
 * @property {string} filename relative path to sprite file
 * @property {string} id class name to identify the sprite (e.g. 'card')
 * @property {number} row_height height of a row (e.g. 32)
 * @property {number} col_width width of a column (e.g. 32)
 * @property {string} row_id the row identifier (e.g., 'value')
 * @property {string} col_id the col identifier (e.g., 'suit')
 * @property {Array<string>} row_data data about the row (e.g. ['Ace', 'Two', etc.]
 * @property {Array<string>} col_data data about the column (e.g. ['Spade', 'Heart', etc.]
 */

/**
 * @class Sprite
 * This returns an object with a few methods to create DOM elements
 * It will also add the required css classes to the head of the current document.
 * @param {SpriteSchema} schema
 * @example
 *   var schema = {
 *     filename: 'cards.png',
 *     id: 'card',
 *     row_id: 'suit',
 *     row_data: ['Spades', 'Hearts', 'Diamonds', 'Clubs'],
 *     row_height: 32
 *     col_id: 'value',
 *     col_data: ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Jack','Queen','King'],
 *     col_width: 23
 *   };
 *   var sprite = new Sprite(schema)
 *   var fiveOfClubs = sprite.get({suit:'spades', value:'Ace'});
 *   // <div data-suit="spades" data-value="ace" class='card' />
 * @todo: drop jquery requirement.
 */

var Sprite = module.exports = function (schema) {

  // call our validation function - this puts all the values on [this]
  Util.functionValidation(this, schema, [
    {'name': 'filename', 'type': String},
    {'name': 'id', 'type': String},
    {'name': 'row_id', 'type': String},
    {'name': 'row_data', 'type': Array, 'arrayType': String},
    {'name': 'row_height', 'type': Number},
    {'name': 'col_id', 'type': String},
    {'name': 'col_data', 'type': Array, 'arrayType': String},
    {'name': 'col_width', 'type': Number}
  ]);

  // with that out of the way, we can start to build the css classes and append to the page.
  // start with the general id declaration adding the filename as the background and the height/width of each sprite
  var css = '.' + this.id + ' {width:' + this.col_width + 'px; height:' + this.row_height + 'px; background: url("' + this.filename + '")}\n';

  // in their infinite wisdom, firefox decided to kill background-position-x and background-position-y
  // this is unfortunate because what I wanted to do here would have been the perfect use case for it.
  // to get around this, we need to increase the number of rules by quite a bit to compensate.
  // where before we could get by with X+Y number of rules; now we need X*Y rules ... :(
  for (var x = 0; x < this.col_data.length; x += 1) {
    for (var y = 0; y < this.row_data.length; y += 1) {
      var row = '[data-' + this.row_id + '="' + this.row_data[y] + '"]';
      var col = '[data-' + this.col_id + '="' + this.col_data[x] + '"]';
      var width = '-' + x * this.col_width + 'px';
      var height = '-' + y * this.row_height + 'px';
      css += '.' + this.id + row + col + ' {background-position:' + width + ' ' + height + '}\n';
    }
  }

  // use jquery to build the style tag and append it to the head of the document if it doesn't already exist
  var $styles = $('#sprite-' + this.id);
  if ($styles.size() === 0) {
    $('head').append('<style type="text/css" id="sprite-' + this.id + '">' + css + '</style>');
  }
  else {
    $styles.html(css);
  }

};

/**
 * @name Sprite.domElement
 * @type {string}
 * @summary type of element the Sprites will be wrapped in
 * @todo rethink this, might make sense as a default property on schema
 */
Sprite.domElement = 'div';

/**
 * @function Sprite.prototype.get
 * @instance
 * @summary Returns a dom element matching a particular query
 * @param {*} [query] associative array of keys matching either row_id or col_id within the sprite's row_data or col_data.
 *  If a query for a particular row_id/col_id has not been provided, all elements for that row/col will be returned.
 *  This parameter can be omitted to return everything.
 * @example
 *  sprite.get({'suit': 'Spades', 'value': 'Ace'});
 *  [<div data-suit="Spades" data-value="Ace" class="card" />]
 * @returns {Array<DomNode>} array of DOMElements with data-attributes specified for both row and column values.
 * @todo is this as clean as it could be?  do I run the risk of making it cute & unreadable?
 */
Sprite.prototype.get = function (query) {

  // start out with nothing
  var rowQuery = null;
  var colQuery = null;
  var schema = this; // jQuery - y u no provide [this] override for $.each ?!

  // figure out if the query key provided matches the col_id or row_id
  // if so, verify the query value matches one of the elements - if yes, set the query value.
  if (typeof query !== 'undefined') {
    Object.keys(query).forEach(function (key) {
      var prop = query[key];
      if (schema.row_id === key && schema.row_data.indexOf(prop) > -1) {
        rowQuery = prop;
      }
      if (schema.col_id === key && schema.col_data.indexOf(prop) > -1) {
        colQuery = prop;
      }
    });
  }

  var ret = [];

  // this seems easier than callback soup
  for ( var x = 0; x < this.row_data.length; x += 1) {
    if (rowQuery !== null && this.row_data.indexOf(rowQuery) === -1) {
      continue;
    }
    for ( var y = 0; y < this.col_data.length; y += 1) {
      if (colQuery !== null && this.col_data.indexOf(colQuery) === -1) {
        continue;
      }
      var newSprite = document.createElement(Sprite.domElement);
      newSprite.classList.add(this.id);
      newSprite.dataset[this.row_id] = this.row_data[x];
      newSprite.dataset[this.col_id] = this.col_data[y];
      ret.push(newSprite);
    }
  }

  return ret;
};
