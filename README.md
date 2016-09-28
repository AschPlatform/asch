# Asch

Asch system is a decentralized application platform, which is designed to lower the threshold for developers, such as using JavaScript as develop language, supporting relational database to save transaction data, and making DAPP development be similar with traditional Web application. It is sure that these characteristics are very attractive to developers and SMEs. The ecosystem of the whole platform cannot be improved until developers make a huge progress on productivity. Also, Asch platform is designed to be open for various fields, not limited to some particular parts such as finance, file storage, or copyright proof. It provides underlying and abstract API which can be combined freely to create different types of applications. In consensus mechanism, Asch inherits and enhances DPOS algorithm, by which the possibility of forks and risk of duplicate payments would be significantly reduced. Furthermore, Asch sidechain mode not only can mitigate the pressure of blockchain expansion, but also make DAPP more flexible and personal. Asch system, as a proactive, low-cost and full stack solution, will surely be a next generation incubator of decentralized applications.

More infomation please visit our [official website](https://www.asch.so)

## System Dependency

- nodejs v6.3.1+
- npm 3.10.3+ (not cnpm)
- sqlite v3.8.2+

## Install node_modules

```
npm install
```

## Run

```
node app.js
```

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

## Front end (wallet ui)

```
git clone https://github.com/sqfasd/asch-frontend
cd asch-frontend
npm install
bower install
npm run build
gulp build-test

# copy static front end files to public directory in asch source code
cp -r dist <asch dir>/public/
```

Then you can open ```localhost:4096``` in you browser

## Default localnet genesis account

```
{
  "keypair": {
    "publicKey": "8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd",
    "privateKey": "a64af28537545301f66579604628b55c7a7a102752bbd8f0b0d152f9754e78d58065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd"
  },
  "address": "14762548536863074694",
  "secret": "someone manual strong movie roof episode eight spatial brown soldier soup motor"
}
```

## Releated projects

- [asch_docs](https://github.com/sqfasd/asch_docs)
- [asch-frontend](https://github.com/sqfasd/asch-frontend)
- [asch-cli](https://github.com/sqfasd/asch-cli)
- [asch-js](https://github.com/sqfasd/asch-js)
- [asch-sandbox](https://github.com/sqfasd/asch-sandbox)
- [asch-dice-game-dapp](https://github.com/sqfasd/asch-dice-game-dapp)

## License

The MIT License (MIT)

Copyright (c) 2016 Asch
Copyright (c) 2015 Crypti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.