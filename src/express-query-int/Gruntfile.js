'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    // Lint js
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      files: {
        src: ['lib/**/*.js']
      }
    },

    // Run tests
    nodeunit: {
      tests: ['test/*_test.js']
    },
  });

  grunt.registerTask('test', [
    'jshint',
    'nodeunit'
  ]);

  grunt.registerTask('default', [
    'test'
  ]);

};
