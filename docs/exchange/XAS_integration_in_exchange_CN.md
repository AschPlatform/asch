# XAS与交易平台对接文档    

    
---    
    
## 1 Asch基本信息    
代币名称：阿希币    
英文标识：XAS    
主网上线时间：2016-08-16    
发行总量：1亿，目前总的供应量为1.11亿XAS（有一个动态变化的通胀率,发行时间越长,通胀率越低）    
共识算法：dpos+pbft    
交易模式：账户余额模式，非UTXO    
官网：www.asch.io    
在线钱包：mainnet.asch.io，基本功能可以在这里进行体验    
区块链浏览器：https://explorer.asch.io/     
Asch地址：分为2类    
    
- 老地址:纯数字格式的，长度不低于10，比如3432613344807570257    
- 新地址:字母数字混合，base58格式且以大写字母A开头且长度不低于10，比如A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5    
    
    
Asch不是btc源码的山寨而是用nodejs全新开发的，目前都是纯http api，所以对接的时候请勿用btc模板的交易网站代码去生拉硬套，目前有java和nodejs版本的sdk，交易平台可以直接用，其它开发语言，需要自己封装http api。    
Asch没有钱包的概念，每个密码对应一个账户地址，也就是说一个“钱包”中只包含一个地址(实质为脑钱包)，与btc、eth等区别较大。    
Asch的精度是小数点后8位，但后台处理的时候都是按照整数来处理，比如想转0.1XAS，后台实际处理的是0.1 * 100000000。    
Asch http接口文档-中文版：https://github.com/AschPlatform/asch/blob/master/docs/asch_http_interface.md    
Asch http接口文档-英文版：https://github.com/AschPlatform/asch/blob/master/docs/asch_http_interface_en.md    
该文档包含大部分的Asch接口，比如查询余额、转账、交易详情等，调用api返回结果为json数据。    
    
    
## 2 建议交易平台在局域网内搭建一个Asch全节点(重钱包)    
需要用Linux服务器（建议用ubuntu 16.04），这样交易平台处理充值、提现性能要好很多并且安全，不需要有公网ip但需要能访问公网。    
下面是节点搭建命令    
```    
> sudo apt-get update && sudo apt-get install curl wget sqlite3 ntp -y    
> wget http://www.asch.io/downloads/asch-linux-latest-mainnet.tar.gz    
> tar zxvf asch-linux-latest-mainnet.tar.gz    
> # cd 解压后的目录名字,一般是 “asch-linux-版本号-mainnet”    
> chmod u+x init/*.sh && sudo ./aschd configure    
> # 下面这个curl命令是加载快照，加速第一次区块链同步的速度    
> curl -sL http://www.asch.io/downloads/rebuild-mainnet3.sh | bash    
> tail logs/debug.log  # 查看节点同步日志，等待同步到最新的区块即可。最新高度可以在区块链浏览器中看到 https://explorer.asch.io/    
```    
    
## 3 用户充值XAS    
Asch1.3版本开始支持转账备注，因此交易平台可以有下面两种充值方案。    
- `为每个用户生成一个充值地址`    
- `为所有用户生成同一个充值地址，根据转账备注判断具体是哪个用户进行了充值`    
    
### 3.1 方案1-为每个用户生成一个充值地址    
目前bit-z.com、chaoex.com、coinegg.com、coolcoin .com等早期上线XAS的交易平台都是采用这种方式。    
    
#### 3.1.1 为用户生成充值地址    
用户UserA登陆交易平台，进入Asch币充值页面，平台通过调用下面的代码生成充值地址、写入数据库，并在页面上展示给用户。    
通过下面的代码为UserA生成一个Asch充值地址：ALu3f2GaGrWzG4iczamDmGKr4YsbMFCdxB，该充值地址的密码是'latin december swing love square parade era fuel circle over hub spy'，这里只是举例，数据非真实。    
    
##### 3.1.1.1 调用http接口生成地址    
    
```    
> curl -k -X GET 'http://192.168.1.100:8192/api/accounts/new'       
// JSON返回示例如下    
{        
    success: true,    
    secret: "during crush zoo wealth horror left night upset spike iron divert lawn", // 密码       
    publicKey: "261fa56f389c324fddbe8777dbc0ef3341ee7b75d1ffdc82192265633b90d503", // 公钥        
    privateKey: "67c9523b7622704c4bcfe960cb32d7fa04d3eb94e30e7964d3c6a24a3647a0a3261fa56f389c324fddbe8777dbc0ef3341ee7b75d1ffdc82192265633b90d503", // 私钥        
    address: "ANfXDQUZroMnrQ6vRGR7UXXtbPn3fhEVRJ" // 地址        
}        
```    
    
