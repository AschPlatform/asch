# Asch DAPP核心开发流程解析

标签（空格分隔）： Asch DAPP

---

## 1.准备工作


`基础知识`：明白什么是区块链？什么是侧链？怎么用linux？怎么用nodejs？bitcoin的基本运行原理？什么是共识？什么是dpos？什么是受托人？什么是主密码？什么是私钥、公钥、地址？什么是创世块？什么是资产？这些弄明白了（最起码得大体了解）再往下看，否则就是事倍功半，真没必要往下看了。
`概念理解`：Asch的DAPP是运行在侧链上的，每个DAPP也可以简单理解为一条侧链，具有区块链的基本属性，比如共识机制（默认是dpos，高端玩家可以定制自己的共识算法）、区块信息、转账交易记录、P2P广播通讯、数据库文件等，跟Asch主链有相同的加密算法、地址生成算法，也就是说同一个账户在主链和DAPP中是通用的（通用指的是同一个密码登陆进去后地址相同）。
`OS`：Ubuntu 14.04.x 或者 16.04.x(物理机、虚拟机或者Bash on Ubuntu on Windows都可以)
`IDE`：vscode
`nodejs`： 8.4.0 
`npm`：5.3.0

如下链接为 `DAPP开发前必读文章` （包含里面的那些链接文章也要读）
https://github.com/AschPlatform/asch/blob/master/docs/asch_dapps_introduction.md
https://github.com/AschPlatform/asch/blob/master/docs/dapp_docs/1_hello.md
https://github.com/AschPlatform/asch/blob/master/docs/asch_sdk_api.md
https://github.com/AschPlatform/asch/blob/master/docs/asch_dapp_default_api.md
https://github.com/AschPlatform/asch/blob/master/docs/asch_cli_usage.md
https://github.com/AschPlatform/asch/blob/master/docs/asch_http_interface.md

在开发期间遇到的任何的技术问题都可以去https://github.com/AschPlatform/asch/issues查找或者创建新的issue。

`友情提示`：区块链是块大蛋糕，但吃之前先给自己做个评估，看是否有能力吃的下、能吃多少、是否能吃的顺心。

## 2.搭建本地localnet
localnet简单理解就是Asch私有链，这里是为了方便DAPP开发而搭建的。localnet上的DAPP如果开发、测试顺利通过，相当于整个DAPP已完成90%的工作。
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
至此，完成localnet服务端部分的构建。
```

```
# Web Wallet
cd public/

npm install bower -g
npm install browserify -g
npm install gulp  -g

npm install
# angular chose "angular#~1.5.3 which resolved to 1.5.11 and is required by ASCH"
bower install

npm run build
gulp build-test #This make the front-end files in public dir.
至此，完成localnet前端页面（钱包UI）的构建。
```

```
// 启动Asch
cd asch && node app.js // 日志打印到屏幕终端，ctrl+c结束进程
或者
cd asch && ./aschd start // 守护进程方式启动，日志记录到logs/debug.log中。./aschd stop结束进程
或者其它的启动方式，比如pm2 start app.js

```
然后在浏览器中打开 ```http://localhost:4096```，如果能看到Asch钱包登陆页面说明localnet的搭建和启动成功（localnet的创世账户密码："someone manual strong movie roof episode eight spatial brown soldier soup motor"，里面有一亿XAS）。如果页面报错，则需要检查app.js进程是否存在、日志报错信息等。


## 3.注册并启动第一个DAPP

### 3.1 发行资产（UIA）
发行自己的资产，请参考这个链接http://docs.asch.mobi/docs/asch_issue_assets.html。
这里我们在钱包页面生成一个新账户A，主密码为“almost journey future similar begin type write celery girl month forget breeze”，对应的地址是AAjoobuMcmkQ1gS8vTfBy3dQavBiH7sBCF，该账户将作为下面的cctime.XCT资产发行者、cctime DAPP的注册者以及给其它账户转账的发送者，创世账户给该地址转1000个xas。

A账户去注册发行商cctime，然后注册一个资产XCT（上限100亿，精度8，描述为：cctime.org的token时讯币，其它用默认的），最后发行10亿的cctime.XCT。

