'use strict';

var gulp = require('gulp');
var env = require('gulp-util').env;
var log = require('gulp-util').log;
var dateformat = require('gulp-util').date;
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var header = require('gulp-header');
var rename = require('gulp-rename');
var jshint = require('gulp-jshint');
var karma = require('gulp-karma');
var changelog = require('conventional-changelog');

var now = new Date();
var year = dateformat(now, "yyyy");
var pkg = require('./package.json');
var banner = [
  '/*!',
  ' * <%= pkg.name %> v<%= pkg.version %>',
  ' * The <%= pkg.license %> License',
  ' * Copyright (c) <%= year %> <%= pkg.authors.join(",") %>',
  ' */',
  '\n'
  ].join('\n');

var codeFiles = ['src/*.js'];
var testFiles = ['bower_components/angular/angular.js', 'bower_components/angular-mocks/angular-mocks.js', 'lib/qrcode.js', 'src/*.js', 'test/*.spec.js'];
      
gulp.task('lint', function(){
  log('Linting Files');
  return gulp.src(codeFiles)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter());
});

gulp.task('karma', function () {

  var options = {
    configFile: 'karma.conf.js',
    action: 'run'
  };

  if (process.env.TRAVIS) {
    options.browsers = ['Firefox'];
  }
    
  return gulp.src(testFiles)
    .pipe(karma(options));
});

gulp.task('build', function() {
  return gulp.src(codeFiles)
    .pipe(uglify({'evil': true}))
    .pipe(header(banner, { pkg: pkg, year: year }))
    .pipe(rename({
      ext: ".min.js"
    }))
    .pipe(gulp.dest(''));
});

gulp.task('changelog', function() {
  var fs = require('fs');
  changelog({
    repository: require('./package.json').repository.url,
    version: require('./package.json').version
  }, function(err, log){
    fs.writeFile('CHANGELOG.md', log);
  });
});

gulp.task('default', ['lint', 'karma']);
