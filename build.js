/* eslint import/no-extraneous-dependencies: 0 */

const shell = require('shelljs')
const moment = require('moment')
const path = require('path')
const pkg = require('./package')
const console = require('console')
const os = require('os')

const buildTime = moment().format('HH:mm:ss DD/MM/YYYY')

const serverUrls = {
  localnet: 'http://localhost:4096',
  mainnet: 'http://mainnet.asch.cn',
  testnet: 'http://testnet.asch.io',
}

function build(osVersion, netVersion) {
  const dir = `asch-${osVersion}-${pkg.version}-${netVersion}`
  const fullPath = path.join(__dirname, 'build', dir)
  const serverUrl = serverUrls[netVersion]

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

  let sedi = 'sed -i'
  if (osVersion === 'darwin') {
    // macOS using *bsd sed which doesn't support --version option
    // and user may install gnu-sed to replace it.
    if (shell.exec('sed --version', { silent: true }).code !== 0) { sedi = 'sed -i \'\'' }
  }

  shell.cp('-r', 'app.js', 'src', fullPath)
  shell.exec(`find ${fullPath}/src -type f -print0 | xargs -0 ${sedi} 's/localnet/${netVersion}/g'`)
  shell.sed('-i', 'testnet', netVersion, `${fullPath}/app.js`)
  shell.sed('-i', 'DEFAULT_BUILD_TIME', buildTime, `${fullPath}/app.js`)
  shell.exec(`cd ${fullPath} && npm install --production`)

  console.log('installing front-end, please be patient...')
  let frontendRepo = 'https://github.com/AschPlatform/asch-frontend-2.git'
  if (process.env.ASCH_FRONTEND_REPO != null) {
    frontendRepo = process.env.ASCH_FRONTEND_REPO
    console.log('Using Frontend Repo:', frontendRepo)
  } else {
    console.log('PS, you may use env ASCH_FRONTEND_REPO to use a faster repo ...')
  }
  // check dependencies: git, yarn
  if (shell.exec('which git').code !== 0) {
    console.log('please install git so that we may checkout source code of front-end')
    process.exit(1)
  }
  if (shell.exec('which yarn').code !== 0) {
    console.log('yarn not found, installing')
    shell.exec('npm install -g yarn')
  }
  // prepare frontend source code
  const magic = shell.exec('grep magic config.json | awk \'{print $2}\' | sed -e \'s/[",]//g\'', { silent: true }).stdout.trim()
  let branch = shell.exec('git branch | grep \\* | cut -d \' \' -f2', { silent: true }).stdout.trim()
  if (branch !== 'master' && branch !== 'develop') { branch = 'develop' }
  // It is quite possible that last build stop before cleanup frontend files
  if (shell.test('-e', `${fullPath}/tmp/asch-frontend-2`)) {
    shell.rm('-rf', `${fullPath}/tmp/asch-frontend-2`, { silent: true })
  }
  shell.exec(`cd ${fullPath}/tmp && pwd && git clone --single-branch -b ${branch} ${frontendRepo} \
     && cd asch-frontend-2 && yarn install && pwd \
     && ${sedi} 's/5f5b3cf5/${magic}/g' src/utils/constants.js && ${sedi} 's|http://mainnet.asch.cn|${serverUrl}|g' src/utils/constants.js \
     && node_modules/.bin/quasar build && cp -r dist/spa-mat/* ../../public/dist/ && rm -rf asch-frontend-2`, { silent: false })

  console.log('Done, build is ready to use. Creating tarball ...')
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
