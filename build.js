/* eslint import/no-extraneous-dependencies: 0 */

const shell = require('shelljs')
const moment = require('moment')
const path = require('path')
const pkg = require('./package')
const console = require('console')
const os = require('os')

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
    shell.sed('-i', 'testnet', netVersion, `${fullPath}/app.js`)
    shell.cp(`config-${netVersion}.json`, `${fullPath}/config.json`)
  } else {
    shell.cp('config.json', fullPath)
  }

  shell.cp('genesisBlock.json', fullPath)

  if (osVersion === 'linux') {
    shell.cp(shell.exec('which node'), `${fullPath}/bin/`)
  }

  shell.cp('-r', 'app.js', 'src', fullPath)
  shell.exec(`find ${fullPath}/src -type f -print0 | xargs -0 sed -i 's/localnet/${netVersion}/g'`)
  shell.sed('-i', 'testnet', netVersion, `${fullPath}/app.js`)
  shell.sed('-i', 'DEFAULT_BUILD_TIME', buildTime, `${fullPath}/app.js`)
  shell.exec(`cd ${fullPath} && npm install --production`)

  console.log('installing front-end, please be patient ...')
  const magic = shell.exec('grep magic config.json | awk \'{print $2}\' | sed -e \'s/[",]//g\'', { silent: true }).stdout.trim()
  const branch = shell.exec('git branch | grep \\* | cut -d \' \' -f2', { silent: true }).stdout.trim()
  // It is quite possible that last build stop before cleanup frontend files
  if (shell.test('-e', `${fullPath}/tmp/asch-frontend-2`)) {
    shell.rm('-rf', `${fullPath}/tmp/asch-frontend-2`, { silent: true })
  }
  shell.exec(`cd ${fullPath}/tmp && pwd && git clone --single-branch -b ${branch} https://github.com/AschPlatform/asch-frontend-2.git \
     && cd asch-frontend-2 && yarn install && pwd && sed -i '' 's/5f5b3cf5/${magic}/g' src/utils/constants.js \
     && quasar build && cp -r dist/spa-mat/* ../../public/dist/ && rm -rf asch-frontend-2`, { silent: false })

  // done, create tarball
  shell.exec(`cd ${fullPath}/.. && tar zcf ${dir}.tar.gz ${dir}`)
  shell.exec(`ls -lh ${fullPath}.tar.gz`)
}

if (process.argv.length < 3) {
  console.log('Usage: `node build.js all` or `node build.js os net`.\nSo far only host build, no cross building support yet. Net can be localnet, testnet or mainnet.')
} else if (process.argv[2] === 'all') {
  ['localnet', 'testnet', 'mainnet'].forEach(net => build(os.platform(), net))
} else {
  build(process.argv[2], process.argv[3])
}
