
'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var nano = require('gulp-cssnano');
var replaceName = require('gulp-replace-name');

gulp.task('default', ['sass', 'watch']);

gulp.task('sass', function() {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'))
    .pipe(nano())
    .pipe(replaceName(/\.css/g, '.min.css'))
    .pipe(gulp.dest('./css'));
});

gulp.task('watch', function() {
  gulp.watch('./sass/**/*.scss', ['sass']);
});
