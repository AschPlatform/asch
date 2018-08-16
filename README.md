[![Build Status](https://travis-ci.org/AschPlatform/asch.svg?branch=master)](https://travis-ci.org/AschPlatform/asch)
[![Author](https://img.shields.io/badge/author-@AschPlatform-blue.svg?style=flat)](http://github.com/AschPlatform) 
[![License](https://img.shields.io/badge/license-MIT-yellow.svg?style=flat)](http://aschplatform.mit-license.org)
[![Platform](https://img.shields.io/badge/platform-Linux-green.svg?style=flat)](https://github.com/AschPlatform/asch)
- - -

# Asch

Asch system is a decentralized application platform, which is designed to lower the threshold for developers, such as using JavaScript as develop language, supporting relational database to save transaction data, and making DAPP development be similar with traditional Web application. It is sure that these characteristics are very attractive to developers and SMEs. The ecosystem of the whole platform cannot be improved until developers make a huge progress on productivity. Also, Asch platform is designed to be open for various fields, not limited to some particular parts such as finance, file storage, or copyright proof. It provides underlying and abstract API which can be combined freely to create different types of applications. In consensus mechanism, Asch inherits and enhances DPOS algorithm, by which the possibility of forks and risk of duplicate payments would be significantly reduced. Furthermore, Asch sidechain mode not only can mitigate the pressure of blockchain expansion, but also make DAPP more flexible and personal. Asch system, as a proactive, low-cost and full stack solution, will surely be a next generation incubator of decentralized applications.

More infomation please visit


+ [official website](https://www.asch.io)
+ online wallet: [wallet.asch.io](https://wallet.asch.io/), [wallet.asch.cn](https://wallet.asch.cn/)

## System Dependency

- nodejs v6.3+
- npm 3.10+ (not cnpm)
- node-gyp v3.6.2+ (suggested)
- sqlite v3.8.2+
- g++
- libssl

## Installation for ubuntu 14.04.x or higher.

```
# Install dependency package
sudo apt-get install curl sqlite3 ntp wget git libssl-dev openssl make gcc g++ autoconf automake python build-essential -y
# libsodium for ubuntu 14.04
sudo apt-get install libtool -y
# libsodium for ubuntu 16.04
sudo apt-get install libtool libtool-bin -y

# Install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
# This loads nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install node and npm for current user.
nvm install v8
# check node version and it should be v8.x.x
node --version

# git clone sourece code
git clone https://github.com/AschPlatform/asch && cd asch && chmod u+x aschd

# Install node packages
npm install
```

## Web Wallet

```
cd public/

npm install bower -g
npm install browserify -g
npm install gulp  -g

npm install
# angular chose "angular#~1.5.3 which resolved to 1.5.11 and is required by ASCH"
bower install

npm run build
gulp build-test #This make the front-end files in public dir.
```

## Installation on docker.

[Please install Docker firstly](https://store.docker.com/search?offering=community&type=edition)

```
# pull asch code docker image
docker pull aschplatform/asch:v1.3.0
# run docker and asch
docker run -i -t --name asch1.3.0 -p 4096:4096 aschplatform/asch:v1.3.0 /bin/bash
root@e149b6732a48:/# cd /data/asch && ./aschd start
Asch server started as daemon ...
```

## Run 

```
cd asch && node app.js
or
cd asch && ./aschd start
```
Then you can open ```http://localhost:4096``` in you browser.

## Usage

```
node app.js --help

  Usage: app [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -c, --config <path>        Config file path
    -p, --port <port>          Listening port number
    -a, --address <ip>         Listening host name or ip
    -b, --blockchain <path>    Blockchain db path
    -g, --genesisblock <path>  Genesisblock path
    -x, --peers [peers...]     Peers list
    -l, --log <level>          Log level
    -d, --daemon               Run asch node as daemon
    --reindex                  Reindex blockchain
    --base <dir>               Base directory
```

## Default localnet genesis account

This is the genesis account of localnet and one hundred million XAS in it.  
```js
{
  "address": "ABuH9VHV3cFi9UKzcHXGMPGnSC4QqT2cZ5",
  "publicKey": "116025d5664ce153b02c69349798ab66144edd2a395e822b13587780ac9c9c09",
  "secret": "stone elephant caught wrong spend traffic success fetch inside blush virtual element" // password  
}
```

## Releated projects

- [asch-docs](https://github.com/AschPlatform/asch/tree/master/docs)
- [asch-cli](https://github.com/AschPlatform/asch-cli)
- [asch-js](https://github.com/AschPlatform/asch-js)
- [asch-sandbox](https://github.com/AschPlatform/asch-sandbox-dist)
- [asch-explorer] website: [explorer.asch.io/](https://explorer.asch.io/)

## License

The MIT License (MIT)

Copyright (c) 2016-2018 Asch</br>
Copyright (c) 2015 Crypti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[asch-explorer]:https://explorer.asch.io/