### 3.2 利用模板启动第一个DAPP
Asch作为一个区块链开发平台，为开发者提供了一个安全且高性能的虚拟机（asch-sandbox）以及一系列的内部接口、框架等。其中的一个脚手架就是利用模板来生成自定义的DAPP，通过回答几个问题就可以完成DAPP框架代码的开发工作。
模板包含了启动一个dapp需要的最少数据

#### 3.2.1 生成DAPP元信息(创世块）

```
// 生成5个受托人账号
zhenxi@MiAir:~/Codes/github/AschPlatform/asch$ asch-cli crypto -g
? Enter number of accounts to generate 5
[ { address: 'A9pDhjc7NuYMWYLxkgAgVmHE2NQ7diMcWX',
    secret: 'fit night someone unveil dwarf believe middle evidence puzzle hotel common choose',
    publicKey: 'afdf69f0da9ff333218f2cd10cb0a907c2e76788f752b799cb1dab3a9f03bf63' },
  { address: 'A2jvQUNowLgP9hHMN3tSCAUkakuigGRytB',
    secret: 'lawsuit ride civil slice kitchen unfold unable lumber prevent suspect finger chunk',
    publicKey: '67d52a0265f9e5366660c8b384cee56d3f8b5737b2dd3c617d22df83b5ebef02' },
  { address: 'A7JjHgx7ACCJ6AxypBn4Qt9NrGaY4JuZDF',
    secret: 'absurd sweet blast dinner battle zero ladder steak coral fork venture coffee',
    publicKey: '39c2322600a0c81ecfa97119ec8e2d5bfb73394914d92b54e961846a987e4e22' },
  { address: 'AMu7kuP9TjywkUQQQgALid96So2VCve5QB',
    secret: 'topic ramp throw cloud moment jungle bar series task protect erupt answer',
    publicKey: '4740d2c16bf6c5a174eba1e0f859253a64851d30acbc9655b01394af82d3e325' },
  { address: 'A9BzaJDkyzb9RVAFjsePMemSVXMDLiQpjJ',
    secret: 'shoot tired know dish rally kiwi snack patrol bunker ocean panel this',
    publicKey: 'b433c226645981477642491f77de7b8d63274aa51f932bbe1fe3f445a8aaecc9' } ]
Done
```

```
// 根据模板和自定义参数生成自己的dapp框架，包含创世块、配置文件、数据和合约、接口、日志等目录
cd dapps 
mkdir cctime && cd cctime
zhenxi@MiAir:~/Codes/github/AschPlatform/asch/dapps$ asch-cli dapps -a
Copying template to the current directory ...
? Enter DApp name cctime
? Enter DApp description cctime.org
? Enter DApp tags news
? Choose DApp category News
? Enter DApp link http://github/aschplatform/cctime.zip
? Enter DApp icon url http://a.com/x.png
? Enter public keys of dapp delegates - hex array, use ',' for separator afdf69f0da9ff333218f2cd10cb0a907c2e76788f752b799cb1dab3a9f03bf63,67d52a0265f9e5366660c8b384cee56d3f8b5737b2dd3c617d22
df83b5ebef02,39c2322600a0c81ecfa97119ec8e2d5bfb73394914d92b54e961846a987e4e22,4740d2c16bf6c5a174eba1e0f859253a64851d30acbc9655b01394af82d3e325,b433c226645981477642491f77de7b8d63274aa51f932bb
e1fe3f445a8aaecc9
? How many delegates are needed to unlock asset of a dapp? 3
DApp meta information is saved to ./dapp.json ...
? Enter master secret of your genesis account [hidden] //这里输入的密码为：'almost journey future similar begin type write celery girl month forget breeze'
? Do you want publish a inbuilt asset in this dapp? Yes
? Enter asset name, for example: BTC, CNY, USD, MYASSET XCT
? Enter asset total amount 100000000
? Enter asset precision 8
New genesis block is created at: ./genesis.json
// 生成的文件如下
zhenxi@MiAir:~/Codes/github/AschPlatform/asch/dapps/cctime$ ls
config.json  contract  dapp.json  genesis.json  init.js  interface  model  public
```

#### 3.2.2 注册DAPP到localnet上
```
zhenxi@MiAir:~/Codes/github/AschPlatform/asch/dapps/cctime$ asch-cli registerdapp -f dapp.json -e "almost journey future similar begin type write celery girl month forget breeze"
// 返回结果为dappId
75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed
```
此时钱包的“应用列表”就可以看到该应用了。
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/2.png)