##### 3.1.1.2 用asch-cli命令行工具批量生成地址    
```    
// 如果用其他编程语言，觉得批量生成账户地址有困难还可以用asch-cli命令行工具批量生成钱包地址（含密码、地址、公钥），生成多个地址，加密存到数据库或者其它地方，然后程序直接用.    
// 安装asch-cli工具    
> npm install -g asch-cli      
// 批量生成钱包地址    
// 需要nodejs版本为8.x，node --version查看node版本    
> asch-cli crypto -g    
? Enter number of accounts to generate 1 // 这里输入的的1表示生成一个地址，可以填写10、100或者1000等数字    
[ { address: 'AAW3Bh86U8RdHryp86KN19ScSVLpr2x6J4',    
	secret: 'actress south egg hen neutral salute section sign truck produce agent daughter',    
	publicKey: 'fd86a5bb9e06bd3a0555e27402f90b565300b0a7a6fb42ee4269aae0cfca60c6' } ]    
Done    
```    
    
##### 3.1.1.3 nodejs代码生成地址    
```     
// 以下为nodejs编程语言的demo（目前Asch SDK支持nodejs、java这2种语言，其它语言后续会支持，当前需开发者自行编码）    
    
// 建议用ubuntu 16.04，nodejs 8.x最新版    
// 安装nodejs的版本管理工具nvm    
> curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash    
// 上面命令执行完成后再开一个os shell窗口执行下面的命令，安装nodejs 8.x    
> nvm install node 8    
    
// 安装依赖库（asch-js、bitcore-mnemonic），在os shell中运行    
> npm install asch-js bitcore-mnemonic    
    
// 以下在node中运行    
var Mnemonic = require('bitcore-mnemonic');     
var secret = new Mnemonic(Mnemonic.Words.ENGLISH).toString();	// 生成密码    
console.log(secret);	    // 打印密码，'latin december swing love square parade era fuel circle over hub spy'    
Mnemonic.isValid(secret);   // 验证密码是否符合bip39规范    
    
var AschJS = require('asch-js');     
var publicKey = AschJS.crypto.getKeys(secret).publicKey;  // 根据密码生成公钥     
var address = AschJS.crypto.getAddress(publicKey);  // 根据公钥生成地址    
console.log(address);	// 打印地址，ALu3f2GaGrWzG4iczamDmGKr4YsbMFCdxB    
然后将用户名、地址、加密后的密码存入到数据库或者文件中，从而完成用户和充值地址的绑定，然后将充值地址展示在前端页面上。    
```    
    
#### 3.1.2 用户进行充值    
用户UserA在Asch钱包（比如mainnet.asch.io）往充值地址转阿希币,比如转0.8XAS。    
    
#### 3.1.3 交易平台确认用户充值    
交易平台检测每个新的区块，可以每隔10秒(也可以是30秒或者一分钟，技术上都没有问题，只是用户体验不一样)检测一次，每次检查时区块高度加1，检查的高度建议持久化存储并增加一个标记位“是否已检查”。    
如果区块里面交易详情的接收地址是平台的充值地址，则该笔充值记录需要显示到前端页面上并入库。    
##### 3.1.3.1 检测最新区块是否包含交易    
    
```    
// 通过区块高度获去检查该区块是否有交易并取到区块id，每个新区块都要检查    
// height=3183940表示区块高度    
> curl -k -X GET 'http://mainnet.asch.io/api/blocks/get?height=3183940'    
// 返回结果如下,保存到变量res中，下面会用到    
{    
	"success": true,    
	"block": {    
		"id": "951e14ef5100a9724a133f74e8f5c35e0d872aee654e7ea5323e57cd1c7b004e",	// 区块id    
		"version": 0,    
		"timestamp": 36252710,    
		"height": 3183940,    
		"previousBlock": "5dbf4b80063153e3bb66b46b27f9041955d308c47d57e51b4934952591519589",    
		"numberOfTransactions": 1,  //该区块包含的交易个数    
		"totalAmount": 80000000,     
		"totalFee": 10000000,    
		"reward": 350000000,    
		"payloadLength": 143,    
		"payloadHash": "5a61b58b75a70a42a6d51deba4dba560c78b2d671dfac68d37984eb464421d81",    
		"generatorPublicKey": "65e318f0022e3a05cc1603610125cf42af6772ac1afed657eec44bb3f8b02e64",    
		"generatorId": "9537352069871373416",    
		"blockSignature": "7b26571e3a55798d83e531817a5971ebdca59b4cfbb1edd182aff3b25c31578356b3a8992714b543f004cd7b362d7069f5dd426f411caacf06659747de1e580e",    
		"confirmations": "17", // 该区块的确认数    
		"totalForged": 360000000    
	}    
}    
```    
##### 3.1.3.2 根据区块id查询交易详情    
    
