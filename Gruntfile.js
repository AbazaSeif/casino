/*eslint-env node */
'use strict';

module.exports = function (grunt) {

  var allTasks = [
    'clean',
    'copy',
    'sass',
    'ejs',
    'webmake',
    'uglify'
  ];

  grunt.initConfig({
    'clean': {
      'dist': 'dist'
    },
    'copy': {
      'dist': {
        'files': [{
          'expand': true,
          'flatten': true,
          'cwd': 'static/images',
          'src': '*.*',
          'dest': 'dist/img/'
        }, {
          'cwd': 'components/jquery/dist/',
          'src': 'jquery.min.js',
          'expand': true,
          'dest': 'dist/vendor/'
        }]
      }
    },
    'sass': {
      'dist': {
        'files': {
          'dist/css/app.css': ['lib/styles/app.scss']
        }
      }
    },
    'ejs': {
      'dist': {
        'src': ['lib/app.ejs'],
        'dest': 'dist/app.html',
        'ext': 'html',
        'options': {
          'jsFile': 'js/app.js',
          'cssFile': 'css/app.css'
        }
      }
    },
    'webmake': {
      'options': {
        'ext': ['sass']
      },
      'dist': {
        'files': {
          'dist/js/app.js': ['lib/app.js']
        }
      }
    },
    // todo: figure out how to exclude jquery.
    // either by rewriting to not use or reworking reference to not include webmake.
    // the file size is killing me, also builds are painfully slow.
    'uglify': {
      'options': {
        'banner': '<%= banner %>',
        'sourceMap': true,
        'sourceMapName': 'dist/js/app.map.js'
      },
      'dist': {
        'files': {
          'dist/js/app.min.js': ['dist/js/app.js']
        }
      }
    },
    'watch': {
      'scripts': {
        'files': ['README.md', 'Gruntfile.js', 'lib/**/*.js', 'lib/**/*.scss'],
        'tasks': allTasks
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ejs');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-webmake');

  grunt.registerTask('default', allTasks);
  grunt.registerTask('dev', allTasks.concat(['watch']));

};