将cctime目录改名为75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed,这样就完成了dappp在本地节点的安装（整个过程是手工安装，以后正式上线后，其他节点安装时无须这么麻烦，只需要在页面点击就可以安装）。
```
cd ..
mv cctime 75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed
```

#### 3.2.3 启动DAPP
重启asch服务，默认会加载dapps目录下的所有的dapp。此时dapp中只有模板预置的信息，虽然此时没有自定义的数据、合约、接口等信息，但dapp已经是一条具备最小功能的侧链了，只需要配置好受托人就可以产块和转账。
此时钱包的“已安装应用列表”就可以看到该应用了。
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/3.png)

启动后，dapps/75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed下会多出一个blockchain.db文件。dapp第一次启动时会创建2种表，1：用户自定义表，由model下的数据模型文件决定，2：asch_sandbox预置表，这些都是区块链的系统表。

目前我们这个DAPP的blockchain.db包含如下表：
`accounts` dapp内账户信息，asch_sandbox预置
`blocks`  dapp区块表，asch_sandbox预置
`domains` 域名表，非asch_sandbox预置表，而是根据model下的domain.js定义生成的表，可以删除
`transactions` dapp交易表，asch_sandbox预置
`variables` dapp变量表，asch_sandbox预置
`balances` dapp余额表，asch_sandbox预置
`deposits` 主链往dapp上充值记录表，asch_sandbox预置
`round_fees` dapp的dpos共识下，每轮的手续费详情表，asch_sandbox预置
`transfers` dapp内部转账表，asch_sandbox预置

浏览器打开 `http://localhost:4096/dapps/75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed/` 如果能看到“Asch DApp Example 1 - hello world”页面说明dapp启动成功。

此时用'almost journey future similar begin type write celery girl month forget breeze'登陆后看到XCT（这是dapp内置的资产，只能在dapp内使用，不是我们之前在主链发行的用户资产cctime.XCT）余额为100000000，与我们注册dapp时设定的参数一致。

![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/1.png)

#### 3.2.4 配置DAPP的受托人
编辑dapps/75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed/config.json文件,将上面5个受托人的密码加入到该文件中
```
{
        "secrets": [
          "fit night someone unveil dwarf believe middle evidence puzzle hotel common choose",
          "lawsuit ride civil slice kitchen unfold unable lumber prevent suspect finger chunk",
          "absurd sweet blast dinner battle zero ladder steak coral fork venture coffee",
          "topic ramp throw cloud moment jungle bar series task protect erupt answer",
          "hoot tired know dish rally kiwi snack patrol bunker ocean panel this"
        ]
}
```
然后重启asch，此时dapp已经可以产块了。具体可以看dapp的日志输出 dapps/75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed/logs/debug.20180125.log

#### 3.2.5 DAPP基本操作
##### 3.2.5.1 往DAPP中进行充值
用密码“almost journey future similar begin type write celery girl month forget breeze”登陆Asch钱包，往DAPP中充值100 XAS（这个充值动作实质就是跨链操作），消耗0.1XAS手续费。
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/4.png)

10秒后（也有可能是1秒、3秒或者8秒，这里实质是要等一个区块确认后才能看到充值余额，而10秒是一个块的默认出块时间），去 `http://localhost:4096/dapps/75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed/` 页面验证充值
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/5.png)

此时AAjoobuMcmkQ1gS8vTfBy3dQavBiH7sBCF这个账户在主链的XAS余额减少了100.1（0.1是充值手续费），而在侧链cctime中XAS余额增加了100。

同理充值100 cctime.XCT资产。
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/6.png)

##### 3.2.5.2 DAPP内部转账
生成另一个账户B，主密码“attack exist tuna tunnel enhance coach favorite safe buffalo faculty robot blue”，地址为APoBYfxx266FH5HCrkBdebAZ2wFPjJ3Q4z。
A调用DAPP的系统内置合约给B用户转账10 cctime.XCT,这里展示的是通过页面调用接口（该页面的Contract invoke可以理解为postman）,该合约的详细描述见[DAPP_默认API](https://github.com/AschPlatform/asch/blob/master/docs/asch_dapp_default_api.md#3122-dapp%E5%86%85%E9%83%A8%E8%BD%AC%E8%B4%A6type3)

转账时的数额是 真实数额*10**资产精度数值（区块链上前端看到的有小数，但后端都是按照整数计算的）
这里选择编号为3的system合约就是dapp内部转账（小于1000的都是system内置合约，目前已经1-4共4个合约，详情见文档：https://github.com/AschPlatform/asch/blob/master/docs/asch_dapp_default_api.md#3-%E4%BA%8B%E5%8A%A1transactions）
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/7.png)