```    
// 如果res.block.numberOfTransactions > 0,则说明该区块包含交易。    
// 然后根据res.block.id并利用下面的接口去查询该区块包含的交易详情    
> curl -k -X GET 'http://mainnet.asch.io/api/transactions?blockId=951e14ef5100a9724a133f74e8f5c35e0d872aee654e7ea5323e57cd1c7b004e'    
// 返回结果如下，保存为变量trs    
{	    
	"success": true,    
	"transactions": [{    
		"id": "5a61b58b75a70a42a6d51deba4dba560c78b2d671dfac68d37984eb464421d81", // 交易id    
		"height": "3183940",    //区块高度    
		"blockId": "951e14ef5100a9724a133f74e8f5c35e0d872aee654e7ea5323e57cd1c7b004e",  //区块id    
		"type": 0, // 交易类型，0：XAS普通转账    
		"timestamp": 36252686,  // 交易时间戳，Asch时间，可以换算成现实世界的时间    
		"senderPublicKey": "40e322be1ec9084f48a17b5fecf88d59d0c70ce7ab06b1c4f6d285acfa3b0525",    
		"senderId": "AC4i4srjg1TyW24p8M4B8NTcYApUgvTpkd",   // 发送地址    
		"recipientId": "ALu3f2GaGrWzG4iczamDmGKr4YsbMFCdxB", // 接收地址,如果是平台地址，则需要做处理    
		"amount": 80000000, //转账金额，除以100000000后是真实的XAS个数，这里0.8XAS    
		"fee": 10000000,    
		"signature": "08a97ba29f7db324b31f782272e17c048f4b99d1761830bd7f541c484c28fcf14b1ee0dbbdd05ab2e80d186473e67d9bfed8e27b8c5e096d29a7f521236d8900",    
		"signSignature": "",    
		"signatures": null,    
		"confirmations": "20",  // 区块确认数    
		"args": [],    
		"message": "",  // 转账备注    
		"asset": {    
			    
		}    
	}],    
	"count": 1  // 该区块包含的交易个数    
}    
    
// 如果数组trs.transactions.length>0，则循环遍历trs.transactions得到元素i，如果(i.type == 0 and i.recipientId是平台的地址)，那么前端页面就要展示该充值记录并将该记录（充值id、充值地址、数量、确认数、发送时间、充值状态、交易id）写入到本地数据库中。    
    
// 充值状态是由确认数决定的，具体是几，由平台自己定，如果入库时确认数未满足平台标准，则充值状态是“未确认”，否则就是“已确认”.（目前Asch网络认为6个确认就是安全的，交易平台可适当增大该值。）    
    
// 每隔1分钟对本地数据库中所有的“未确认”充值记录进行再次确认，根据数据库中的“交易id”利用下面的接口去检查交易详情    
> curl -k -X GET 'http://mainnet.asch.io/api/transactions/get?id=5a61b58b75a70a42a6d51deba4dba560c78b2d671dfac68d37984eb464421d81'       
{    
	"success": true,    
	"transaction": {    
		"id": "5a61b58b75a70a42a6d51deba4dba560c78b2d671dfac68d37984eb464421d81",    
		"height": "3183940",    
		"blockId": "951e14ef5100a9724a133f74e8f5c35e0d872aee654e7ea5323e57cd1c7b004e",    
		"type": 0,    
		"timestamp": 36252686,    
		"senderPublicKey": "40e322be1ec9084f48a17b5fecf88d59d0c70ce7ab06b1c4f6d285acfa3b0525",    
		"senderId": "AC4i4srjg1TyW24p8M4B8NTcYApUgvTpkd",    
		"recipientId": "ALu3f2GaGrWzG4iczamDmGKr4YsbMFCdxB",    //接收地址    
		"amount": 80000000, // 金额    
		"fee": 10000000,    
		"signature": "08a97ba29f7db324b31f782272e17c048f4b99d1761830bd7f541c484c28fcf14b1ee0dbbdd05ab2e80d186473e67d9bfed8e27b8c5e096d29a7f521236d8900",    
		"signSignature": "",    
		"signatures": null,    
		"confirmations": "7837",    // 确认数    
		"args": [],    
		"message": "",  // 转账备注信息    
		"asset": {    
			    
		}    
	}    
}    
// 当"confirmations"达到平台要求后，更改数据库中的“充值状态”为“已确认”并显示在前端页面，最后用户UserA的XAS余额做相应的增加。    
    
```    
至此用户UserA完成了充值流程。    
    
