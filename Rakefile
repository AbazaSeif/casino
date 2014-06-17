require 'rubygems'
require 'pathname'
require 'erb'
require 'bundler'

$stdout.sync = true

$ROOT = Pathname(File.dirname(__FILE__))
$SOURCE_PATH = $ROOT.join('src')
$BUILD_PATH = $ROOT.join('build')
$IMAGES_DIR = $BUILD_PATH.join('img')
$CSS_DIR = $BUILD_PATH.join('css')
$JS_DIR = $BUILD_PATH.join('js')


task :default do
  puts 'The following tasks are available...'
  system('rake -T')  
end

desc 'Test some stuff'
task :test do
  puts 'Nothing to see here, folks.'
end

desc 'Clean the output directory'
task :clean do
  rm_rf $BUILD_PATH
  mkdir $BUILD_PATH
  mkdir $IMAGES_DIR
  mkdir $CSS_DIR
  mkdir $JS_DIR
end

desc 'Compile all the things'
task :compile => [:clean] do
  print "Performing compilation task...\n"
  
  html
  javascript
  images
  compass
  
  print "Done!\n"
end

# use erb to mark up the html template file
def html
  print 'Marking up html...'
  html_file = $SOURCE_PATH.join('templates') + 'index.tmpl'
  File.open($BUILD_PATH + 'index.htm', 'w') { |f|
    $css_path = $CSS_DIR.relative_path_from($BUILD_PATH) + 'style.css'
    $javascript_path = $JS_DIR.relative_path_from($BUILD_PATH) + 'page.js'
    template = ERB.new(File.read(html_file))
    f.puts template.result
  }
  print "Done!\n"
end

# use uglify js to compile and copy js to build directory
def javascript
  print 'Uglyfing JS...'
  require 'uglifier'
  js_path = $SOURCE_PATH.join('javascript')
  files = [
    'array.js',
    'lib.js',
    'sprite.js',
    'bets.js',
    'chips.js',
    'game.js',
    'game-interface.js',
    'blackjack.js',
    'hilow.js',
    'solitaire.js',
    'index.js'
  ]

  src = ''
  files.each do |f|
    src += File.read js_path + f
  end
  File.open($JS_DIR + 'page.js', 'w') {|out|
    out.puts Uglifier.new.compile_with_map( src )
  }  
  print "Done!\n"
end

# copy over images to directory
def images
  print "Copying images over...\n"
  source_path = $SOURCE_PATH.join('images').to_s + '/*.*'
  dest_path = $IMAGES_DIR.to_s
  cp Dir[source_path].collect{|f| File.expand_path(f)}, dest_path
  print "Done!\n"
end

# compass compilation function
def compass
  print "Compass compile...\n"
  cmd = "compass compile #{$SOURCE_PATH}"
  cmd << " --sass-dir #{$SOURCE_PATH.join('stylesheets')}"
  cmd << " --css-dir #{$BUILD_PATH.join('css')}"
  cmd << " --image-dir #{$IMAGES_DIR}"  
  cmd << " --relative-assets"
  cmd << " --output-style compressed"  
  system(cmd)  
end
