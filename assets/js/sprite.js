/**
 * @file sprite.js
 * This file handles taking a sprite image grid with details about what it means
 * and allows for creation of css rules and dom elements that reference them.
 * 
 * The DOM elements include meta data as data-* attributes and the CSS referenes these.
 *
 * e.g.,
 *  html :
 *  <div data-suit="clubs" data-value="ace" class='card' />
 * 
 *  css :
 *   .card[data-suit="clubs"] { background-position-x: 999; }
 *   .card[data-value="ace"] { background-position-y: 999; }
 *   .card{ background-image: url(sprites.png); } 
 */
 

/**
 * Sprite constructor.
 * This returns an object with a few methods to create DOM elements
 * It will also add the required css classes to the head of the current document.
 *
 * @param schema
 *  associative array of data about the sprite
 *   - filename: relative path to sprite file
 *   - id: class name to identify the sprite (e.g. 'card')
 *   - row_id: the row identifier (e.g., 'value')
 *   - row_data: data about the row (e.g. ['Ace', 'Two', etc.]
 *   - row_height: height of a row (e.g. 32)
 *   - col_id: the col identifier (e.g., 'suit')
 *   - col_data: data bout the column (e.g. ['Spade', 'Heart', etc.]
 *   - col_width: width of a column (e.g. 32)
 *
 * @example
 *  
 *   var sprite = new Sprite({
 *     filename: 'cards.png',
 *     id: 'card',
 *     row_id: 'suit',
 *     row_data: ['Spades', 'Hearts', 'Diamonds', 'Clubs'],
 *     row_height: 32
 *     col_id: 'value',
 *     col_data: ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Jack','Queen','King'],
 *     col_width: 23
 *   })
 *     
 *   var fiveOfClubs = sprite.get({suit:'spades', value:'Ace'});
 *   // <div data-suit="spades" data-value="ace" class='card' />
 * 
*/