![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/8.png)

![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/9.png)

此时A账户在DAPP中的XAS余额减少0.1（DAPP默认手续费是XAS，可以自定义为其它资产或者不收手续费），cctime.XCT余额减少10。B账户的cctime.XCT余额增加10.

账户A的余额：
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/10.png)

账户B的余额：
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/11.png)

##### 3.2.5.3 DAPP内给地址设置昵称
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/14.png)

OK，上面BB了那么多，其实就干了一件事：没有写一行代码只是利用现有的工具就搭建起来一条具备跨连充值、跨链提现、内部转账功能的侧链，并且还可以创建内置资产。从下面章节开始，才是用户自定义数据、智能合约、外部接口的代码编写。

## 4 DAPP核心开发流程
开发dapp跟把大象放进冰箱的步骤一毛一样，本章节就是围绕下面这三步来做 :)

![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/12.png)

下面这些操作都是在dapps/75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed/目录下进行的。

### 4.1 自定义用户数据模型（RDBMS表）
注意事项：

- `表结构定义需要放到model目录下`
- `字段属性都是RDBMS通用的，比如类型有string、nmber等，not_null，defaut值，length长度、主外键约束、唯一约束等`
- `如果字段是String类型，则必须加上length属性`
- `DAPP启动时会检查这些表是否存在，如果不存在则会自动创建，保存到blockchain.db文件中`

在model目下创建article.js文件，该文件定义了articles表，内容如下
```
module.exports = {
  name: 'articles',
  fields: [
    // 文章id
    {
      name: 'id',
      type: 'String',
      length: '20',
      not_null: true,
      primary_key: true
    },
    // 发表文章时的交易id
    {
      name: 'tid',
      type: 'String',
      length: 64,
      not_null: true,
      unique: true
    },
    // 文章作者的地址
    {
      name: 'authorId',
      type: 'String',
      length: 50,
      not_null: true
    },
    // 时间戳，距离cctime创世块经历的秒数
    {
      name: 'timestamp',
      type: 'Number',
      not_null: true
    },
    // 文章标题
    {
      name: 'title',
      type: 'String',
      length: 256,
      not_null: true
    },
    // 如果文章是引用的，其url地址定义
    {
      name: 'url',
      type: 'String',
      length: 256
    },
    // 文章内容
    {
      name: 'text',
      type: 'String',
      length: 4096,
      not_null: true,
    },
    // 文章标签
    {
      name: 'tags',
      type: 'String',
      length: 20
    },
    // 文章得到的投票数
    {
      name: 'votes',
      type: 'Number',
      not_null: true
    },
    // 文章评论
    {
      name: 'comments',
      type: 'Number',
      not_null: true,
      default: 0
    },
    // 举报
    {
      name: 'reports',
      type: 'Number',
      not_null: true,
      default: 0
    }
  ]
}
```

### 4.2 自定义用户合约
这一步里面主要用到的文档是：https://github.com/AschPlatform/asch/blob/master/docs/asch_sdk_api.md
app.xxx这种接口都来自asch_sandbox。
合约就是业务逻辑处理。

