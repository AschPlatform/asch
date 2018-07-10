const shell = require('shelljs')
const moment = require('moment')
const path = require('path')
const pkg = require('./package')

const buildTime = moment().format('HH:mm:ss DD/MM/YYYY')

function build(osVersion, netVersion) {
  const dir = `asch-${osVersion}-${pkg.version}-${netVersion}`
  const fullPath = path.join(__dirname, 'build', dir)
  shell.mkdir('-p', fullPath)
  shell.cd(fullPath)
  shell.mkdir('-p', 'public/dist', 'chains', 'tmp', 'logs', 'bin', 'data')
  shell.cd(__dirname)
  shell.cp('-r', 'package.json', 'aschd', 'init', 'app.js', 'src', fullPath)
  if (netVersion !== 'localnet') {
    shell.sed('-i', 'testnet', netVersion, `${fullPath}/aschd`)
    shell.cp(`config-${netVersion}.json`, `${fullPath}/config.json`)
    shell.cp(`genesisBlock-${netVersion}.json`, `${fullPath}/genesisBlock.json`)
  } else {
    shell.cp('config.json', fullPath)
    shell.cp('genesisBlock.json', fullPath)
  }

  if (osVersion === 'linux') {
    shell.cp(shell.exec('which node'), `${fullPath}/bin/`)
  }

  shell.cp('-r', 'app.js', 'src', fullPath)
  shell.exec(`find ${fullPath}/src -type f -print0 | xargs -0 sed -i 's/localnet/${netVersion}/g'`)
  shell.sed('-i', 'localnet', netVersion, `${fullPath}/app.js`)
  shell.sed('-i', 'DEFAULT_BUILD_TIME', buildTime, `${fullPath}/app.js`)
  shell.exec(`cd ${fullPath} && npm install --production`)
  shell.exec(`cd ${fullPath}/.. && tar zcf ${dir}.tar.gz ${dir}`)
}

build(process.argv[2], process.argv[3])
