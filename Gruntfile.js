/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    dirs: {
      build: 'build',
      src: 'src',
      javascript: '<%= dirs.src %>/javascript',
      stylesheets: '<%= dirs.src %>/stylesheets',
      templates: '<%= dirs.src %>/templates',
      images: '<%= dirs.src %>/images'
    },
    // Task configuration.
    clean: {
      dist: '<%= dirs.build %>'
    },
    copy: {
      dist: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.images %>/',
            src: '*.*',
            dest: '<%= dirs.build %>/img/'
          },
          {
            expand: true,
            flatten: true,
            cwd: '<%= dirs.javascript %>/',
            src: '*.js',
            dest: '<%= dirs.build %>/js/src/'
          }
        ]
      }
    },
    template: {
      'process_index': {
        'options': {
          data: {
            js_file: 'js/page.min.js',
            css_file: 'css/style.css'
          }
        },
        files: {
          '<%=dirs.build%>/index.htm': ['<%=dirs.templates%>/index.tmpl']
        }
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        sourceMap: true,
        sourceMapName: '<%= dirs.build %>/js/page.map.js'
      },
      dist: {
        files: {
          '<%= dirs.build%>/js/page.min.js': [
            '<%= dirs.build%>/js/src/array.js',
            '<%= dirs.build%>/js/src/lib.js',
            '<%= dirs.build%>/js/src/sprite.js',
            '<%= dirs.build%>/js/src/bets.js',
            '<%= dirs.build%>/js/src/chips.js',
            '<%= dirs.build%>/js/src/game.js',
            '<%= dirs.build%>/js/src/game-interface.js',
            '<%= dirs.build%>/js/src/blackjack.js',
            '<%= dirs.build%>/js/src/hilow.js',
            '<%= dirs.build%>/js/src/solitaire.js',
            '<%= dirs.build%>/js/src/index.js'
          ]
        }
      }
    },
    compass: {
      dist: {
        options: {
          //basePath: '<%= dirs.src %>',
          cssDir: '<%= dirs.build %>/css',
          sassDir: '<%= dirs.stylesheets %>',
          imagesDir: '<%= dirs.build %>/img',
          relativeAssets: true,
          outputStyle: 'compressed',
          trace: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-template');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compass');

  // Default task.
  grunt.registerTask('default', ['clean', 'copy', 'template', 'uglify', 'compass']);

};
