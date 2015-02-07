/*eslint-env node */
'use strict';

module.exports = function (grunt) {

  var allTasks = [
    'clean',
    'copy',
    'webmake',
    'uglify',
    'jsdoc'
  ];

  grunt.initConfig({
    'clean': {
      'dist': ['dist', 'docs']
    },
    'copy': {
      'dist': {
        'files': [{
          'expand': true,
          'flatten': true,
          'cwd': 'static',
          'src': 'app.html',
          'dest': 'dist/'
        }, {
          'expand': true,
          'flatten': true,
          'cwd': 'static/images',
          'src': '*.*',
          'dest': 'dist/img/'
        }, {
          'cwd': 'components/i18next/',
          'src': 'i18next.min.js',
          'expand': true,
          'dest': 'dist/vendor/'
        }, {
          'cwd': 'components/jquery/dist/',
          'src': 'jquery.min.js',
          'expand': true,
          'dest': 'dist/vendor/'
        }]
      }
    },
    'webmake': {
      'options': {
        'ext': ['sass', 'ejs']
      },
      'dist': {
        'files': {
          'dist/js/app.js': ['lib/app/app.js']
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
    'jsdoc': {
      'dist': {
        'src': ['README.md', 'lib/**/*.js'],
        'options': {
          'destination': 'docs',
          'private': false
          //'template': 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          //'configure': 'jsdoc.conf.json'
        }
      }
    },
    'watch': {
      'scripts': {
        'files': ['README.md', 'Gruntfile.js', 'lib/**/*.js', 'lib/**/*.json', 'lib/**/*.scss', 'lib/**/*.ejs'],
        'tasks': allTasks
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-webmake');

  grunt.registerTask('default', allTasks);
  grunt.registerTask('dev', allTasks.concat(['watch']));

};
