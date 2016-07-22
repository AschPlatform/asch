var path = require('path');
var util = require('util');
var moment = require('moment');
var gulp = require('gulp');
var shell = require('gulp-shell');
var replace = require('gulp-replace');
var webpack = require('webpack-stream');
var nodeExternals = require('webpack-node-externals');
var package = require('./package');

var format = util.format;
var buildTime = moment().format('HH:mm:ss DD/MM/YYYY');

function linuxBuild(netVersion) {
  var dir = 'asch-linux-' + package.version + '-' + netVersion;
  var fullpath = path.join(__dirname, 'build', dir);
  var configFile = 'config-' + netVersion + '.json';
  var genesisBlockFile = 'genesisBlock-' + netVersion + '.json';
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
    .pipe(replace('localnet', netVersion))
    .pipe(replace('development', buildTime))
    .pipe(gulp.dest(fullpath))
    .pipe(shell([
      format('cd %s && mkdir -p public dapps tmp logs', fullpath),
      format('cp -r package.json aschd init %s', fullpath),
      format('sed -i "s/testnet/%s/g" %s/aschd', netVersion, fullpath),
      format('cp config-%s.json %s/config.json', netVersion, fullpath),
      format('cp genesisBlock-%s.json %s/genesisBlock.json', netVersion, fullpath),
      format('cp -r public/dist %s/public/', fullpath),
      // format('cd %s && npm install --production', fullpath),
      format('cd %s/.. && tar zcf %s.tar.gz %s', fullpath, dir, dir)
    ]));
}

gulp.task('linux-build-test', function () {
  return linuxBuild('testnet');
});

gulp.task('linux-build-main', function () {
  return linuxBuild('mainnet');
});