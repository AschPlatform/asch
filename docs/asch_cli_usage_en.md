#Asch-CLI User Guide
---
Index
=================

  * [Asch-CLI Instruction](#asch-cli-instruction)
    * [0 Asch-CLI Overview](#0-asch-cli-overview)
    * [1 Asch-CLI Installation](#1-asch-cli-installation)
    * [2 Asch-CLI Synopsis](#2-asch-cli-synopsis)
    * [3 Asch-CLI Option Description](#3-asch-cli-option-description)
      * [3.1 Print help information](#31-print-help-information)
      * [3.2 Print Asch-CLI version information](#32-print-asch-cli-version-information)
      * [3.3 Appoint the host name or IP address of target Asch Server](#33-appoint-the-host-name-or-ip-address-of-target-asch-server)
      * [3.4 Appoint the port number of target Asch server](#34-appoint-the-port-number-of-target-asch-server)
      * [3.5 Appoint the main chain](#35-appoint-the-main-chain)
    * [4 Asch-CLI supported commands](#4-asch-cli-supported-commands)
      * [4.1 Check the blockchain height](#41-check-the-blockchain-height)
      * [4.2 Check the blockchain status](#42-check-the-blockchain-status)
      * [4.3 Check account information by password](#43-check-account-information-by-password)
      * [4.4 Check account information by public key](#44-check-account-information-by-public-key)
      * [4.5 Check account balance by account address](##45-check-account-balance-by-account-address)
      * [4.6 Check account information by account address](#46-check-account-information-by-account-address)
      * [4.7 Check delegates voted by the account address](#47-check-delegates-voted-by-the-account-address)
      * [4.8 Check the whole number of delegates](#48-check-the-whole-number-of-delegates)
      * [4.9 Check delegates information and sort out](#49-check-delegates-information-and-sort-out)
      * [4.10 Check the voters of the delegate by his public key](#410-check-the-voters-of-the-delegate-by-his-public-key)
      * [4.11 Check detail information of delegate by public key](#411-check-detail-information-of-delegate-by-public-key)
      * [4.12 Check the detail information of delegate by the name](#412-check-the-detail-information-of-delegate-by-the-name)
      * [4.13 Check/analyse block information in whole network](#413-checkanalyze-block-information-in-whole-network)
      * [4.14 Check block information by block ID](#414-check-block-information-by-block-id)
      * [4.15 Check block information by block height](#415-check-block-information-by-block-height)
      * [4.16 Check the peer/node status](#416-check-the-peernode-status)
      * [4.17 Check unconfirmed transaction by public key](#417-check-unconfirmed-transaction-by-public-key)
      * [4.18 Check/analyse transaction information in the whole network](#418-checkanalyse-transaction-information-in-the-whole-network)
      * [4.19 Check transaction detail inforamtion by transaction ID](#419-check-transaction-detail-inforamtion-by-transaction-id)
      * [4.20 Transfer money](#420-transfer-money)
      * [4.21 Register delegate](#421-register-delegate)
      * [4.22 Vote for delegate](#422-vote-for-delegate)
      * [4.23 Cancel the vote for delegate](#423-cancel-the-vote-for-delegate)
      * [4.24 Set second password (secret)](#424-set-second-password-secret)
      * [4.25 Register Dapp (decentralized application)](#425-register-dapp-decentralized-application)
      * [4.26 Contract related command](#426-contract-related-command)
      * [4.27 Encrypt related command](#427-encrypt-related-command)
      * [4.28 Dapp related command](#428-dapp-related-command)
      * [4.29 Create genesis block file](#429-create-genesis-block-file)
      * [4.30 Check the status of all nodes/peers of the whole network](#430-check-the-status-of-all-nodespeers-of-the-whole-network)
      * [4.31 Check delegates' status in the whole network](#431-check-delegates-status-in-the-whole-network)
      * [4.32 Check the original place of all nodes/peers' IP address in the whole network](#432-check-the-original-place-of-all-nodespeers-ip-address-in-the-whole-network)

---
##0 Asch-CLI Overview
From [Asch Whitepaper](/asch_whitepaper_en.md)
> Asch-CLI is a command line interface provided by Asch system. Within the Asch-CLI, developers can rapidly establish a sidechain by making some simple configurations according to instructions and then create any kind of applications on this sidechain. The system also provides a series of APIs to help developers to create complicate smart contract applications. The functions of these APIs include consensus, strong random numbers, database, and cryptology and so on.

##1 Asch-CLI Installation
- Install nodejs package manager **npm**
`sudo apt-get install npm`

- Install Asch-CLI 
`npm install -g asch-cli`
NOTICE: if you install it in China, try parameter `--registry=http://registry.npm.taobao.org` to accelerate the installation.
 
##2 Asch-CLI Synopsis
`asch-cli [option] [command]`

##3 Asch-CLI Option Description
###3.1 Print help information
**Parameter:** 	-h, --help  
**Return:**     Help document of Asch-CLI commands or sub-commands  
**Usage:**  	
 - asch-cli -h #print help information of asch-cli itself 
 - asch-cli [commands] -h #print help information of Asch-CLI command

**Examples:**
```
root@asch:~# asch-cli -h #print asch-cli help information
  Usage: asch-cli [options] [command]
  Commands:

    getheight                              get block height
    getblockstatus                         get block status
    openaccount [secret]                   open your account and get the infomation by secret
    openaccountbypublickey [publickey]     open your account and get the infomation by publickey
    getbalance [address]                   get balance by address
    getaccount [address]                   get account by address
    getvoteddelegates [options] [address]  get delegates voted by address
    getdelegatescount                      get delegates count
    getdelegates [options]                 get delegates
    getvoters [publicKey]                  get voters of a delegate by public key
    getdelegatebypublickey [publicKey]     get delegate by public key
    getdelegatebyusername [username]       get delegate by username
    getblocks [options]                    get blocks
    getblockbyid [id]                      get block by id
    getblockbyheight [height]              get block by height
    getpeers [options]                     get peers
    getunconfirmedtransactions [options]   get unconfirmed transactions
    gettransactions [options]              get transactions
    gettransaction [id]                    get transactions
    sendmoney [options]                    send money to some address
    registerdelegate [options]             register delegate
    upvote [options]                       vote for delegates
    downvote [options]                     cancel vote for delegates
    setsecondsecret [options]              set second secret
    registerdapp [options]                 register a dapp
    contract [options]                     contract operations
    crypto [options]                       crypto operations
    dapps [options]                        manage your dapps
    creategenesis [options]                create genesis block
    peerstat                               analyze block height of all peers
    delegatestat                           analyze delegates status
    ipstat                                 analyze peer ip info

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -H, --host <host>  Specify the hostname or ip of the node, default: 127.0.0.1
    -P, --port <port>  Specify the port of the node, default: 4096
    -M, --main         Specify the mainnet, default: false

root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getvoteddelegates -h #print Asch-CLI command help information
  Usage: getvoteddelegates [options] [address]
  get delegates voted by address
  Options:

    -h, --help        output usage information
    -o, --offset <n>  
    -l, --limit <n>   
```

###3.2 Print Asch-CLI version information 
**Parameter:** 	-V, --version  
**Return:**     Output the version information  
**Usage:**  `asch-cli -V`	

**Example:**
 
```
root@asch:~# asch-cli -V
1.0.0
```

###3.3 Appoint the host name or IP address of target Asch Server
**Parameter:** -H, --host &lt;host&gt; [command] *(Default: 127.0.0.1)* 

**Return:** none

**Usage:** `asch-cli -H 45.32.248.33 [command]`

**Example:**
```
root@asch:~# asch-cli -H 45.32.248.33 getheight     #check block height of Asch server whose IP is 45.32.248.33
101236
```

###3.4 Appoint the port number of target Asch server
**Parameter:** -P, --port &lt;port&gt; [command] *(Default: 4096)*

**Return:** none

**Usage:** asch-cli -P 4096

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getheight  
102313
```

###3.5 Appoint the main chain
**Parameter:** -M, --main     *(Default: test chain)*

**Return:** none

**Usage:** asch-cli -M 

**Example:**

```
root@asch:~# asch-cli -M -H *.*.*.105 -P 8192 getheight  #check the block height of Asch main chain
9388
```

##4 Asch-CLI supported commands
###4.1 Check the blockchain height
**Command:** getheight

**Return:** blockchain height

**Usage:** asch-cli getheight

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getheight
105387
```

###4.2 Check the blockchain status
**Command:** getblockstatus

**Return:** a JSON format string including blockchain height, transaction fee, milestone, the reward of each delegate's block and the whole current volume

**Usage:** asch-cli getblockstatus

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getblockstatus
{
  "success": true,
  "height": 105392,
  "fee": 10000000,
  "milestone": 0,
  "reward": 350000000,
  "supply": 10036887200000000
}
```

###4.3 Check account information by password
**Command:**  openaccount [secret]

**Return:** A JSON string containing account information such as address, balance, public key, and second public key and so on.

**Usage:**asch-cli openaccount "password"

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 openaccount "fault still attack alley expand music basket purse later educate follow ride"
{
  "address": "16723473400748954103",
  "unconfirmedBalance": 20000000000,
  "balance": 20000000000,
  "publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",
  "unconfirmedSignature": false,
  "secondSignature": false,
  "secondPublicKey": "",
  "multisignatures": [],
  "u_multisignatures": []
}
```

###4.4 Check account information by public key
**Command:**openaccountbypublickey [publickey]

**Return:** A JSON string containing  account information such as address, balance, public key, and second public key and so on.

**Usage:** asch-cli openaccountbypublickey "public key"

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 openaccountbypublickey "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
{
  "address": "16723473400748954103",
  "unconfirmedBalance": 20000000000,
  "balance": 20000000000,
  "unconfirmedSignature": false,
  "secondSignature": false,
  "secondPublicKey": "",
  "multisignatures": [],
  "u_multisignatures": []
}
```

###4.5 Check account balance by account address
**Command:** getbalance [address]

**Return:** A integer number that will be the account balance when divided by 100000000

**Usage:** asch-cli getbalance [account address]

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getbalance 16723473400748954103
20000000000
```

###4.6 Check account information by account address 
**Command:** getaccount [address]

**Return:** A JSON string containing  account information such as address, balance, public key, and second public key and so on.

**Usage:** asch-cli getaccount [account address]

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getaccount 16723473400748954103
{
  "address": "16723473400748954103",
  "unconfirmedBalance": 20000000000,
  "balance": 20000000000,
  "publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",
  "unconfirmedSignature": false,
  "secondSignature": false,
  "secondPublicKey": "",
  "multisignatures": [],
  "u_multisignatures": []
}
```

###4.7 Check delegates voted by the account address
**Command:** getvoteddelegates [options] [address]

**Return:** A list containing the delegates voted by this account

**Usage:**asch-cli getvoteddelegates [account address] -o offset -l [a number indicates maximum delegates that can be printed]

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getvoteddelegates 15745540293890213312 -o 1 -l 2
{ success: true,
  delegates: 
   [ { username: 'wgl_002',
       address: '14636456069025293113',
       publicKey: 'ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7',
       vote: 8902736443247261,
       producedblocks: 1041,
       missedblocks: 6,
       rate: 1,
       approval: '88.70',
       productivity: '99.42' },
     { username: 'wgl_003',
       address: '9961157415582672274',
       publicKey: 'c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2',
       vote: 8902736443247261,
       producedblocks: 1043,
       missedblocks: 8,
       rate: 2,
       approval: '88.70',
       productivity: '99.23' }]
```

###4.8 Check the whole number of delegates
**Command:** getdelegatescount

**Return:** An integer number indicates the count of all delegates

**Usage:** asch-cli getdelegatescount

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getdelegatescount
232
```

###4.9 Check delegates information and sort out
**Command:**getdelegates [options]

**Return:** A list containing all delegates' information

**Usage:** asch-cli getdelegates -o [offset number] -l [a number indicates maximum delegates that can be printed] -s rate:asc 

**NOTICE:** rate:asc means ascending sort according to votes. Check other sort types with `asch-cli getdelegates -h`

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getdelegates -o 1 -l 1 -s rate:asc
[
  {
    "username": "wgl_003",
    "address": "9961157415582672274",
    "publicKey": "c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2",
    "vote": 9901544836887660,
    "producedblocks": 1044,
    "missedblocks": 8,
    "fees": 12150495022,
    "rewards": 161000000000,
    "rate": 2,
    "approval": 98.65,
    "productivity": 99.24,
    "forged": "173150495022"
  }
]
```

###4.10 Check the voters of the delegate by his public key
**Command:** getvoters [publicKey]

**Return:** A list containing all the voters

**Usage:**asch-cli getvoters "delegate's public key"

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getvoters "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7"
[
  {
    "address": "2918354313445278349",
    "publicKey": "4fde4c49f1297d5d3a24b1494204543c4281aff17917ff7ff8ff32da3b4b222f",
    "balance": 1215522376203,
    "weight": 0.012110398031994424
  },
  {
    "address": "1523444724068322527",
    "publicKey": "8a6a61c28dc47541aadf1eecec2175c8f768f2331eea3472b1593bf1aa4e1fb4",
    "balance": 2109297623765,
    "weight": 0.02101519008767971
  }]
```
  
###4.11 Check detail information of delegate by public key
**Command:** getdelegatebypublickey [publicKey]

**Return:** A JSON string containing delegate's detail information such as name, address, votes, produced blocks, and forging reward and so on.

**Usage:** asch-cli getdelegatebypublickey "delegate's public key"

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getdelegatebypublickey "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7"
{
  "username": "wgl_002",
  "address": "14636456069025293113",
  "publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",
  "vote": 9901546586887660,
  "producedblocks": 1042,
  "missedblocks": 6,
  "fees": 12383762523,
  "rewards": 161700000000,
  "rate": 1,
  "approval": 98.65,
  "productivity": 99.43,
  "forged": "174083762523"
}
```
###4.12 Check the detail information of delegate by the name
**Command:** getdelegatebyusername [username]

**Return:** A JSON string containing delegate's detail

**Usage:** asch-cli getdelegatebyusername "delegate's name"

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getdelegatebyusername "wgl_002"
{
  "username": "wgl_002",
  "address": "14636456069025293113",
  "publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",
  "vote": 9901546586887660,
  "producedblocks": 1042,
  "missedblocks": 6,
  "fees": 12383762523,
  "rewards": 161700000000,
  "rate": 1,
  "approval": 98.65,
  "productivity": 99.43,
  "forged": "174083762523"
}
```

###4.13 Check/analyse block information in whole network
**Command:** getblocks [options]

**Return:** A JSON string containing query result status and queried block information

**Usage:** asch-cli getblocks -o [offset number] -l [an integer that indicate maximum return data] -r [reward amount] -f [fee] -a [total amount] -g [public key that generates blocks] -s [sort rule]

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getblocks -o 1 -l 1 -r 350000000
{
  "success": true,
  "blocks": [
    {
      "id": "5533619110613125681",
      "version": 0,
      "timestamp": 3914630,
      "height": 60481,
      "previousBlock": "11174102253820291084",
      "numberOfTransactions": 0,
      "totalAmount": 0,
      "totalFee": 0,
      "reward": 350000000,
      "payloadLength": 0,
      "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "generatorPublicKey": "68b28341605a24f6684df81882df1b13f421ec1cbba7d9aaa68f6c079705b258",
      "generatorId": "10651956562526682705",
      "blockSignature": "77115fdaab3215039bcf2bf8b3a461b3b7cafca7adae07e271a1a953ca6531a9e93f985bbec8544d596a568595661f1da742e20797b827d5b20aa75e8d80cc0b",
      "confirmations": "45349",
      "totalForged": 350000000
    }
  ],
  "count": 45350
}
```
###4.14 Check block information by block ID
**Command:** getblockbyid [id]

**Return:** A JSON string containing block ID, block height, previous block ID, total transaction number, total amount, transaction fee, reward, hash, block generator public key and ID, block signature, quantity of confirmation and so on.
**Usage:**asch-cli getblockbyid [block ID]

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getblockbyid 1425942128040906871 #check the genesis block
{
  "id": "1425942128040906871",
  "version": 0,
  "timestamp": 0,
  "height": 1,
  "previousBlock": "",
  "numberOfTransactions": 103,
  "totalAmount": 10000000000000000,
  "totalFee": 0,
  "reward": 0,
  "payloadLength": 19417,
  "payloadHash": "dd5cd3186d32145b01f8fd0bd23e3b3d72414b59b162d2e664e759db8fe60d46",
  "generatorPublicKey": "2af8566f8555bafb25df5a50e2e22b91a8577ceabc05d47dbd921572d28330e8",
  "generatorId": "1170992220085500484",
  "blockSignature": "a8ed06bfbfd1b630b1628e97a5c7c9383337c4ce32825969fad830890e0af981312be635b775ff46eea4f739da043f668a70efd5a940429e39fe5063852f4a01",
  "confirmations": "105901",
  "totalForged": 0
}
```

###4.15 Check block information by block height
**Command:** getblockbyheight [height]

**Return:** A JSON string containing block ID, block height, previous block ID, total transaction number, total amount, transaction fee, reward, hash, block generator public key and ID, block signature, quantity of confirmation and so on.

**Usage:**asch-cli getblockbyheight [block height]

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getblockbyheight 1
{
  "id": "1425942128040906871",
  "version": 0,
  "timestamp": 0,
  "height": 1,
  "previousBlock": "",
  "numberOfTransactions": 103,
  "totalAmount": 10000000000000000,
  "totalFee": 0,
  "reward": 0,
  "payloadLength": 19417,
  "payloadHash": "dd5cd3186d32145b01f8fd0bd23e3b3d72414b59b162d2e664e759db8fe60d46",
  "generatorPublicKey": "2af8566f8555bafb25df5a50e2e22b91a8577ceabc05d47dbd921572d28330e8",
  "generatorId": "1170992220085500484",
  "blockSignature": "a8ed06bfbfd1b630b1628e97a5c7c9383337c4ce32825969fad830890e0af981312be635b775ff46eea4f739da043f668a70efd5a940429e39fe5063852f4a01",
  "confirmations": "105922",
  "totalForged": 0
}
```

###4.16 Check the peer/node status
**Command:** getpeers [options] 

**Return:** A list containing peer ip, port, operation system, and Asch version, and so on.

**Usage:**asch-cli getpeers -o [offset] -l [an integer that indicate maximum return data] -t [status value] -s [sort type] -v [version] -p [port number] --os [OS version] 

**NOTICE:** For further information, try `asch-cli getpeers -h`

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getpeers -o 1 -l 2 
[
  {
    "ip": "45.32.62.184",
    "port": 4096,
    "state": 2,
    "os": "linux3.13.0-87-generic",
    "version": "1.0.0"
  },
  {
    "ip": "45.32.22.78",
    "port": 4096,
    "state": 2,
    "os": "linux3.13.0-87-generic",
    "version": "1.0.0"
  }
]
```

###4.17 Check unconfirmed transaction by public key
**Command:** getunconfirmedtransactions [options]

**Return:** A list containing details of all transactions that are not confirmed yet

**Usage:** asch-cli getunconfirmedtransactions -p "sender's public key" -a [recipient's address]

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getunconfirmedtransactions -k "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3" 
[
  {
    "type": 0,
    "timestamp": 4385190,
    "senderPublicKey": "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3",
    "signature": "98d65df3109802c707eeed706e90a907f337bddab58cb4c1fbe6ec2179aa1c85ec2903cc0cf44bf0092926829aa5a0a6ec99458f65b6ebd11f0988772e58740e",
    "recipientId": "16723473400748954103",
    "senderId": "15745540293890213312",
    "amount": 10000000000,
    "fee": 10000000,
    "signatures": [],
    "id": "17192581936339156329",
    "height": 0,
    "asset": {}
  }
]
```

###4.18 Check/analyse transaction information in the whole network
**Command:** gettransactions [options]

**Return:** A list containing all selected transaction's detail information

**Usage:** asch-cli gettransactions -b [block ID] -o [offset] -l [an integer that indicate maximum return data] 

**NOTICE:** try `asch-cli gettransactions -h` to get the information for other parameters.

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 gettransactions -o 1 -l 2 #check the first two transactions' information in the whole network
[
  {
    "id": "10169086766604015960",
    "height": "1",
    "blockId": "1425942128040906871",
    "type": 2,
    "timestamp": 0,
    "senderPublicKey": "991e0dda00d2c33ce68dd99471de8ebea7b58711f22a2e55236b8864c6d24c84",
    "senderId": "3331250159865474723",
    "recipientId": "",
    "amount": 0,
    "fee": 0,
    "signature": "60bf38e7a3515aeaa2cac491f7737c94087f448a862099408b90c2cf96d3fe4f709e22e6471dd4e37aca111d8573beeb7b6cff4ef451633d9aaf74ab97ce8d02",
    "signSignature": "",
    "signatures": null,
    "confirmations": "105988",
    "asset": {}
  },
  {
    "id": "10375311635154792515",
    "height": "1",
    "blockId": "1425942128040906871",
    "type": 2,
    "timestamp": 0,
    "senderPublicKey": "1674ae566c633cde3e01db8f04a02ea087081a270de2dd53e0e0b97c029106fb",
    "senderId": "9948352853509008057",
    "recipientId": "",
    "amount": 0,
    "fee": 0,
    "signature": "f09c1693cc26c4028c642cb1711cf71c2dee090a50904d1590c74d865b2f5f3ba720ed792704f5379ec9c4a20b018c5e95f325ea179236777a28cddffe8c580d",
    "signSignature": "",
    "signatures": null,
    "confirmations": "105988",
    "asset": {}
  }
]
```

###4.19 Check transaction detail inforamtion by transaction ID
**Command:** gettransaction [id]

**Return:** A JSON string containing transaction ID, block height, block ID, time stamp, sender's public key, recipient's address, total amount, fee, signature, confirmation quantity, assets, and etc.

**Usage:**asch-cli gettransaction [transactionID]

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 gettransaction 17192581936339156329
{
  "id": "17192581936339156329",
  "height": "105951",
  "blockId": "15051364118100195665",
  "type": 0,
  "timestamp": 4385190,
  "senderPublicKey": "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3",
  "senderId": "15745540293890213312",
  "recipientId": "16723473400748954103",
  "amount": 10000000000,
  "fee": 10000000,
  "signature": "98d65df3109802c707eeed706e90a907f337bddab58cb4c1fbe6ec2179aa1c85ec2903cc0cf44bf0092926829aa5a0a6ec99458f65b6ebd11f0988772e58740e",
  "signSignature": "",
  "signatures": null,
  "confirmations": "17",
  "asset": {}
}
```

###4.20 Transfer money
**Command:** sendmoney [option]

**Return:** transaction result. true=success, otherwise error message

**Usage:** asch-cli sendmoney -e "[sender's password]" -t [recipient's address] -a [transfer amount] [-s "second password"]

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 sendmoney -e "motion group blossom coral upper warrior pattern fragile sister misery palm admin" -t 16723473400748954103 -a 100
true
```

###4.21 Register delegate
**Command:** registerdelegate [options]

**Return:** Registering result，ture=success, otherwise error message

**Usage:** asch-cli registerdelegate -e "[password]" -s "[second password]" -u "[delegate's name]"

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 registerdelegate -e "fault still attack alley expand music basket purse later educate follow ride" -u "delegate_register"
true
```

###4.22 Vote for delegate 
**Command:** upvote [options] 

**Return:** Voting result, ture=success, otherwise error message

**Usage:** asch-cli upvote -e "[password]" -s "[second password]" -p "delegate's public key"

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 upvote -e "fault still attack alley expand music basket purse later educate follow ride" -p "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
true
```

###4.23 Cancel the vote for delegate
**Command:**downvote [options]

**Return:** Cancelling vote result, ture=success, otherwise error message

**Usage:** asch-cli downvote -e "[password]" -s "[second password]" -p "delegate's public key"

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 downvote -e "fault still attack alley expand music basket purse later educate follow ride" -p "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
true
```

###4.24 Set second password (secret)
**Command:** setsecondsecret [options]

**Return:** Setting up result, ture=success, otherwise error message

**Usage:** asch-cli setsecondsecret -e "[password]" -s "[second password]"

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 setsecondsecret -e "fault still attack alley expand music basket purse later educate follow ride" -s "ce shi er ji mi ma"
true
```

###4.25 Register Dapp (decentralized application)
**Command:** registerdapp [options]

**Return:**

**Usage:** asch-cli registerdapp -e "[password]" -s "[second password]" -f [Dapp meta file]

**Example:**



###4.26 Contract related command
**Command:** contract [options]

**Return:** 

**Usage:** 
 - asch-cli contract -a 	# create a contract
 - asch-cli contract -d 	# delete a contract

**Example:**


###4.27 Encrypt related command
**Command:** crypto [option]

**Return:** A list

**Usage:**
- asch-cli -p # generate public key according to password
- asch-cli -g # create one or more new account

**Example:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 crypto -g
? Enter number of accounts to generate 1
[ { address: '16723473400748954103',
    secret: 'fault still attack alley expand music basket purse later educate follow ride',
    publicKey: 'bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9' } ]
Done
```

###4.28 Dapp related command
**Command:** dapps [options] 

**Return:** 

**Usage:** asch-cli dapps -a 

**Example:**

###4.29 Create genesis block file
**Command:** creategenesis [options]

**Return:** to create a genesis block file (genesisBlock.json) and log file (genGenesisBlock.log) in the current folder

**Usage:** asch-cli creategenesis

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 creategenesis 
root@asch:~# more genesisBlock.json
{
  "version": 0,
  "totalAmount": 10000000000000000,
  "totalFee": 0,
  "reward": 0,
  "payloadHash": "baebdb59d0c19a07c2440e22c0512b4efe9794565b352375195c9e7e8a3817b0",
  "timestamp": 0,
  "numberOfTransactions": 103,
...
}
```

###4.30 Check the status of all nodes/peers of the whole network
**Command:** peerstat

**Return:** The peer's information, containing peer IP address, port, version and block height and etc.

**Usage:**asch-cli peerstat

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 peerstat
45.32.248.33:4096 1.0.0 106036
45.32.62.184:4096 1.0.0 106036
45.32.19.241:4096 1.0.0 106036
```

###4.31 Check delegates' status in the whole network
**Command:** delegatestat

**Return:** Delegates' information, containing delegates' name, address, approval votes, productivity, the amount of generated blocks, block height, ID, and the time of last block generated and so on.

**Usage:** asch-cli delegatestat

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 delegatestat
name	address	rate	approval	productivity	produced	height	id	time
nayimoliuguang	3331976396377269399	93	88.36%	98.39%	1037	105618	12962348710289833740	2016/08/17 21:07:20(1 hour ago)
jack	3705405381126069457	86	88.36%	99.41%	506	105628	5876778147855073736	2016/08/17 21:09:00(1 hour ago)
node_3	12796761013870716784	81	88.36%	80.51%	814	105784	4575518649204137595	2016/08/17 21:38:10(40 mins ago)
wgl_003	9961157415582672274	2	98.65%	99.24%	1047	105852	11175724889329116017	2016/08/17 21:49:40(28 mins ago)
xihulongjing	12676662200687508271	59	88.36%	76.92%	150	105853	15273855606472618453	2016/08/17 21:49:50(28 mins ago)
liangpeili	4514546945474752928	50	88.37%	99.68%	627	105855	3771943180359756069	2016/08/17 21:50:10(28 mins ago)
asch_tea1	8812460086240160222	4	98.58%	98.79%	1059	105857	14968719538781965695	2016/08/17 21:50:30(27 mins ago)
intmaster	7321911740133937168	97	88.36%	100%	1032	105871	6757656887343300317	2016/08/17 21:52:50(25 mins ago)
mode_6	9248745407080572308	8	88.48%	100%	1060	105873	3777454410915098884	2016/08/17 21:53:10(25 mins ago)
```

###4.32 Check the original place of all nodes/peers' IP address in the whole network
**Command:** ipstat

**Return:** the original place of each peer's IP address

**Usage:** asch-cli ipstat

**Example:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 ipstat
美国	US
美国	US
美国	US
日本	JP
中国	CN
中国	CN
中国	CN
中国	CN
中国	CN
中国	CN
```