```
// 在contrac目录下创建cctime.js
module.exports = {
  // 定义发布文章的智能合约函数
  postArticle: async function (title, url, text, tags) {
    // 下面这些if判断是用来校验文章信息是否合法，有些是可以用 app.validate(type, value) 接口进行重写的
    if (!url && !text) {
      return 'Should provide url or text'
    }
    if (url && text) {
      return 'Both url and text are not supported'
    }
    if (!tags) {
      return 'Should provide tags'
    }
    if (tags.length > 20) {
      return 'Invalid tags size'
    }
    if (!title) {
      return 'Should provide title'
    }
    if (title.length > 256) {
      return 'Invalid title size'
    }
    if (url && url.length > 256) {
      return 'Url too long'
    }
    if (text && text.length > 4096) {
      return 'Text too long'
    }
    //TODO validate url format
    
    // 对key进行加锁，防止重复数据。这里的意思是如果用户发表的文章是转载其它url的，则需要检查该url是否已经被发布过了。需要在内存中将这个url的key锁住，防止同一个区块内其他人再次发布这个url然后去检查db中是否已经有这个url了
    if (url) {
      app.sdb.lock('postArticle@' + url)
      let exists = await app.model.Article.exists({ url: url })
      if (exists) {
        return 'Url already exists'
      }
    }
    // 调用app.sdb.create将校验过的文章信息插入到articles表中
    app.sdb.create('Article', {
      title: title,
      url: url || '',
      text: text || '',
      tags: tags,
      id: app.autoID.increment('article_max_id'),
      votes: 0,
      tid: this.trs.id,
      authorId: this.trs.senderId,
      timestamp: this.trs.timestamp,
      comments: 0
    })
  }
}
```

```
// 修改init.js
// 注册合约
module.exports = async function () {
  console.log('enter dapp init')
  // 注册合约，用户自定义合约编号是从1000开始的，之前的都是system保留合约。
  app.registerContract(1000, 'cctime.postArticle')

  app.events.on('newBlock', (block) => {
    console.log('new block received', block.height)
  })
}
```

### 4.3 自定义查询接口
// interface目录下新增index.js，内容如下

```
// 根据条件查询被举报次数小于的文章，并按照时间倒序排
async function getArticlesByTime(options) {
  // 查询符合条件的记录数
  let count = await app.model.Article.count({ reports: { $lt: 3 } })
  // 查询符合条件的记录详情
  let articles = await app.model.Article.findAll({
    condition: {
      reports: { $lt: 3 }
    },
    limit: options.limit || 50,
    offset: options.offset || 0,
    sort: { timestamp: -1 }
  })
  return { count: count, articles: articles }
}

// 定义url路由，根据条件获取文章
app.route.get('/articles', async (req) => {
    // 获取url传进来的参数
    let query = req.query
    // 默认按照timestamp来排序
    if (!query.sortBy) {
      query.sortBy = 'timestamp'
    }
    
    // 设定本次查询的key
    let key = ['articles', query.sortBy, query.limit, query.offset].join('_')
    // 如果内存中有本次查询的key，则直接返回其对应的结果
    if (app.custom.cache.has(key)) {
      return app.custom.cache.get(key)
    }
    
    let res = null
    if (query.sortBy === 'timestamp') {
      res = await getArticlesByTime(query)
    } else {
      throw new Error('Sort field not supported')
    }
    // 从articles表只能获取到地址，没有昵称，下面一系列的操作是把昵称加入到返回结果中
    let addresses = res.articles.map((a) => a.authorId)
    let accounts = await app.model.Account.findAll({
      condition: {
        // sql的in查询
        address: { $in: addresses }
      },
      fields: ['str1', 'address']
    })
    let accountMap = new Map
    for (let account of accounts) {
      accountMap.set(account.address, account)
    }
    for (let article of res.articles) {
      let account = accountMap.get(article.authorId)
      if (account) {
        article.nickname = account.str1
      }
    }
    // 将key和其值加入到内存中
    app.custom.cache.set(key, res)
    return res
  })
```

4.4 测试
重启asch服务。
此时已经能看到我们刚才定义的“发布文章的”智能合约
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/13.png)

根据编号为1000的智能合约的定义，我们可以传4个参数给后台。
titile:news_title
url:null
test:This is news text.
tags:tag1

![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/15.png)

成功创建文章，交易id为：746279f5c7831968fb8e507456651f946b4aa5127125de6070143a8f82f00ffb
![](http://asch-public.oss-cn-beijing.aliyuncs.com/pics/dapp%E6%A0%B8%E5%BF%83%E5%BC%80%E5%8F%91%E6%B5%81%E7%A8%8B%E8%A7%A3%E6%9E%90/16.png)


根据interface定义的接口去查询数据

```
http://localhost:4096/api/dapps/75d084dc91221b380e7a3c6b3b7467935572b4ebaa1e9a3db91e1239377c1fed/articles
```

未完待续







