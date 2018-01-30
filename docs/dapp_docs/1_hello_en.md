# Dapp Development Tutorial 1: Asch Dapp Hello World

## 1 Basic Process

There are three types of networks in Asch, localnet, testnet, and mainnet. The later two, testnet and mainnet, are usually deployed online, which can be accessed by a public network. Meanwhile the first type, localnet, as its name is running on local machine, which is actually a private chain with only one node. Localnet is designed to help developing and testing locally.

And the development of Dapp involves all of these types of network simultaneously, which is:
- step 1: developing and testing locally on the localnet
- step 2: testing on the testnet
- step 3: deploying officially on mainnet

## 2 Setup Folder Structure

To setup the folder structure clone ```asch-cli``` and ```asch```.
```

# first install nvm because asch-cli and asch are use different node versions!
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
nvm install 7.0.0
nvm install 8.0.0


root  
└───asch-cli
│       config.json
│       contract-example.js
│       .gitignore
│       index.js
|       ...
|       ...
└───asch
        app.js
        aschd
        config.json
        ...
        ...

# clone asch-cli
git clone https://github.com/aschplatform/asch-cli.git asch-cli && cd asch-cli && npm install && chmod u+x bin/asch-cli && bin/asch-cli -help && cd ..

# clone asch
git clone https://github.com/aschplatform/asch.git asch && cd asch && npm install && nvm use 7.0.0 && cd ..
```
NOTE: DO NOT use ```cnpm``` from TAOBAO since there are some **bugs** in it.






## 3 Start localnet

Run your own local asch node.

```
# change directory
cd asch

# start the localnet (default on localhost:4096)
node app.js
```


## 4 Start The Frontend Application (optional)

To access the localnet via a graphical user interface (GUI) start the frontend application. Be sure to have the localnet up and running.

This step must be run from another console. The first console is already busy with running the localnet.

```
# change directory
cd asch/public
```

Install the dependencies for the frontend application
```
npm install
```

Build the frontend application for the localnet.
```
gulp build-local
```

Now you can access the frontend application on the address ```localhost:4096```. 
*NOTE:* You don't need to start a http-server. Asch is already providing one for you.


## 4 Prepare Account For Dapp Registration

First create a new local asch-account.

```
# execute (in root folder)
asch-cli/bin/asch-cli -H 127.0.0.1 -P 4096 crypto --generate
# ?  Enter number of accounts to generate:
1
```
**Our New Account**
```
    address: AHMCKebuL2nRYDgszf9J2KjVZzAw95WUyB
    secret: sentence weasel match weather apple onion release keen lens deal fruit matrix
    publicKey: a7cfd49d25ce247568d39b17fca221d9b2ff8402a9f6eb6346d2291a5c81374c
```

**Genesis Account**
```
    address: 14762548536863074694
    secret: someone manual strong movie roof episode eight spatial brown soldier soup motor
    publicKey: 8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd
```


**Our new Acccount** will be our account for this tutorial.

We need **100 XAS** to register a dapp. Our new account has **0 XAS**. The **genesis** account has 100000000 XAS on it. Lets send some money to **our** account.


```
# send money to our account 
asch-cli/bin/asch-cli -H 127.0.0.1 -P 4096 sendmoney --secret "someone manual strong movie roof episode eight spatial brown soldier soup motor" --to "AHMCKebuL2nRYDgszf9J2KjVZzAw95WUyB" --amount 100000000000

# check your balance
asch-cli/bin/asch-cli -H 127.0.0.1 -P 4096 openaccount "sentence weasel match weather apple onion release keen lens deal fruit matrix"
```


## 5 Create A Dapp Metadata File

First we have to create 5 delegate accounts:

```
# execute in root (you don't have to point to the localhost, this command is execute only in asch-cli)
asch-cli/bin/asch-cli crypto --generate
? Enter number of accounts to generate
5

[ 
  { 
    address: 'AN1yKK47P3MtD5ZgHYoncGQ1gCn4p2vGAC',
    secret: 'flame bottom dragon rely endorse garage supply urge turtle team demand put',
    publicKey: 'db18d5799944030f76b6ce0879b1ca4b0c2c1cee51f53ce9b43f78259950c2fd' 
  },
  { 
    address: 'AGeeCmSVLDNbtMqqpJchQZakchwzpuje1P',
    secret: 'thrive veteran child enforce puzzle buzz valley crew genuine basket start top',
    publicKey: '590e28d2964b0aa4d7c7b98faee4676d467606c6761f7f41f99c52bb4813b5e4' 
  },
  { 
    address: 'A7NWaYUkpa543hdTsfw57AoZAgCBr2NFY6',
    secret: 'black tool gift useless bring nothing huge vendor asset mix chimney weird',
    publicKey: 'bfe511158d674c3a1e21111223a49770bee93611d998e88a5d2ea3145de2b68b'
  },
  { 
    address: 'ABU1G2pQFMGa7c1GiAPYCQuUhiPHdvCSB2',
    secret: 'ribbon crumble loud chief turn maid neglect move day churn share fabric',
    publicKey: '7bbf62931cf3c596591a580212631aff51d6bc0577c54769953caadb23f6ab00' 
  },
  { 
    address: 'AG1A3ojeLAMZySaZWTkg49jcoVCV7FCKXF',
    secret: 'scan prevent agent close human pair aerobic sad forest wave toe dust',
    publicKey: '452df9213aedb3b9fed6db3e2ea9f49d3db226e2dac01828bc3dcd73b7a953b4' 
  } 
]
```


After that enter your Asch source code folder and make sure the localnet is running.

```
# this must be executed in a new console
mkdir asch/dapps
cd asch/dapps
nvm use 8.0.0

# execute inside the asch/dapps folder following command:
../../asch-cli/bin/asch-cli -H 127.0.0.1 -P 4096 dapps -a

# enter dapp name?
hello

# enter dapp description?
[empty]

# enter dapp tags?
[empty]

# choose dapp category
1

# enter dapp link
https://github.com/AschPlatform/asch-dapp-helloworld/archive/master.zip

# enter dapp icon url
http://o7dyh3w0x.bkt.clouddn.com/hello.png

# enter public keys of dapp delegates  - hex array, use ',' for separator (at least 5 delegates, max 101):
db18d5799944030f76b6ce0879b1ca4b0c2c1cee51f53ce9b43f78259950c2fd,590e28d2964b0aa4d7c7b98faee4676d467606c6761f7f41f99c52bb4813b5e4,bfe511158d674c3a1e21111223a49770bee93611d998e88a5d2ea3145de2b68b,7bbf62931cf3c596591a580212631aff51d6bc0577c54769953caadb23f6ab00,452df9213aedb3b9fed6db3e2ea9f49d3db226e2dac01828bc3dcd73b7a953b4

# how many delegates are needed to unlock asset of a dapp?
3
```

This step created the `asch/dapps/dapp.json` file.
```
{
  "name": "hello",
  "link": "https://github.com/sqfasd/asch-hello-dapp/archive/master.zip",
  "category": 1,
  "description": "",
  "tags": "",
  "icon": "http://o7dyh3w0x.bkt.clouddn.com/hello.png",
  "delegates": [
      "db18d5799944030f76b6ce0879b1ca4b0c2c1cee51f53ce9b43f78259950c2fd",
      "590e28d2964b0aa4d7c7b98faee4676d467606c6761f7f41f99c52bb4813b5e4",
      "bfe511158d674c3a1e21111223a49770bee93611d998e88a5d2ea3145de2b68b",
      "7bbf62931cf3c596591a580212631aff51d6bc0577c54769953caadb23f6ab00",
      "452df9213aedb3b9fed6db3e2ea9f49d3db226e2dac01828bc3dcd73b7a953b4"
  ],
  "unlockDelegates": 3,
  "type": 0
}
```


## 6 Register The Dapp On The Localnet

Until now we only have a empty file (`asch/dapps/dapp.json`). Now we want to register this dapp metadata file on the localnet. We register the dapp with **our** newly generated address.

```
# execute (in asch/dapps)
nvm use 8.0.0
../../asch-cli/bin/asch-cli -H 127.0.0.1 -P 4096 registerdapp --metafile dapp.json --secret "sentence weasel match weather apple onion release keen lens deal fruit matrix"
```

**Result**
```
# This returns the new Dapp-ID
<dapp Id>
```

Now navigate in your browser to `localhost:4096`. Login with **our** new created account. Under dapps you should see the register dapps.


## 7 Install the dapp on the localnet