#### 3.1.4 交易平台将用户充值的XAS转到一个总账户中    
充值完成后，交易平台再将这些分散的用户xas转账到交易平台自己的总账户中（请一定保存好密码）。    
总账户：可以做为平台的Asch冷钱包或者热钱包供用户提现。    
举例，平台XAS总账户地址：A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5    
Asch提供了下面2种方式进行转账操作。    
    
##### 3.1.4.1 通过不安全的api进行转账    
这种方式是把密钥放到请求里面并且明文发送给服务器进行交易的生成和签名，不安全，不建议使用。如果非要使用这种方式，务必在局域网内搭建一台Asch节点服务器，用来提供API服务。    
    
- 汇总前通过查询本地数据库将XAS余额大于0的账户找到    
    
- 可以利用如下api将充值的XAS转入到平台总账户中，该操作消耗0.1XAS手续费    
```    
> curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"latin december swing love square parade era fuel circle over hub spy","amount":70000000,"recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","message":"beizhu"}' 'http://192.168.1.100:8192/api/transactions' && echo // 70000000表示0.7 XAS，因为网络需要收取固定的0.1XAS手续费，所以UserA的充值地址只可以转出0.7 XAS    
// 返回结果如下    
{    
	"success": true,    // 转账状态，成功    
	"transactionId": "6d9b9338ea71ca74a41995458959250e16e49f52b31f4887ac28d3cc3586b1a1" // 交易id    
}    
```    
    
##### 3.1.4.2 通过安全的api进行转账    
建议使用这种安全的方法进行转账，此种方法是在本地生成交易信息并签名，然后广播到区块链网络中，这里对Asch Server没有安全性要求。    
```    
var asch = require('asch-js');       
var targetAddress = "A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5";   // 接受地址    
var amount = 0.7*100000000;   // 0.7 XAS    
var message = 'beizhuxinxi'; // 转账备注    
var password = 'latin december swing love square parade era fuel circle over hub spy'; // 发送者主密码    
var secondPassword=null; // 发送者二级密码，如果没有设置的话就是null    
// 生成交易信息并签名    
var transaction = asch.transaction.createTransaction(targetAddress, amount, message, password, secondPassword || undefined);           
JSON.stringify({"transaction":transaction})    
'{"transaction":{"type":0,"amount":70000000,"fee":10000000,"recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","message":"beizhuxinxi","timestamp":43831575,"asset":{},"senderPublicKey":"d1cda821c7f98436f0c7824b96e9fe4dba50d54ed8fd69a92752cd923e416fc2","signature":"005e529e580010398424dbbd65b9c154b37f6cd575010a4f6d9396594311c1ef62487f1040a2cba1dd16a5dba3d12605d211fa08171967886ce9ef301ae82f05","id":"0f28435e9c395dd6b825bda167359bc23d41b5fc632afb59fedfafa298c27cde"}}'    
    
// 将上面生成的转账操作的交易数据通过post提交给asch server    
curl -H "Content-Type: application/json" -H "magic:5f5b3cf5" -H "version:''" -k -X POST -d '{"transaction":{"type":0,"amount":70000000,"fee":10000000,"recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","message":"beizhuxinxi","timestamp":43831575,"asset":{},"senderPublicKey":"d1cda821c7f98436f0c7824b96e9fe4dba50d54ed8fd69a92752cd923e416fc2","signature":"005e529e580010398424dbbd65b9c154b37f6cd575010a4f6d9396594311c1ef62487f1040a2cba1dd16a5dba3d12605d211fa08171967886ce9ef301ae82f05","id":"0f28435e9c395dd6b825bda167359bc23d41b5fc632afb59fedfafa298c27cde"}}' http://192.168.1.100:8192/peer/transactions    
```    
    
    
### 3.2 方案2-为所有用户生成同一个充值地址    
所有的用户共用一个Asch充值地址，充值时填写备注信息为自己在交易平台的用户名或者id，这样就不需要生成多个Asch充值地址了，但是如果用户填写错备注信息的话处理起来较为麻烦，需要专人客服去处理。    
该种方式，大体流程和方案1一致，这里不再赘述。    
    
    
## 4 提币XAS    
提现操作就是转账，把平台的币转给用户。    
### 4.1 用户绑定提币地址    
用户登陆Asch提现页面，参考其它代币，让用户可以自行绑定提现地址。    
### 4.2 用户进行提币    
输入提币数量，手机短信验证，点击确认。    
### 4.2 平台执行提币操作    
参考“3.1.4”章节，有2种转账方式，请自行决定用哪一种。接口会返回，提币的交易id，记录到数据库中并展示到前端页面，更新提币状态为“成功”。    
### 4.3 用户确认    
用户自行确认提币结果，如有疑问，可以拿着交易id来平台这里进行查询验证。
