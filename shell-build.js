var path = require('path');
var util = require('util');
var moment = require('moment');
var shell = require('shelljs')
var package = require('./package');

var format = util.format;
var buildTime = moment().format('HH:mm:ss DD/MM/YYYY');
var DEFAULT_BUILD_TIME = '18:07:38 07/06/2018'

function build(osVersion, netVersion) {
  var dir = 'asch-' + osVersion + '-' + package.version + '-' + netVersion;
  var fullpath = path.join(__dirname, 'build', dir);
  var cmds = [];
  cmds.push(format('cd %s && mkdir -p public chains tmp logs bin data', fullpath));
  cmds.push(format('cp -r package.json aschd init proto app.js src builtin %s', fullpath));
  if (netVersion != 'localnet') {
    cmds.push(format('sed -i "s/testnet/%s/g" %s/aschd', netVersion, fullpath));
    cmds.push(format('cp config-%s.json %s/config.json', netVersion, fullpath));
    cmds.push(format('cp genesisBlock-%s.json %s/genesisBlock.json', netVersion, fullpath));
  } else {
    cmds.push(format('cp config.json %s/', fullpath));
    cmds.push(format('cp genesisBlock.json %s/', fullpath));
    cmds.push(format('cp third_party/sqlite3.exe %s/', fullpath));
  }
  if (osVersion == 'linux') {
    cmds.push(format('cp `which node` %s/bin/', fullpath));
  }
  cmds.push(format('cp -r app.js src %s', fullpath));
  cmds.push(format('cp -r public/dist %s/public/', fullpath));
  cmds.push(format('cd %s && npm install --production', fullpath));
  cmds.push(format('cd %s/.. && tar zcf %s.tar.gz %s', fullpath, dir, dir));

  replace 'localnet' by netVersion in files that in (app.js src/\*)
  replace DEFAULT_BUILT_TIME by buildTime (app.js )
}

gulp.task('win64-build-local', function () {
  return build('win64', 'localnet');
});

gulp.task('linux-build-local', function () {
  return build('linux', 'localnet');
});

gulp.task('win64-build-test', function () {
  return build('win64', 'testnet');
});

gulp.task('linux-build-test', function () {
  return build('linux', 'testnet');
});

gulp.task('win64-build-main', function () {
  return build('win64', 'mainnet');
});

gulp.task('linux-build-main', function () {
  return build('linux', 'mainnet');
});