Finally it is time to install the dapp on the localnet.

```
# execute (in asch/)
nvm use 8.0.0
../asch-cli/bin/asch-cli -H 127.0.0.1 -P 4096 dapps --install

# ? Enter dapp id
# <dapp id>    (input your dapp Id)

# ? Host and port (localhost:4096)
# [Enter]

# ? What is your dapp master password
# <dapp master password> 
```
The dapp masterpassword is located in `asch/config.json`.
```
 "dapp": {
    "masterpassword": "ytfACAMegjrK",
    "params": {
      "": [
      ]
    }
```

Then write the passwords of the 5 delegates into the dapp configuration file `asch/dapps/<dapp Id>/config.json`.

```
# config.json
{
  "secrets": [
    "flame bottom dragon rely endorse garage supply urge turtle team demand put",
    "thrive veteran child enforce puzzle buzz valley crew genuine basket start top",
    "black tool gift useless bring nothing huge vendor asset mix chimney weird",
    "ribbon crumble loud chief turn maid neglect move day churn share fabric",
    "scan prevent agent close human pair aerobic sad forest wave toe dust"
  ]
}
```

**After the installation restart the node**
```
# stop the localnet with Ctrl + C

# restart the localnet
node app.js
```

## 8 Access The Dapp In Your Browser

Now you can access the dapp like a website `localhost:4096/dapps/<DappID>/` in your browser.


## 9 Set Dapp Genesis Password

Under `asch/config.json` set the genesis password for your dapp. Input your `<dapp Id>` and the secret of your 

**before**
```
  "dapp": {
    "masterpassword": "ytfACAMegjrK",
    "params": {}
  }
```

**after**
```
  "dapp": {
    "masterpassword": "ytfACAMegjrK",
    "params": {
      "<your dapp Id>": [
        "sentence weasel match weather apple onion release keen lens deal fruit matrix"
      ]
    }
  }
```
In the future when the DApp is published in testnet or mainnet, it still needs a machine that configures the primary password. NOTE: Only one machine is required.


## 10 The folder structure

Now we can see that there is a new folder added under `asch/dapps`, named as the DApp ID just created.

```
ls -la dapps/<dapp id>

dapps
└───<dapp id>
        blockchain.json         # the database description of DApp
        config.json             # the configuration file of DApp, which mainly contains the list of seed nodes. Developers can also add other configurations in it.
        dapp.json               # the meta information of DApp, including name, description, source code package, and etc. This file can also be used when registering the app to other networks.
        genesis.json            # indicate the genesis blcok. This file is generated by CLI automatically, but also can be written by yourself, by which the assets of genesis account can be distributed with more flexibility.
        index.js                # this file contains the entry of DApp
        init.js                 # this file contains the initial code of each module.
        LICENSE                 # this file describes the permit license of source code.
        modules                 # main code
        modules.full.json       # this file indicates all the modules need to be loaded. You can add other necessary modules here.
        modules.genesis.json    # (the simplified version of modules.full.json, currently not need)
        node_modules            #
        package.json            #
        public                  # this folders contains all front-end files
        routes.json             # this file contains the configuration of http route. If you want to add new interface, you need to revise this file.
```
Don't worry about the complexity of the file structure. For now a first look is enough. 

All the essential files for developers can be found in ```modules/contracts/```

There are 4 build-in contract types in this folder:

```
ls -1 dapps/<dapp id>/modules/contracts/


dapps
└───<dapp id>
    └───modules
        └───contracts
                delegates.js            # registering delegate contract
                insidetransfer.js       # in-chain transfer contract
                outsidetransfer.js      # XAS deposit contract
                withdrawaltransfer.js   # XAS withdraw contract
```

Developers need to create a new contact to run business logic. That's all.



## 11 Dapp Deposit

In this project, we are able to conduct multiple tasks such as deposit, in-chain transfer, and withdraw.

Currently deposit can only be executed via command line (this feature will be built into the main wallet in the future).

```
asch-cli dapps --deposit

? Enter secret *******************************************************************************
? Enter amount 100
? DApp Id 6299140990391157236
? Enter secondary secret (if defined)
? Host and port localhost:4096
null { success: true, transactionId: '10589988261732949004' }
10589988261732949004
```

In the web wallet (`localhost:4096`) we can see (after approximately 30 seconds) that the balance was updated.
