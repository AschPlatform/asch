/* eslint import/no-extraneous-dependencies: 0 */

const shell = require('shelljs')
const moment = require('moment')
const path = require('path')
const pkg = require('./package')
const console = require('console')
const os = require('os')

const buildTime = moment().format('HH:mm:ss DD/MM/YYYY')

const arch = os.platform()

function build(osVersion, netVersion) {
  console.log(`Building ${netVersion}`)

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

  if (osVersion === 'linux' || osVersion === 'darwin') {
    shell.cp(shell.exec('which node'), `${fullPath}/bin/`)
  }

  shell.cp('-r', 'app.js', 'src', fullPath)
  shell.exec(`find ${fullPath}/src -type f -print0 | xargs -0 sed -i '' 's/localnet/${netVersion}/g'`)
  shell.sed('-i', 'testnet', netVersion, `${fullPath}/app.js`)
  shell.sed('-i', 'DEFAULT_BUILD_TIME', buildTime, `${fullPath}/app.js`)
  shell.exec(`cd ${fullPath} && npm install --production`)
  // TODO: checkout and build frontend from its git project, copy release files and cleanup.
  shell.exec(`cd ${fullPath}/public/dist && wget -q https://downloads.asch.cn/package/frontend-mainnet-5f5b3cf5.zip && unzip -qq -o frontend-mainnet-5f5b3cf5.zip`)
  shell.exec(`cd ${fullPath}/.. && tar zcf ${dir}.tar.gz ${dir}`)
  shell.exec(`ls -lh ${fullPath}.tar.gz`)
}

if (process.argv.length < 3) {
  console.log('Usage: `node build.js all` or `node build.js os net`.\nSo far only host build, no cross building support yet. Net can be localnet, testnet or mainnet.')
} else if (process.argv[2] === 'all') {
  ['localnet', 'testnet', 'mainnet'].forEach(net => build(arch, net))
} else {
  build(process.argv[2], process.argv[3])
}
