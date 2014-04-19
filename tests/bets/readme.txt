This isn't really a test, but this seems a good a place as any throw throw it.

This is a mockup for a new bet system using chips instead of input boxes.  The user interface hasn't even really been started, this is just a mockup of how the 'stack' element is styled with CSS.

A few notes :

- tried to keep the dom tree to a minimum --
e.g., <div class="stack" data-value="5" data-count="15"></div>

- tried to keep number of images required to a minimum --
 top.png, middle.png, bottom.png

- A lot of this works by using the attr css attributes
-- text content is loaded in to show the value of the chip
-- height SHOULD be loaded in if ANY of the browsers supported calc & attr together:
    http://www.w3.org/TR/css3-values/#attr ... but alas, at the time of this writing, they do not.

--

Transparency is in use on the png images so a different background color can be set for each chip value.... The way it works is each of the images has a white background colour and the actual contents are transparent so you can set the bgcolor to, say, red to show red chips.

I consider this a bit of a hack -- but it is reasonable and the amount of effort to support svg is just rediculous for such a simple thing.  This of course means the image must be edited if the background colour changes from white (the mockup is showing gray to highlight the issue) the images will need to be reworked.

Incoming rant about SVG :

I tried... I really tried, for the longest time, to get an svg mask to overlay on top of the stack to get around having a white background that would eventually need to change -- but, to be perfectly honest, the browser support just isn't there.  To get it to work xbrowser with the same source and not a painful amount of sniffing / bloat, I would have had to completely rework the dom markup into svg and I wasn't too keen on doing that.... I also wanted to have both the top and bottom of the image have transparent pieces but for the life of me I couldn't get the svg to align bottom for certain pieces inside the mask... Oh it says you can use  "MaxY" -- but if you have a variable viewport -- stacks can be any size -- it all goes out the window... It was working with hard-coded lengths (in FireFox) -- but as soon as I upped the size of the stack all of a sudden I'm looking at keeping a shadow svg element up to date to ensure the thing looks right.  The whole thing is a heck of a lot more hacky than the workaround I went with.  Also viewports are confusing as all hell, especially when using a sparsly documented property that only one browser really supports.... Please, someone read the documentation for "maskUnits" and "maskContentUnits" and tell me that makes any sense from the context of setting the mask css property.  I'd love to follow the docs here: http://www.w3.org/TR/css-masking-1/ BUT NOT A SINGLE BROWSER HAS IMPLEMENTED IT.  The only thing I have to work with is firefox' mask property that's been around since the beginning of time... Oh, and don't get me started on webkit's implementation...  Having two different sets of images for masks because they want to use transparency and won't recognize luminocity is just mindboggling.  AND IE?!  Are you guys sniffing glue again?  I really wanted to throw up about a million conditional comments reaming out your users for their incompetence in browser choice but I see that they are no longer recognized... oh you'll have standards implemented so they won't be required?  GET ON IT.  

Sorry, that was pentup after trying to get this working for entirely too long.  I've left 'mask.svg' in there but I don't imagine it will make it's way into the final version unless the landscape changes considerably for the better.