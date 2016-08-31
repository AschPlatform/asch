# Asch

## System Dependency

- nodejs v6.3.1+
- npm 3.10.3 (not cnpm)
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