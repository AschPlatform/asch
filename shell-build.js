const shell = require('shelljs');
const moment = require('moment');
const path = require('path');
const package = require('./package');

const buildTime = moment().format('HH:mm:ss DD/MM/YYYY');

function build(osVersion, netVersion) {
  let dir = `asch-${osVersion}-${package.version}-${netVersion}`;
  let fullPath = path.join(__dirname, 'build', dir);
  shell.mkdir('-p', fullPath);
  shell.cd(fullPath);
  shell.mkdir('-p', 'public', 'chains', 'tmp', 'logs', 'bin', 'data');
  shell.cd(__dirname);
  shell.cp('-r', 'package.json', 'aschd', 'init', 'proto', 'app.js', 'src', 'builtin', fullPath);
  if ( netVersion !== 'localnet' ) {
    shell.sed('-i', 'testnet', netVersion, `${fullPath}/aschd`);
    shell.cp(`config-${netVersion}.json`, `${fullPath}/config.json`);
    shell.cp(`genesisBlock-${netVersion}.json`, `${fullPath}/genesisBlock.json`);
  } else {
    shell.cp('config.json', `${fullPath}/`);
    shell.cp('genesisBlock.json', `${fullPath}/`);
    shell.cp('third_party/sqlite3.exe', `${fullPath}`);
  }

  if (osVersion === 'linux') {
    shell.cp(shell.exec('which node'), `${fullPath}/bin/`);
  }

  shell.cp('-r', 'app.js', 'src', fullPath);
  //shell.cp('-r', 'public/dist', `${fullPath}/public/`);
  shell.exec(`cd ${fullPath} && npm install --production`);
  shell.exec(`cd ${fullPath}/.. && tar zcf ${dir}.tar.gz ${dir}`);
  shell.exec(`find ./src -type f -print0 | xargs -0 sed -i 's/localnet/${netVersion}/g'`);
  shell.sed('-i', 'localnet', netVersion, 'app.js');
  shell.sed('-i', 'DEFAULT_BUILD_TIME', buildTime);
}

//build('win64', 'localnet');
build('linux', 'localnet');
//build('win64', 'testnet');
//build('linux', 'testnet');
//build('win64', 'mainnet');
//build('linux', 'mainnet');