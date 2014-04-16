
(function($){
  
  if (!(tests instanceof Array)) return;
  
  // testing sprite.js
  tests.push({
    module:'sprites', 
    tests:function() {
    
      // return values
      var ret = [];
      
      // test schema data
      var row_id = 'suit'
      var row_data = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
      var col_id = 'value'
      var col_data = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Jack','Queen','King'];
      var sprite;
      var schema = {
        filename: '../assets/img/cards.png',
        id: 'card',
        row_id: row_id,
        row_data: row_data,
        row_height: 96,
        col_id: col_id,
        col_data: col_data,
        col_width: 71
      };
      
      try {
        sprite = new Sprite(schema);
      }
      catch(e) {
        // this shouldn't fail, but who knows
      }
      finally {
        ret.push({
          name: 'Sprite is created properly with good data.',
          condition: typeof sprite !== 'undefined',
          message: 'Failure!',
        });
        sprite = undefined;
      }
      
      try {
        var old_id = schema.id;
        delete schema.id;
        sprite = new Sprite(schema);
      } 
      catch(e) {
        // this should fail
      }
      finally {
        ret.push({
          name: 'Sprite fails to create with missing data.',
          condition: typeof sprite === 'undefined',
          message: 'Failure!',
        });
        // return to previous state
        sprite = undefined;
        schema.id = old_id; 
      }
      
      try {
        var old_width = schema.col_width;
        schema.col_width = "nope!";
        sprite = new Sprite(schema);
      } 
      catch(e) {
        // this should fail
      }
      finally {
        ret.push({
          name: 'Sprite fails to create with bad data.',
          condition: typeof sprite === 'undefined',
          message: 'Failure!',
        });
        // return to previous state
        sprite = undefined;
        schema.col_width = old_width;
      }
      
      sprite = new Sprite(schema);
      
      var $styles = $("#sprite-" + sprite.id);
      ret.push({ 
        name: 'The style tag is added properly.',
        condition: $styles.size() === 1, 
        message:"Multiple styles have been added...for shame!"}
      );
      
      var card;
      
      card = sprite.get({'suit': row_data[0], 'value': col_data[0]});
      ret.push({
        name: 'Calling get for a specific row/col returns a single element.', 
        condition: card.length === 1, 
        message: "Failed - multiple elements returned!"
      });
      
      try {
        card = undefined;
        card = sprite.get({'zzz': 'zzzz'});
      } catch(e) {
        // this should fail.        
      }
      finally {
        ret.push({
          name: 'Calling get with a bad property fails.', 
          condition: typeof card === 'undefined', 
          message: "Failed - card is not undefined."
        });      
      }
      
      try {
        card = undefined;
        card = sprite.get({'suit': 'zzzz'});
      } catch(e) {
        // this should fail.        
      }
      finally {
        ret.push({
          name: 'Calling get with a good property with bad value fails.', 
          condition: typeof card === 'undefined', 
          message: "Failed - card is not undefined"
        });      
      }
      
      var suit = sprite.get({'suit': row_data[0]});
      ret.push({ 
        name: 'Calling get passing one property works properly - row_data.',
        condition: suit.length === col_data.length, 
        message: "Row test failed - "+ col_data.length +" elements not present"
      });
      
      var value = sprite.get({'value': col_data[0]});
      ret.push({ 
        name: 'Calling get passing one property works properly - col_data.',
        condition: value.length === row_data.length, 
        message: "Value query test failed - "+ row_data.length +" elements not present"
      });
      
      var expected_all = row_data.length * col_data.length;
      ret.push({ 
        name: 'Calling get passing no parameters returns all elements',
        condition: sprite.get().length === expected_all, 
        message: "All query test failed - "+ expected_all +" elements not present"
      });
      
      // this doesn't use tests - but uncomment to get a visual representation of all the cards
      // $.each( sprite.get(), function(item, value) {
      //   $('body').append(value);
      //});
      
      return ret;
    }
    
  });
  
})(jQuery);
