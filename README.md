<h1>Casino</h1>
<p>This is very much a work in progress.</p>
<p>Very basic card games in javascript.</p>
<h2>Install</h2>
<p>Sure, if you could call it that...</p>
<pre>
bundle
rake compile
open up build/index.htm and enjoy
</pre>
<h2>Notes</h2>
<p>I'm using CYGWIN under Windows7 for development and there are a few things I needed to do to get ExecJS to work.</p>
<p>There's a patch in the 'patches' directory to be applied to ExecJS - this applies to the 2.0.2 version (couldn't get it to work on 2.2.0)</p>
<p>With that done, there's a few issues with using Windows native JScript runtime and ExecJS - I kept getting an out of stack space error using uglifyjs.</p>
<p>To get around this, I installed node.js - this seems to work pretty well when installed using the windows installer; execjs is able to pick it up and use it.</p>
 
