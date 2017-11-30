# Dapp开发教程一 Asch Dapp Hello World

## 1 基本流程

Asch有三种net，localnet，testnet，mainnet，后两种是发布到线上的，可通过公网访问。
第一种localnet是运行在本地的、只有一个节点的私链，主要是为了方便本地测试和开发。
Dapp的开发同样要涉及到这三种网络，即

- 第一步，在localnet开发、本地测试
- 第二步，在testnet测试
- 第三步，正式发布到mainnet

## 2 启动localnet

每个开发者都可以在本地启动自己的localnet，需要先下载[asch源码](https://github.com/sqfasd/asch)。

```
git clone https://github.com/sqfasd/asch
```

下载后就可以参照该项目的README进行后面的安装、运行操作。

## 3 安装asch-cli

```
npm instal -g asch-cli
```

注意这一步不要用淘宝的```cnpm```， **有bug**

## 4 在本地创建一个应用

首先要进入你的asch源码目录，并确保localnet启动

```
cd <asch source code dir>
node app.js
```

然后使用```asch-cli```的```dapps```子命令创建应用

```
asch-cli dapps -a
```

接下来，我们要回答一系列的问题，以生成应用的创世区块

```
? Enter secret of your testnet account *******************************************************************************
# 这里需要输入一个创世账户，可以是任意一个普通的asch主密码(12个单词组成的那个)

? Enter second secret of your testnet account if you have
# 创世账户是否设置了二级密码，默认是没有的，我们直接输入回车即可

? Enter DApp name Hello Dapp
# Dapp的名字，我们输入的是Hello Dapp

? Enter DApp description Hello world demo for asch dapp
# Dapp的描述，可以为空

? Enter DApp tags hello,asch,dapp
#　Dapp的tags，为了将来更好的检索，可以为空

? Choose DApp category
  1) Common
  2) Business
  3) Social
  4) Education
  5) Entertainment
  6) News
(Move up and down to reveal more choices)
  Answer:
# Dapp的类型，可以任意选择你的dapp所属的业务范围或领域，输入列表中的数字即可 

? Enter DApp link https://github.com/sqfasd/asch-hello/archive/master.zip
# 输入Dapp源码的压缩包，必须以zip结尾，安装的时候需要通过这个链接进行下载

? Enter DApp icon url https://www.asch.com/logo.png
# Dapp图标的url

? Do you want publish a inbuilt asset in this dapp? No
# 是否需要在dapp中内置一个资产，我们暂时不需要这个选项，输入No即可

? Enter public keys of dapp forgers - hex array, use ',' for separator 8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd
# 输入dapp的初始受托人公钥列表，用逗号分隔，以后dapp的受托人是可以动态添加的，所以我们只需要输入创世账户的一个密钥即可

Creating DApp genesis block
Fetching Asch Dapps SDK
Saving genesis block
Saving dapp meta information
Registering dapp in localnet
Done (DApp id is 6299140990391157236)

# 接下来程序就会自动在localnet上注册这个应用了，在这个示例中，我们的应用id为6299140990391157236
```

## 5 目录结构

我们可以查看dapps下面新增了一个目录，目录名就是新创建的dapp的id

```
ls -1 dapps/<dapp id>

blockchain.json         # dapp数据库描述
config.json             # dapp的配置文件，主要是种子节点的列表，与主链配置类似，开发者也可以添加其他自定义配置
dapp.json               # dapp的元信息，包括名称、描述、源码包等，这个文件可以用来在不同的网络再次注册时使用
genesis.json            # 创世块，命令行自动生成的，你也可以自己写程序生成，那样就可以更灵活的分配创世账户的资产
index.js                # dapp的入口文件
init.js                 # 各模块的初始化代码在此
LICENSE                 # 源码许可描述
modules                 # 主要代码在这里
modules.full.json       # 需要加载的模块配置，如果需要新增模块，可以在这里配置
modules.genesis.json    # (模块配置的简化版，暂时不需要)
node_modules            #
package.json            #
public                  # 前端目录
routes.json             # http路由配置，如果要新增接口，需要修改这个配置文件
```

开发者如果觉得复杂，不需要详细追究，先大概了解即可。
与开发者最相关的文件主要在```modules/contracts/```目录下
我们看到这个目录已经存在4个内置的合约类型

```
ls -1 dapps/<dapp id>/modules/contracts/

delegates.js            # 受托人注册合约
insidetransfer.js       # 链内转账合约
outsidetransfer.js      # XAS充值合约
withdrawaltransfer.js   # XAS提现合约
```

开发者需要做的就是创建新的合约，用来表达你的业务逻辑，仅此而已。其他不相关的代码都不需要了解。

## 6 配置dapp创世密钥

我们需要在```config.json```的```dapp```的字段配置上我们之前在创世块中使用的主密码和对应的dapp id。

将来发布到正式网络中时，也需要有一台节点配置这个密钥，**仅需一台**

```
"params": {
  "6299140990391157236": [
    "someone manual strong movie roof episode eight spatial brown soldier soup motor"
  ]
}
```

## 7 访问前端

好，现在我们来放松一下，打开dapp的前端链接，体验一下侧链的基本功能。
可以在钱包ui的已安装应用列表中找到dapp入口
或者直接访问dapp的url```localhost:4096/dapps/<dapp id>```

在这个hello world项目中，我们可以进行充值、链内转账和提现操作。
目前的充值暂时只能通过命令进行操作(后面会做到主钱包中)，其他功能都可以直接在这个界面上操作

```
asch-cli dapps -d

? Enter secret *******************************************************************************
? Enter amount 100
? DApp Id 6299140990391157236
? Enter secondary secret (if defined)
? Host and port localhost:4096
null { success: true, transactionId: '10589988261732949004' }
10589988261732949004
```

充值和提现操作都是30秒刷新一次，我们稍等片刻，就可以看到界面上的余额刷新了。
