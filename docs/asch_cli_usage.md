# ASCH-CLI说明

---
目录
=================

  * [ASCH-CLI说明](#asch-cli说明)
    * [0 asch-cli简介](#0-asch-cli简介)
    * [1 asch-cli的安装](#1-asch-cli的安装)
    * [2 asch-cli使用说明](#2-asch-cli使用说明)
    * [3 asch-cli支持的选项](#3-asch-cli支持的选项)
      * [3.1 打印帮助文档](#31-打印帮助文档)
      * [3.2 打印asch-cli版本号](#32-打印asch-cli版本号)
      * [3.3 指定要连接的asch服务器主机名或者ip](#33-指定要连接的asch服务器主机名或者ip)
      * [3.4 指定要连接的asch服务器的端口](#34-指定要连接的asch服务器的端口)
      * [3.5 指定主链](#35-指定主链)
    * [4 asch-cli支持的命令](#4-asch-cli支持的命令)
      * [4.1 查看区块链高度](#41-查看区块链高度)
      * [4.2 查看区块链状态](#42-查看区块链状态)
      * [4.3  根据密码查看账户信息](#43--根据密码查看账户信息)
      * [4.4 根据公钥查看账户信息](#44-根据公钥查看账户信息)
      * [4.5 根据地址查看账户余额](#45-根据地址查看账户余额)
      * [4.6 根据地址查看账户信息](#46-根据地址查看账户信息)
      * [4.7 查看账户地址投了哪些受托人](#47-查看账户地址投了哪些受托人)
      * [4.8 查看全部受托人个数](#48-查看全部受托人个数)
      * [4.9 查看受托人详情并排序](#49-查看受托人详情并排序)
      * [4.10 根据受托人公钥查看都是谁为他投了票](#410-根据受托人公钥查看都是谁为他投了票)
      * [4.11 根据公钥查看受托人详情](#411-根据公钥查看受托人详情)
      * [4.12 根据名字查看受托人详情](#412-根据名字查看受托人详情)
      * [4.13 查看(分析)全网区块信息](#413-查看分析全网区块信息)
      * [4.14 根据区块id查看区块详情](#414-根据区块id查看区块详情)
      * [4.15 根据区块高度查看区块详情](#415-根据区块高度查看区块详情)
      * [4.16 查看节点信息](#416-查看节点信息)
      * [4.17 根据公钥查看未确认的交易](#417-根据公钥查看未确认的交易)
      * [4.18 查看（分析）全网交易信息](#418-查看分析全网交易信息)
      * [4.19 根据交易id查看交易详情](#419-根据交易id查看交易详情)
      * [4.20 转账](#420-转账)
      * [4.21 注册受托人](#421-注册受托人)
      * [4.22 给受托人投票](#422-给受托人投票)
      * [4.23 给受托人取消投票](#423-给受托人取消投票)
      * [4.24 设置二级密码](#424-设置二级密码)
      * [4.25 注册dapp](#425-注册dapp)
      * [4.26  合约相关](#426--合约相关)
      * [4.27 加密相关](#427-加密相关)
      * [4.28  dapp相关](#428--dapp相关)
      * [4.29 创建创世块文件](#429-创建创世块文件)
      * [4.30 全网节点状态](#430-全网节点状态)
      * [4.31 全网受托人状态](#431-全网受托人状态)
      * [4.32 查看全网节点的ip归属](#432-查看全网节点的ip归属)

---

##0 asch-cli简介
以下内容引用自 [Asch白皮书](/asch_whitepaper.md)

>asch-cli是Asch系统提供了一个命令行工具，只需要根据提示输入一些配置项，就可以快速的建立一个侧链，并可在侧链上开发任意类型的应用。其次，系统还提供了一系列的 api 帮助用户构建复杂的智能合约应用，这些 api 涵盖共识、强随机数、数据库、密码学等方面。


##1 asch-cli的安装
sudo apt-get install npm    #安装js软件包管理器npm

npm install -g asch-cli     #国内服务器可以考虑加上 “--registry=http://registry.npm.taobao.org” 参数加快安装速度

##2 asch-cli使用说明
asch-cli [选项] [命令]

##3 asch-cli支持的选项
###3.1 打印帮助文档 
参数值： -h, --help

返回值： asch-cli命令或者子命令的帮助文档

使用方法：asch-cli -h(查看asch-cli帮助文档);asch-cli 子命令 -h(查看子命令的帮助文档)

示例:
 
```{r, engine='bash', count_lines}
root@asch:~# asch-cli -h #查看asch-cli帮助信息
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

root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getvoteddelegates -h #查看子命令帮助
  Usage: getvoteddelegates [options] [address]
  get delegates voted by address
  Options:

    -h, --help        output usage information
    -o, --offset <n>  
    -l, --limit <n>   
```

###3.2 打印asch-cli版本号 
参数值： -V, --version

返回值： asch-cli命令的版本号

使用方法：asch-cli -V

示例:
 
```{r, engine='bash', count_lines}
root@asch:~# asch-cli -V
1.0.0
```

###3.3 指定要连接的asch服务器主机名或者ip
参数值： -H, --host <host>   默认：127.0.0.1 

返回值： 无

使用方法：asch-cli -H 45.32.248.33 [子命令]

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 45.32.248.33 getheight     #查看45.32.248.33服务器最新的区块高度
101236
```

###3.4 指定要连接的asch服务器的端口
参数值： -P, --port <port>   默认：4096

返回值： 无

使用方法：asch-cli -P 4096 [子命令]

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getheight  
102313
```

###3.5 指定主链
参数值： -M, --main     默认：测试链

返回值： 无

使用方法：asch-cli -H 45.32.248.33 -P 8192 -M [子命令]

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -M -H *.*.*.105 -P 8192 getheight  #查看asch主链区块高度
9388
```


##4 asch-cli支持的命令
###4.1 查看区块链高度
命令值： getheight

返回值： 区块链高度

使用方法：asch-cli getheight

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getheight
105387
```

###4.2 查看区块链状态
命令值： getblockstatus

返回值： json字符串，包含区块链高度、交易费、里程碑、受托人每块奖励、当前总量

使用方法：asch-cli getblockstatus

示例:

```{r, engine='bash', count_lines}
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

###4.3  根据密码查看账户信息
命令值： openaccount [secret]

返回值： json字符串，含地址、余额、公钥、二级公钥等信息

使用方法：asch-cli openaccount "密码"

示例:

```{r, engine='bash', count_lines}
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

###4.4 根据公钥查看账户信息
命令值： openaccountbypublickey [publickey]

返回值： json字符串，含地址、余额、二级公钥等信息

使用方法：asch-cli openaccountbypublickey "公钥"

示例:

```{r, engine='bash', count_lines}
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

###4.5 根据地址查看账户余额
命令值： getbalance [address]

返回值： 整型数字，除以100000000后为大家平时所说的余额

使用方法：asch-cli getbalance 账户地址

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getbalance 16723473400748954103
20000000000
```

###4.6 根据地址查看账户信息
命令值： getaccount [address]

返回值： json字符串，含地址、余额、公钥、二级公钥等信息

使用方法：asch-cli getaccount 账户地址

示例:

```{r, engine='bash', count_lines}
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

###4.7 查看账户地址投了哪些受托人
命令值： getvoteddelegates [options] [address]

返回值： 列表

使用方法：asch-cli getvoteddelegates 账户地址 -o 偏移量数字 -l 限制打印的受托人个数数字

示例:

```{r, engine='bash', count_lines}
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

###4.8 查看全部受托人个数
命令值： getdelegatescount

返回值： 整型数字

使用方法：asch-cli getdelegatescount

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getdelegatescount
232
```

###4.9 查看受托人详情并排序
命令值： getdelegates [options]

返回值： 列表

使用方法：asch-cli getdelegates -o 偏移量数字 -l 限制打印的受托人个数数字 -s rate:asc #rate:asc代表根据投票数正向排序，其它排序规则请参考asch-cli getdelegates -h帮助信息

示例:

```{r, engine='bash', count_lines}
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

###4.10 根据受托人公钥查看都是谁为他投了票
命令值： getvoters [publicKey]

返回值： 列表

使用方法：asch-cli getvoters "受托人公钥"

示例:

```{r, engine='bash', count_lines}
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
  
###4.11 根据公钥查看受托人详情
命令值： getdelegatebypublickey [publicKey]

返回值： json字符串，包含受托人名字、地址、投票数、生成的block数、锻造收益等

使用方法：asch-cli getdelegatebypublickey "受托人公钥"

示例:

```{r, engine='bash', count_lines}
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
###4.12 根据名字查看受托人详情
命令值： getdelegatebyusername [username]

返回值： json字符串，受托人详情

使用方法：asch-cli getdelegatebyusername "受托人名字"

示例:

```{r, engine='bash', count_lines}
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

###4.13 查看(分析)全网区块信息
命令值： getblocks [options]

返回值： json字符串，包含查询状态、符合查询要求的区块信息

使用方法：asch-cli getblocks -o 偏移量数字 -l 限制的个数数字 -r 奖励 -f 费用 -a 总量 -g 生成区块的公钥 -s 排序规则

示例:

```{r, engine='bash', count_lines}
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
###4.14 根据区块id查看区块详情
命令值： getblockbyid [id]

返回值： json字符串，包含区块id、区块高度、前一个blockid、交易数、总额、费用、奖励、哈希值、区块生成者公钥、id、区块签名、确认数等信息

使用方法：asch-cli getblockbyid 区块id

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getblockbyid 1425942128040906871 #查看创世块
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

###4.15 根据区块高度查看区块详情
命令值： getblockbyheight [height]

返回值： json字符串，包含区块id、区块高度、前一个blockid、交易数、总额、费用、奖励、哈希值、区块生成者公钥、id、区块签名、确认数等信息

使用方法：asch-cli getblockbyheight 区块高度

示例:

```{r, engine='bash', count_lines}
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

###4.16 查看节点信息
命令值： getpeers [options] 

返回值： 列表，包含节点ip、端口、os、asch版本等信息

使用方法：asch-cli getpeers -o 偏移量数字 -l限制个数数字 -t 状态值 -s 排序 -v 版本 -p 端口 --os os版本 #详情请参考asch-cli getpeers -h帮助信息

示例:

```{r, engine='bash', count_lines}
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

###4.17 根据公钥查看未确认的交易
命令值： getunconfirmedtransactions [options]

返回值： 列表，包含所有未确认的交易详情

使用方法：asch-cli getunconfirmedtransactions -k "发送者公钥" -a 接收者地址

示例:

```{r, engine='bash', count_lines}
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

###4.18 查看（分析）全网交易信息
命令值： gettransactions [options]

返回值： 列表，包含所有符合查询条件的交易详情

使用方法：asch-cli gettransactions -b 区块id -o 偏移量数字 -l 限制个数数字 #其他参数请参考sch-cli gettransactions -h查看帮助信息

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 gettransactions -o 1 -l 2 #查看全网前2个交易
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

###4.19 根据交易id查看交易详情
命令值： gettransaction [id]

返回值： json字符串，包含交易id、区块高度、区块id、时间戳、发送者公钥、接收者地址、金额、费用、签名、确认数、资产等信息

使用方法：asch-cli gettransaction 交易id

示例:

```{r, engine='bash', count_lines}
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

###4.20 转账
命令值： sendmoney [选项]

返回值： 结果状态值，true或者报错信息

使用方法：asch-cli -e "发送者密码" -t 接收者地址 -a 转账金额 [-s "二级密码"]

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 sendmoney -e "motion group blossom coral upper warrior pattern fragile sister misery palm admin" -t 16723473400748954103 -a 100
true
```

###4.21 注册受托人
命令值： registerdelegate [options]

返回值： 结果状态值，true或者报错信息

使用方法：asch-cli registerdelegate -e "密码" -s "二级密码" -u "受托人名字"

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 registerdelegate -e "fault still attack alley expand music basket purse later educate follow ride" -u "delegate_register"
true
```

###4.22 给受托人投票 
命令值： upvote [options] 

返回值： 结果状态值，true或者报错信息

使用方法：asch-cli upvote -e "密码" -s "二级密码" -p "受托人公钥"

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 upvote -e "fault still attack alley expand music basket purse later educate follow ride" -p "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
true
```

###4.23 给受托人取消投票
命令值： downvote [options]

返回值： 结果状态值，true或者报错信息

使用方法：asch-cli downvote -e "密码" -s "二级密码" -p "受托人公钥"

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 downvote -e "fault still attack alley expand music basket purse later educate follow ride" -p "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
true
```

###4.24 设置二级密码
命令值： setsecondsecret [options]

返回值： 结果状态值，true或者报错信息

使用方法：asch-cli setsecondsecret -e "密码" -s "二级密码"

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 setsecondsecret -e "fault still attack alley expand music basket purse later educate follow ride" -s "ce shi er ji mi ma"
true
```

###4.25 注册dapp
命令值： registerdapp [options]

返回值： 

使用方法：asch-cli registerdapp -e "密码" -s "二级密码" -f dapp元信息文件

示例:



###4.26  合约相关
命令值： contract [options]

返回值： 

使用方法：asch-cli contract -a(创建合约);asch-cli contract -d(删除合约)

示例:




###4.27 加密相关
命令值： crypto [操作选项]

返回值： 列表

使用方法：asch-cli -p(根据密码生成公钥)；asch-cli -g（生成新账户）

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 crypto -g
? Enter number of accounts to generate 1
[ { address: '16723473400748954103',
    secret: 'fault still attack alley expand music basket purse later educate follow ride',
    publicKey: 'bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9' } ]
Done
```

###4.28  dapp相关
命令值： dapps [options] 

返回值： 

使用方法：asch-cli dapps -a 
示例

###4.29 创建创世块文件
命令值： creategenesis [options]

返回值： 在当前目录生成genesisBlock.json创世块文件、genGenesisBlock.log创世块日志

使用方法：asch-cli creategenesis

示例:

```{r, engine='bash', count_lines}
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

###4.30 全网节点状态
命令值： peerstat

返回值： 节点信息，包含节点ip、端口、版本、区块高度等信息

使用方法：asch-cli peerstat

示例:

```{r, engine='bash', count_lines}
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 peerstat
45.32.248.33:4096 1.0.0 106036
45.32.62.184:4096 1.0.0 106036
45.32.19.241:4096 1.0.0 106036
```

###4.31 全网受托人状态
命令值： delegatestat

返回值： 受托人信息，包含全网受托人的名字、地址、投票、生产率、区块生成个数、区块高度、id、上一次生成区块的时间等信息

使用方法：asch-cli 

示例:

```{r, engine='bash', count_lines}
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

###4.32 查看全网节点的ip归属
命令值： ipstat

返回值： 节点ip归属地

使用方法：asch-cli ipstat

示例:

```{r, engine='bash', count_lines}
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

