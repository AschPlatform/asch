var path = require('path');
var util = require('util');
var moment = require('moment');
var gulp = require('gulp');
var shell = require('gulp-shell');
var webpack = require('webpack-stream');
var nodeExternals = require('webpack-node-externals');
var package = require('./package');

var format = util.format;
var dir = 'asch-linux-' + package.version;
var fullpath = path.join(__dirname, 'build', dir);
var buildTime = moment().format('HH:mm:ss DD/MM/YYYY');

gulp.task('linux-build', function () {
  return gulp.src('app.js')
    .pipe(webpack({
      output: {
        filename: 'app.js'
      },
      target: 'node',
      context: __dirname,
      node: {
        __filename: true,
        __dirname: true
      },
      externals: [nodeExternals()]
    }))
    .pipe(gulp.dest(fullpath))
    .pipe(shell([
      format('cp package.json genesisBlock.json config.json aschd %s', fullpath),
      format('echo %s > %s/build-version', buildTime, fullpath),
      format('cd %s && mkdir -p public dapps', fullpath),
      format('cd %s && npm install --production', fullpath),
      format('cd %s/.. && tar zcf %s.tar.gz %s', fullpath, dir, dir)
    ]));
});