# Dapp开发教程一 Asch Dapp Hello World

## 1 基本流程

Asch有三种网络类型，分别是localnet，testnet，mainnet，后两种是发布到线上的，可通过公网访问。下面对这三种网络做一个介绍：    

- localnet：运行在本地的、只有一个节点（101个受托人都配置在本地的config.json文件中）的私链，主要是为了方便本地测试和开发。locanet就是私有链。    
- testnet：Asch链公网测试环境，由多个服务器组成，具备完整的p2p广播、分布式存储等，在功能上跟mainnet一致，和mainnet的区别在于magic不同（可以理解为用于区分不同链的id，目前Asch testnet的magic为594fe0f3，mainnet的magic为：5f5b3cf5）    
- mainnet：Asch主网正式环境，这上面的XAS Token会在各大交易平台进行交易。    



Dapp的开发同样要涉及到这三种网络，即

- 第一步，在localnet开发、本地调试
- 第二步，在testnet测试
- 第三步，正式发布到mainnet，其他节点可以安装

## 2 启动localnet

每个开发者都可以在本地启动自己的localnet，需要先下载[asch源码](https://github.com/AschPlatform/asch)。

```
> git clone https://github.com/AschPlatform/asch.git
```

下载后就可以参照该项目的[README](https://github.com/AschPlatform/asch/blob/master/README.md)进行后面的安装、运行操作。

## 3 安装asch-cli
建议用nvm安装node和npm
```
# Install nvm
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
# This loads nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install node and npm for current user.
nvm install node 8
# check node version and it should be v8.x.x
node --version
```

```
> npm install -g asch-cli
```

注意这一步不要用淘宝的```cnpm```， **有bug**

## 4 在本地创建一个应用

首先要进入你的asch源码目录，并确保localnet启动（访问http://127.0.0.1:4096,如能打开钱包页面说明启动成功）

```
> cd <asch source code dir>
> npm install
> node app.js
```

### 4.1 创建你的受托人账户

每个dapp都有独立的受托人，这些受托人也是默认的记账人，他们负责区块的生产，跨链资产的中转，与此同时可以获得交易手续费。     
注册dapp的时候，我们只需要收集受托人的公钥就行，为了权力分散，最好每个秘钥分别由一个人保管。     
这里为了演示，我们一次性创建5个账户，一个dapp最多有101个受托人，最少是5个。     

```
// 注意这里的密码都是演示用途，且不可用于正式的dapp中
> asch-cli crypto -g

#　接下来输入 5 即可生成5个账户
[ { address: 'AijfU9bAE6Jpt5ve7zG3LoriDamH67eLb', // 地址
    secret: 'easy snap cable harvest plate tone planet yellow spot employ humble what', // 主密码，也叫一级密码，可以生成公钥和地址，实质为私钥的助记词，必须记录下来
    publicKey: 'a437a1d4bedf738e8620920ef29542644e3366c635b16fc9faa6f5db744bcd5c' },// 公钥，用于4.2章节配置受托人公钥
  { address: 'ABGGUL5D2SoBaQTqDMAb3u9RdUjYBcmRxx',
    secret: 'adjust edge exist hurry joke carbon spice envelope battle shuffle hawk thought',
    publicKey: '522cdc822d3bec74aa5c4e972ed6cba84850f9c4d521e43fe08675e9e4759bb9' },
  { address: 'AMg37s4avDUojJd6d3df7HPA3vqtRRwved',
    secret: 'survey spoil submit select warm chapter crazy link actual lonely pig grain',
    publicKey: '6ee3ae36166f69e8b9408d277486c9870f40c1b7c16016328737d6445409b99f' },
  { address: 'AL5p8BHzhCU3e5pkjMYbcjUSz771MrQcQr',
    secret: 'march struggle gap piece entry route kind pistol chunk spell honey summer',
    publicKey: 'ad558e44b347a54981295fcb5ee163c2915ca03536496129103e9d72c5025d69' },
  { address: 'A2WassKticpB7cx15RZfenBekthwmqXRXd',
    secret: 'response modify knife brass excess absurd chronic original digital surge note spare',
    publicKey: '6b2594ebeee9b072087e5f1e89e5c41ee2d73eb788b63abeedf5c04664f0ce5b' } ]
```

## 4.2 生成应用模板

应用模板包括注册dapp必须的元信息、创世块以及一个初始的目录结构

生成应用模板需要使用`dapps`子命令，如下所示

```
# 生成应用模板的时候，最好建立一个新目录
> mkdir asch-test-dapp && cd asch-test-dapp
> asch-cli dapps -a
```

接下来，我们要回答一系列的问题，以生成应用的注册信息与创世块

```
? Enter DApp name Asch-test-dapp
? Enter DApp description Demo of asch dapp
? Enter DApp tags asch,dapp,demo
? Choose DApp category Common
? Enter DApp link https://github.com/AschPlatform/Asch-test-dapp.zip
? Enter DApp icon url https://yourdomain.com/logo.png
? Enter public keys of dapp delegates - hex array, use ',' for separator //这里是4.1章节生存的5个受托人对应的公钥
a437a1d4bedf738e8620920ef29542644e3366c635b16fc9faa6f5db744bcd5c,522cdc822d3bec74aa5c4e972ed6cba84850f9c4d521e43fe08675e9e4759bb9,6ee3ae36166f69e8b9408d277486c9870f40c1b7c16016328737d6445409b99f,ad558e44b347a54981295fcb5ee163c2915ca03536496129103e9d72c5025d69,6b2594ebeee9b072087e5f1e89e5c41ee2d73eb788b63abeedf5c04664f0ce5b
? How many delegates are needed to unlock asset of a dapp? 3
DApp meta information is saved to ./dapp.json ...
? Enter master secret of your genesis account [hidden]
? Do you want publish a inbuilt asset in this dapp? Yes
? Enter asset name, for example: BTC, CNY, USD, MYASSET XCT
? Enter asset total amount 1000000
? Enter asset precision 8
```

有几个注意事项

1. `DApp link`是为了方便普通用户自动安装，必须以`.zip`结尾, 如果您的dapp不打算开源或者没有准备好，可以把这个选项当做占位符，它所在的地址不必真实存在
2. `DApp icon url`这是在阿希应用中心展示用的应用图标, 必须以`.jpg`或`.png`结尾，如果该图片无法访问，阿希应用中心会展示一个默认的图标
3. `How many delegates ...`这个选项表示从`dapp`跨链转账资产时需要多少个受托人联合签名，该数字必须大于等于3、小于等于你配置的受托人公钥个数且小于等于101，数字越大越安全，但效率和费用越高
4. Dapp的创世块中可以创建内置资产，但不是必须的，内置资产无法跨链转账，只能在链内使用。在主链发行的UIA（用户自定义资产）可以充值到任意dapp中，也可从dapp提现到主链，这是dapp内置资产和UIA最大的区别。“一链多币，一币多链”指的就是主链可以发行多个UIA，而每个UIA都可以充值到多个dapp中。

## 4.3 注册应用到主链

注意这里的`主链`不是指`mainnet`， 每个`net`下都有相应的主链， 主链是相对Dapp（侧链）而言。

我们可以使用`registerdapp`注册应用到主链，如下所示

```
// 先生成一个dapp注册账户
// 注意这里的密码都是演示用途，且不可用于正式的dapp中
> asch-cli crypto -g
? Enter number of accounts to generate 1
[ { address: 'A9rhsV5xDny4G45gD2TXmFFpeiTfvAAQ7W',
    secret: 'possible melt adapt spoon wing coyote found flower bitter warm tennis easily',
    publicKey: '74db8511d0021206abfdc993a97312e3eb7f8595b8bc855d87b0dc764cdfa5a8' } ]
Done

// 在http://127.0.0.1:4096用localnet的创世账户“someone manual strong movie roof episode eight spatial brown soldier soup motor”登陆（该账户中有初始发行的1亿xas token），然后给A8QCwz5Vs77UGX9YqBg9kJ6AZmsXQBC8vj地址转10000个xas

> asch-cli registerdapp -f dapp.json -e "possible melt adapt spoon wing coyote found flower bitter warm tennis easily"
# 返回结果如下,这就是应用id。每个应用注册时返回的id不同，请记下你自己的应用id
0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb
```

使用浏览器访问`http://localhost:4096/api/dapps/get?id=0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb`, 可以查询到该dapp了，下面是返回信息

```
{
    "success": true, 
    "dapp": {
        "name": "asch-dapp-helloworld", 
        "description": "A hello world demo for asch dapp", 
        "tags": "asch,dapp,demo", 
        "link": "https://github.com/AschPlatform/asch-dapp-helloworld/archive/master.zip", 
        "type": 0, 
        "category": 1, 
        "icon": "http://o7dyh3w0x.bkt.clouddn.com/hello.png", 
        "delegates": [
            "a518e4390512e43d71503a02c9912413db6a9ffac4cbefdcd25b8fa2a1d5ca27", 
            "c7dee266d5c85bf19da8fab1efc93204fed7b35538a3618d7f6a12d022498cab", 
            "9cac187d70713b33cc4a9bf3ff4c004bfca94802aed4a32e2f23ed662161ea50", 
            "01944ce58570592250f509214d29171a84f0f9c15129dbea070251512a08f5cc", 
            "f31d61066c902bebc80155fed318200ffbcfc97792511ed18d85bd5af666639f"
        ], 
        "unlockDelegates": 3, 
        "transactionId": "0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb"
    }
}
```

## 4.4 部署应用代码及子网络

现在我们把4.2章节中创建的模板代码拷贝到asch的安装目录下的dapp子目录，并改名为dapp的id

```
> cp -r asch-test-dapp path/to/asch/dapps/0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb
```

然后把4.1章节创建的5个受托人密码写入这个dapp的配置文件中

```
> cat path/to/asch/dapps/0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb/config.json
{
    "secrets": [
        "easy snap cable harvest plate tone planet yellow spot employ humble what", 
        "adjust edge exist hurry joke carbon spice envelope battle shuffle hawk thought", 
        "survey spoil submit select warm chapter crazy link actual lonely pig grain", 
        "march struggle gap piece entry route kind pistol chunk spell honey summer", 
        "response modify knife brass excess absurd chronic original digital surge note spare"
    ]
}
```

这里我们把所有受托人的配置到同一个节点了，在生产环境中不推荐这样做，应该把秘钥尽量分散到多个节点，以防止单点故障。    
至此，dapp手工安装部署完成，开发调试阶段需要这样。等以后正式发布到mainnet后，其他节点只需要在钱包页面点击dapp就可以安装。

## 4.5 重启asch节点程序

```
> ./aschd restart
```

使用浏览器打开`http://localhost:4096/dapps/0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb/`，可以访问默认的一个前端页面，该页面可以进行一些简单的接口测试

也可以观察dapp的日志来排查一些问题

```
> tail -f path/to/asch/dapps/0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb/logs/debug.*.log
```

## 4.6 跨链充值

dapp的前后端通讯协议一般可以分为两大类：读和写。     
读指的是数据查询，比如内置的区块查询、交易查询、转账记录，以及自己定义和实现的一些查询接口。    
写指的是合约调用或事务执行，比如发起转账、设置昵称、提现等，同样，也包括其他的由开发者实现的各种合约或事务。     

每一个写入操作都需要消耗燃料资产，模板dapp默认的燃料是XAS，开发者可以通过调用相关接口改为适合您的燃料类型，可以设置成任意其他资产，包括dapp内置资产。
如果你您设置的燃料为外部资产，则需要从主链转入资产到这个dapp，这个过程叫充值，相反的过程叫做提现，这都是通过asch的跨链协议实现的。

充值有三种方式：

1. 使用交互式的web图型界面，在【应用中心】的【已安装应用列表】，选择“充值”即可
2. 使用`asch-cli deposit`命令，具体可参考[asch-cli文档](../asch_cli_usage.md)的“4.6.2 dapp充值章节”
3. 调用`asch-js`的`createInTransfer`函数，具体可参考[asch-js接口文档](../asch_js_api.md)

## 4.7 查询接口调用

查询接口一般通过http get协议，比如

```
// 获取dapp区块数据
> curl http://localhost:4096/api/dapps/0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb/blocks
# 返回结果如下
{
    "blocks": [
        {
            "id": "9fae0c8200b7f4ef8c96f264e621f01a39a0b365ff42b80232aece0f3136b0e5", 
            "timestamp": 0, 
            "height": 1, 
            "payloadLength": 103, 
            "payloadHash": "c3674e36954811f869865a3b106ada847d47b6bc1ffc0a69c1859756d34cb5ad", 
            "prevBlockId": "", 
            "pointId": "", 
            "pointHeight": 0, 
            "delegate": "8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd", 
            "signature": "fd7423c1ce4cb82e79125e39fc13e040cefce158af69b45d035aaf5a4c78db8f66aa3e93bbdfb72bfa0dd604f64f8bebc66dd08fd17715bb77225fc0743f680b", 
            "count": 1
        }
    ], 
    "count": 1, 
    "success": true
}
```

更多接口（外部获取dapp数据，非内部通讯）可以参考[dapp默认接口文档](../asch_dapp_default_api.md)

## 4.8 合约或事务调用

合约调用也有三种方式

1. 在模板应用的默认前端页面，通过交互式web图型界面进行
2. 使用`asch-cli dapptransaction`命令， 具体可参考[asch-cli使用说明](../asch_cli_usage.md)
3. 使用`asch-js`的`createInnerTransaction`函数, 具体可参考[asch-js接口文档](../asch_js_api.md)

## 5 目录结构

下面我们分析下asch dapp的目录结构

```
dapps/0599a6100280df0d296653e89177b9011304d971fb98aba3edcc5b937c4183fb/
├── blockchain.db         // dapp数据库文件，与主链的数据是分开存放的
├── config.json           // 应用的节点配置文件，目前主要用于配置受托人秘钥
├── contract              // 合约目录
│   └── domain.js         // 域名合约的实现代码
├── dapp.json             // 注册dapp时用到的元文件
├── genesis.json          // 创世区块
├── init.js               // 应用初始化代码，可以在该文件进行一些设置、事件注册等
├── interface             // 查询接口的实现目录
│   ├── domain.js         // 域名查询接口实现
│   └── helloworld.js
├── logs                  // 日志目录
│   └── debug.20170928.log
├── model
│   └── domain.js         // 域名业务数据模型定义
└── public
    └── index.html        // 默认前端页面
```

## 6 实现你的业务逻辑

我曾经在这个[博客里](http://blog.asch.so/2017/06/30/asch-1.3-foresight-2/)写过我们的开发理念

在asch dapp中实现一个业务逻辑，大概思路如下

### 6.1 定义你的数据模型

在这个环节，你需要考虑的是在区块链中保存什么数据或状态，你的账本内容是什么。     
哪些字段需要建立索引，以提高客户端查询速度。     
dapp有自己的db文件（sqlite3)，在dapps/dappId/blockchain.db，所有的表结构定义以及数据都存在这里。跟主链的数据是隔离的，主链的db文件在asch根目录下。

### 6.2 实现合约逻辑

这个环节，你需要考虑的是一个事务或一个调用会修改哪些状态，比如资产余额，账户属性等。     
我们在sdk中提供了丰富的接口可供调用，具体可参考[sdk接口文档](../asch_sdk_api.md)

### 6.3 实现查询接口

在这个环节，你需要考虑的是如何给前端返回数据，比如区块、交易，各种合约业务状态的查询等    
也可以可用这个通道将一些非全局状态保存到本地节点，我们会在后续章节介绍这些高级用法。     
目前dapp有[预置的通用查询接口](../asch_dapp_default_api.md)，这些是由asch-sandbox提供的。另外一部分就是用户自定义的查询接口，在dapps/dappID/interface/xx.js中进行定义。