;(function($){


window['Sprite'] = function (schema) {

  // perform some validations on the schema argument - check both for presence of properties and their types
  [
    {name: 'filename', type: String},
    {name: 'id', type: String},
    {name: 'row_id', type: String},
    {name: 'row_data', type: Array},
    {name: 'row_height', type: Number},
    {name: 'col_id', type: String},
    {name: 'col_data', type: Array},
    {name: 'col_width', type: Number}
  ].forEach(function(element, index, array) {
  
    // check that the passed parameter is present in the argument at all, throw exception if not.
    if (typeof schema[element.name] === 'undefined') {
      throw new TypeError("Exception in Sprite(): " + element.name + " was not provided!");
    }
    
    // check that the passed parameter is of the correct type, throw exception if not
    // todo: verify this works in other browsers... I'm looking at you IE<=8
    else if (!(schema[element.name].constructor === element.type)) {
      throw new TypeError("Exception in Sprite(): " + element.name + " was not the valid type. Expecting: " + element.type.name);
    }
    
    // if the property is both present and of the correct type, add it to [this]
    else {
      this[element.name] = schema[element.name];
    }
  }, this);

  // with that out of the way, we can start to build the css classes and append to the page.
  // start with the general id declaration adding the filename as the background and the height/width of each sprite
  var css = '.' + this.id + ' {width:'+ this.col_width +'px; height:'+ this.row_height +'px; background: url("' + this.filename + '")}\n';
  
  // in their infinite wisdom, firefox decided to kill background-position-x and background-position-y
  // this is unfortunate because what I wanted to do here would have been the perfect use case for it.
  // to get around this, we need to increase the number of rules by quite a bit to compensate.
  // where before we could get by with X+Y number of rules; now we need X*Y rules ... :(
  for( var x=0; x<this.col_data.length; x+=1) {
    for( var y=0; y<this.row_data.length; y+=1) {
      var row = '[data-'+ this.row_id +'="'+ this.row_data[y] +'"]';
      var col = '[data-'+ this.col_id +'="'+ this.col_data[x] +'"]';
      var width = '-' + (x * this.col_width) + 'px';
      var height = '-' + (y * this.row_height) + 'px';
      css += '.'+ this.id + row + col +' {background-position:'+ width + ' ' + height + '}\n';
    }
  }
  
  // use jquery to build the style tag and append it to the head of the document if it doesn't already exist
  $styles = $('#sprite-' + this.id);
  if ($styles.size() === 0) {
    $('head').append('<style type="text/css" id="sprite-'+ this.id +'">' + css + '</style>');
  } 
  else {
    $styles.html(css);
  }

}

/**
 * Sprite.domElement
 * The type of element the Sprites will be wrapped in
 * todo: rethink this, might make sense as a default property on schema
 */
Sprite.domElement = "div";


/**
 * Sprite.prototype.get
 * Return a dom element matching a particular query
 *
 * @param query
 *  Associative array with keys matching either the row_id or col_id and values contained within row_data or col_data
 *  If a query for a particular row_id/col_id has not been provided, all elements for that row/col will be returned.
 *  This parameter can be omitted to return everything.
 *
 * @example
 *  sprite.get('suit': 'Spades', 'value': 'Ace');
 *
 * @returns
 *  Array of DOMElement with data-attributes specified for both row and column values.
 *  e.g., [<div data-suit="Spades" data-value="Ace" class="card" />]
 *
 * todo: is this as clean as it could be?  do I run the risk of making it cute & unreadable?
 */
Sprite.prototype.get = function (query) {

  // start out with nothing
  var row_query = null;
  var col_query = null;
  var schema = this; // jQuery - y u no provide [this] override for $.each ?!

  // when provided, ensure the property exists on either row_id or col_id before setting query properties
  // also ensure the value provided matches something in the data array.
  // this will throw an exception if the provided property is not valid.
  if (typeof query !== 'undefined') {
    $.each(query, function (prop, val) {
      if (schema.row_id === prop) {
        if (schema.row_data.indexOf(val) > -1) {
          row_query = val;
        }
        else {
          throw new TypeError("Exception in Sprite.prototype.get: " + prop + " was provided but "+ val +" is not a valid key.");
        }
      }
      else if (schema.col_id === prop) {
        if (schema.col_data.indexOf(val) > -1) {
          col_query = val;
        }
        else {
          throw new TypeError("Exception in Sprite.prototype.get: " + prop + " was provided but "+ val +" is not a valid key.");
        }
      }
      else {
        throw new TypeError("Exception in Sprite.prototype.get: " + prop + " was not found in either row_id or col_id");
      }
    });
  }

  var ret = [];

  if( row_query !== null && col_query !== null) {
    ret.push(
      $("<" + Sprite.domElement + ">")
        .addClass(this.id)
        .attr('data-' + this.row_id, row_query)
        .attr('data-' + this.col_id, col_query)
    );
  }
  // otherwise we have some iterating to do.
  else if (row_query === null && col_query !== null) {
    this.row_data.forEach(function (element, index, array) {
      ret.push(
        $("<" + Sprite.domElement + ">")
          .addClass(this.id)
          .attr('data-' + this.row_id, element)
          .attr('data-' + this.col_id, col_query)
      );
    }, this);
  }
  else if (col_query === null && row_query !== null) {
    this.col_data.forEach(function (element, index, array) {
      ret.push(
        $("<" + Sprite.domElement + ">")
          .addClass(this.id)
          .attr('data-' + this.row_id, row_query)
          .attr('data-' + this.col_id, element)
      );
    }, this);
  }
  else {
    // this seems easier than callback soup
    for( var x=0; x<this.col_data.length; x+=1) {
      for( var y=0; y<this.row_data.length; y+=1) {
        ret.push(
          $("<" + Sprite.domElement + ">")
            .addClass(this.id)
            .attr('data-' + this.row_id, this.row_data[y])
            .attr('data-' + this.col_id, this.col_data[x])
        );
      }
    }
  }

  return ret;
}

})(jQuery);