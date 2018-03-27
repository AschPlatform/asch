# CCTime.XCT与交易平台对接文档    
    
 
    
---    
    
写在前面的话，本文档同样适用于在Asch平台发行的其它资产与交易平台的对接，其它资产请将下面的CCTime.XCT 换成你的资产名即可。    
    
## 1 CCTime.XCT基本信息    
中文名称：时讯币    
英文标识：CCTime.XCT（前台页面可以展示为XCT，但后端调用接口处理时则必须是CCTime.XCT）    
发行总量：最大发行总量100亿（目前已空投10亿，精度为8位）    
官网：http://cctime.org    
在线钱包：http://asch.cn ,基本功能可以在这里进行体验。    
特别声明：XCT是在Asch发行的资产（UIA），所以可以跟xas共用一个地址，具体是否共用，由交易平台自行决定。    
发行说明：采用空投的方式将XCT分给XAS、BTC、ETH、BTS持有者。    
    
备注：由于XCT是在Asch上面发行的资产，所以XCT的在Asch主链上的转账需要支付XAS做为手续费，目前每笔XCT转账都需要固定的0.1XAS手续费。（类比以太坊的ERC20资产转账需要消耗ETH）    
    
对XCT的操作可以通过Asch API来进行。    
Asch http接口文档-中文版：https://github.com/AschPlatform/asch/blob/master/docs/asch_http_interface.md    
Asch http接口文档-英文版：https://github.com/AschPlatform/asch/blob/master/docs/asch_http_interfaceen.md    
该文档包含大部分的Asch接口，比如查询余额、转账、交易详情等，调用api返回结果为json数据。    
    
    
## 2 建议交易平台在局域网内搭建一个Asch全节点    
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
举例：这里搭建完成后局域网ip是：192.168.1.100    
    
备注：交易平台开发对接阶段可以用我们提供的测试服务器http://101.200.84.232:4097 ，测试账户密码'found knife gather faith wrestle private various fame cover response security predict'    
    
## 3 充值XCT    
Asch1.3版本开始支持转账备注，因此交易平台可以有两种充值方案。    
    
- `为每个用户生成一个充值地址`     
- `为所有用户生成同一个充值地址，根据转账备注判断具体是哪个用户进行了充值`    
    
### 3.1 方案1-为每个用户生成一个充值地址    
目前bit-z.com、chaoex.com、coinegg.com、coolcoin.com等早期上线XAS的交易平台都是采用这种方式。    
    
    
#### 3.1.1 为用户生成充值地址    
用户UserA登陆交易平台，进入XCT充值页面，平台通过调用下面的代码生成充值地址，并将地址、密码（需要加密存储）写入数据库或者其它持久化存储中，并在页面上展示给用户。    
    
通过下面几种生成地址方法中的任意一种为UserA生成一个Asch充值账户。    
地址：ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M    
密码：'found knife gather faith wrestle private various fame cover response security predict'，这里只是举例，数据非真实。    
    
##### 3.1.1.1 调用http接口生成地址    
    
```    
curl -k -X GET 'http://192.168.1.100:4096/api/accounts/new'       
    
// JSON返回示例：    
{        
    success: true,    
    secret: "during crush zoo wealth horror left night upset spike iron divert lawn", // 主密码       
    publicKey: "261fa56f389c324fddbe8777dbc0ef3341ee7b75d1ffdc82192265633b90d503", // 公钥        
    privateKey: "67c9523b7622704c4bcfe960cb32d7fa04d3eb94e30e7964d3c6a24a3647a0a3261fa56f389c324fddbe8777dbc0ef3341ee7b75d1ffdc82192265633b90d503", // 私钥        
    address: "ANfXDQUZroMnrQ6vRGR7UXXtbPn3fhEVRJ" // 地址        
}        
```    
    
##### 3.1.1.2 用asch-cli命令行工具批量生成地址    
    
```    
// 用asch-cli命令行工具批量生成钱包地址（含密码、地址、公钥），生成多个地址，加密存到数据库或者其它地方，然后程序直接用.    
// 安装asch-cli工具    
npm install -g asch-cli      
// 批量生成钱包地址    
asch-cli crypto -g    
? Enter number of accounts to generate 1 //这里的1表示生成一个地址，可以填写10、100等数字    
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
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash    
// 上面命令执行完成后再开一个os shell窗口执行下面的命令，安装nodejs 8.x    
nvm install node 8    
    
// 安装依赖库（asch-js、bitcore-mnemonic），在os shell中运行    
npm install asch-js bitcore-mnemonic    
    
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
用户UserA在XCT钱包（比如http://asch.cn）往充值地址转XCT,比如转10 XCT。    
    
#### 3.1.3 交易平台确认用户充值    
交易平台检测每个新的区块，可以每隔10秒检测一次，每次检查时区块高度加1，检查的高度建议持久化存储并增加一个标记位“是否已检查”，这样做的优势：能最快地检测到用户的充值信息并保证充值金额的正确（用户在极短时间内充值多次相同的金额也能保证结果准确）。    
    
下面演示UserA的充值确认过程。    
```    
// 通过区块高度获去检查该区块是否有交易，每个新区块都要检查    
// height=223994，表示最新的区块高度是223994    
curl -k -X GET 'http://192.168.1.100:4097/api/blocks/full?height=223994'    
// 返回结果如下（该json结果保存到变量res中）    
{    
	success: true,  // 接口是否成功被调用    
	block: {    
		id: "322e0f70f1e9de584fcf60fdcd10306691dbcdb7d738db66062c860dc29e3333", // 区块id    
		version: 0,    
		timestamp: 41428170,    
		height: 223994, // 区块高度    
		previousBlock: "20594953fed0d67c87639f0c42050d56b3d1ddc06a72990b916dbd6676288310",    
		numberOfTransactions: 1,    
		totalAmount: 0,    
		totalFee: 10000000, // 该区块中所有交易的手续费之和0.1XAS（xas精度是8）    
		reward: 350000000,    
		payloadLength: 177,    
		payloadHash: "a43f6d3fb54b27c90503cb5d619e63f33cf1e2b7df72354ebbe4d6aab7175145",    
		generatorPublicKey: "238bdc9d75760560d438a86adef6f3126c5cd0f0be43ebbd9a9053f705a30176",    
		generatorId: "15652667420882928094",    
		blockSignature: "ab322a2adf7fe1eb02c746bafa365e7bc0408b5fefc2d8ae3954cfbf0d3a6e74b44ac7b178a7d663610bd30296a7c1cf95af6ee2ed3417fbf5642ccd53e6480a",    
		totalForged: 360000000,    
		transactions: [{    // 该区块包含的所有交易详情列表，每个元素代表一个交易    
			id: "a43f6d3fb54b27c90503cb5d619e63f33cf1e2b7df72354ebbe4d6aab7175145", // 充值交易id    
			height: 223994,    
			blockId: "322e0f70f1e9de584fcf60fdcd10306691dbcdb7d738db66062c860dc29e3333",    
			type: 14, // XCT转账的类型为14    
			timestamp: 41428161, // 充值时间戳，Asch纪元，可以转换为unix timestamp    
			senderPublicKey: "b33b5fc45640cfc414981985bf92eef962c08c53e1a34f90dab039e985bb5fab",    
			requesterPublicKey: "",    
			senderId: "AMzDw5BmZ39we18y7Ty9VW79eL9k7maZPH",  // 发送者地址    
			recipientId: "ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M", // 接收者地址    
			amount: 0,    
			fee: 10000000, // 本条交易转账手续费0.1XAS（目前每笔转账都是固定的0.1XAS手续费）    
			signature: "9e77b3868869af334d539d23feb5d4746db5c842466207f9c22f7e4dee91f4722c8738bc8bcc36abb7365d24dadb26727110ab18673b9bb86a32c29e4b96260c",    
			signSignature: "",    
			signatures: null,    
			args: null,    
			message: "deposit 10 XCT",  // 冲值时的备注信息    
			asset: {    
				uiaTransfer: {    
					transactionId: "a43f6d3fb54b27c90503cb5d619e63f33cf1e2b7df72354ebbe4d6aab7175145", // 充值交易id    
					currency: "CCTime.XCT",  // 资产名字，CCTime.XCT代表XCT    
					amount: "1000000000" // 转账数额=真实数额10*XCT精度8，这里是10 XCT    
				}    
			}    
		}]    
	}    
}    
    
// 如果上面的res.block.numberOfTransactions == 0则直接跳过该区块，否则循环遍历的res.block.transactions交易详情数组得到每条交易记录trs.    
// 如果(trs.type == 14 and trs.recipientId在'交易平台的充值地址列表'中 and trs.asset.uiaTransfer.currency == 'CCTime.XCT')则代表该交易为XCT的冲值记录。此时前端页面就要展示该充值记录并将该记录（充值id、平台的充值地址、数量、确认数、发送时间、充值状态、交易id）写入到本地数据库中。    
    
// 充值状态是由确认数决定的，具体是几，由平台自己定，如果入库时确认数未满足平台标准，则充值状态是“未确认”，否则就是“已确认”。（目前Asch网络认为6个确认就是安全的，交易平台可适当增大该值。）    
// 每隔2分钟（交易平台可以自定义该时间，时间越短用户体验越好）对本地数据库中所有的“未确认”充值记录进行再次确认，根据数据库中的“交易id”利用下面的接口去检查交易详情    
curl -k -X GET 'http://192.168.1.100:4097/api/transactions/get?id=a43f6d3fb54b27c90503cb5d619e63f33cf1e2b7df72354ebbe4d6aab7175145'       
{    
	success: true,    
	transaction: {    
		id: "a43f6d3fb54b27c90503cb5d619e63f33cf1e2b7df72354ebbe4d6aab7175145",    
		height: "223994",    
		blockId: "322e0f70f1e9de584fcf60fdcd10306691dbcdb7d738db66062c860dc29e3333",    
		type: 14,    
		timestamp: 41428161,    
		senderPublicKey: "b33b5fc45640cfc414981985bf92eef962c08c53e1a34f90dab039e985bb5fab",    
		senderId: "AMzDw5BmZ39we18y7Ty9VW79eL9k7maZPH",    
		recipientId: "ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M",    
		amount: 0,    
		fee: 10000000,    
		signature: "9e77b3868869af334d539d23feb5d4746db5c842466207f9c22f7e4dee91f4722c8738bc8bcc36abb7365d24dadb26727110ab18673b9bb86a32c29e4b96260c",    
		signSignature: "",    
		signatures: null,    
		confirmations: "326",   // 区块确认数    
		args: null,    
		message: "deposit 10 XCT",    
		asset: {    
			    
		}    
	}    
}    
// 当"confirmations"达到平台要求后，更改数据库中的“充值状态”为“已确认”并显示在前端页面，最后用户UserA在交易平台的XCT余额做相应的增加。    
    
```    
至此用户UserA完成了充值流程。    
    
#### 3.1.4 交易平台将用户充值的XCT转到一个总账户中    
充值完成后，交易平台再将这些分散的用户XCT转账到交易平台自己的总账户中（请一定保存好密码）。    
总账户：可以做为平台的XCT冷钱包或者热钱包供用户提现。    
举例，平台XCT总账户地址：A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5    
    
Asch提供了下面2种方式进行XCT转账操作，请选择其中一种即可。    
    
##### 3.1.4.1 通过不安全的api进行XCT转账    
这种方式是把密钥放到请求里面并且明文发送给服务器进行交易的生成和签名，不安全，不建议使用。如果非要使用这种方式，务必在局域网内搭建一台Asch节点服务器，用来提供API服务。    
    
- 汇总前需要确定UserA充值地址上有多少个XCT    
```    
curl -X GET http://192.168.1.100:4097/api/uia/balances/ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M/CCTime.XCT    
// 返回结果如下    
{    
	success: true,    
	balance: {    
		currency: "CCTime.XCT",    
		balance: "990900000000", // 该值=余额*100000000    
		maximum: "10000000000000000",    
		precision: 8, // XCT的精度    
		quantity: "20000000000000000",    
		writeoff: 0,    
		allowWriteoff: 0,    
		allowWhitelist: 0,    
		allowBlacklist: 0,    
		maximumShow: "100000000",    
		quantityShow: "200000000",    
		balanceShow: "9909" // 该账户余额为9909个XCT，平台可以设定当该值大于某个值时才会进行向总钱包汇总    
	}    
}    
```    
    
- 确认UserA充值地址上是否有XAS（XCT每次转账都需要消耗0.1XAS）    
```    
curl -X GET 'http://192.168.1.100:4097/api/accounts/getBalance?address=ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M'    
// 返回结果    
{    
	success: true,    
	balance: 0, // 0个XAS    
	unconfirmedBalance: 0    
}    
```    
    
- 如果UserA充值地址上的XAS余额小于0.1，则需要给该地址转一笔小额的XAS做XCT转账时的手续费    
```    
// 'object betray start purse camp remove lucky cry soccer middle harvest clerk'为有XAS余额的账户    
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"object betray start purse camp remove lucky cry soccer middle harvest clerk","amount":100000000,"recipientId":"ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M"}' 'http://192.168.1.100:4097/api/transactions'  && echo // 给用户充值地址转1XAS做为后面XCT转账时的手续费，该操作本身也消耗0.1XAS手续费    
// 返回结果    
{    
	"success": true,    
	"transactionId": "0c8d1c0174ceb563d074a742934920b07fb8a29b5ff1d8450d0885c300dedd53"    
}    
```    
    
- 将UserA充值地址上的全部XCT转入到平台总账户中    
```    
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"found knife gather faith wrestle private various fame cover response security predict","amount":"99090000000","recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","currency":"CCTime.XCT"}' 'http://192.168.1.100:4097/api/uia/transfers' && echo   // 99090000000表示9909 XCT     
// 返回结果如下    
{    
	"success": true,    // 转账状态，成功    
	"transactionId": "ab0f548a3a3b56d437187d1c26a25a3d3c5411821955301ab44dcd8511f5da64" // 交易id    
}    
    
```    
    
##### 3.1.4.2 通过安全的api进行XCT转账（本地签名）    
建议使用这种安全的方法进行转账，此种方法是在本地生成交易信息并签名，然后广播到区块链网络中，这里对Asch Server没有安全性要求。    
    
- 只有XAS转账和XCT转账和上面章节不一样，其它查询操作一致。    
    
- 如果UserA充值地址上的XAS余额小于0.1，则需要给该地址转一笔小额的XAS做XCT转账时的手续费    
```    
// asch-js安装参考《3.1.1.3 nodejs代码生成地址》章节    
var asch = require('asch-js');       
var targetAddress = "ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M";      
var amount = 1*100000000;   //1 XAS    
var password = 'object betray start purse camp remove lucky cry soccer middle harvest clerk';    
var message = ''; // 转账备注    
// 生成交易信息并签名    
var transaction = asch.transaction.createTransaction(targetAddress, amount, message, password);           
JSON.stringify({transaction:transaction})    
'{"transaction":{"type":0,"amount":100000000,"fee":10000000,"recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","timestamp":5333378,"asset":{},"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","signature":"2d47810b7d9964c5c4d330a53d1382769e5092b3a53639853f702cf4a382aafcff8ef8663c0f6856a23f41c249944f0c3cfac0744847268853a62af5dd8fc90a","signSignature":"dfa9b807fff362d581170b41c56a2b8bd723c48d1f100f2856d794408723e8973016d75aeff4705e6837dcdb745aafb41aa10a9f1ff8a77d128ba3d712e90907","id":"a95c3a5bda15f3fd38295950268c234e922aae97cf803dd8c38c73a6ccf7c561"}}'    
    
// 将上面生成的转账操作的交易数据通过post提交给asch server    
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":0,"amount":100000000,"fee":10000000,"recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","timestamp":5333378,"asset":{},"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","signature":"2d47810b7d9964c5c4d330a53d1382769e5092b3a53639853f702cf4a382aafcff8ef8663c0f6856a23f41c249944f0c3cfac0744847268853a62af5dd8fc90a","signSignature":"dfa9b807fff362d581170b41c56a2b8bd723c48d1f100f2856d794408723e8973016d75aeff4705e6837dcdb745aafb41aa10a9f1ff8a77d128ba3d712e90907","id":"a95c3a5bda15f3fd38295950268c234e922aae97cf803dd8c38c73a6ccf7c561"}}' http://192.168.1.100:4096/peer/transactions    
// 返回结果    
{    
    "success":true,  //转账成功    
    "transactionId":"a95c3a5bda15f3fd38295950268c234e922aae97cf803dd8c38c73a6ccf7c561"    
}           
```    
    
- 将UserA充值地址上的全部XCT转入到平台总账户中    
```    
var asch = require('asch-js');     
var currency = 'CCTime.XCT'; // 资产名    
// 本次转账数（9909）=真实数量（9909）*10**精度（8）    
var amount = String(9909 * 100000000);    
var recipientId = 'A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5'; // 接收地址，即总账户地址    
var message = 'memo'; // 转账备注    
var secret = 'found knife gather faith wrestle private various fame cover response security predict';    
var trs = asch.uia.createTransfer(currency, amount, recipientId, message, secret);    
    
JSON.stringify({transaction:trs})    
'{"transaction":{"type":14,"amount":0,"fee":10000000,"recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","senderPublicKey":"2856bdb3ed4c9b34fd2bba277ffd063a00f703113224c88c076c0c58310dbec4","timestamp":42795778,"message":"memo","asset":{"uiaTransfer":{"currency":"CCTime.XCT","amount":"990900000000"}},"signature":"a09e2cd425e32656c8a1411ffde48dd53917f65af562dd235e47bca6e151ed8d9742ed1e799a5a2ed26dfce0761ff518ced691953a3f150ecab5bfa740a1590c","id":"5c61ce9c88c7a957d6dd4e2585c7382d0bdd9a4f889976aefae172f5211610fb"}}'    
    
// 广播该交易    
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":14,"amount":0,"fee":10000000,"recipientId":"A7RD9YP37iUnYZ1SFnmAp6ySHUx3msC4r5","senderPublicKey":"2856bdb3ed4c9b34fd2bba277ffd063a00f703113224c88c076c0c58310dbec4","timestamp":42795778,"message":"memo","asset":{"uiaTransfer":{"currency":"CCTime.XCT","amount":"990900000000"}},"signature":"a09e2cd425e32656c8a1411ffde48dd53917f65af562dd235e47bca6e151ed8d9742ed1e799a5a2ed26dfce0761ff518ced691953a3f150ecab5bfa740a1590c","id":"5c61ce9c88c7a957d6dd4e2585c7382d0bdd9a4f889976aefae172f5211610fb"}}' 'http://localhost:4096/peer/transactions' && echo    
// 返回结果    
{"success":true}            
```    
    
    
    
### 3.2 方案2-转账备注方式    
所有的用户共用一个XCT充值地址，充值时填写备注信息为自己在交易平台的用户名或者id，这样就不需要生成多个地址了，但是用户填写错备注的话处理起来较为麻烦。    
该种方式，大体流程和方案1一致，这里不再赘述。    
    
    
## 4 提币XCT    
提现操作就是转账，把平台的币转给用户。    
### 4.1 用户绑定提币地址    
用户登陆Asch提现页面，参考其它代币，让用户可以自行绑定提现地址。    
XCT地址符合base58规则、以大写字母A开头、地址长度至少是24个字母数字的混合体。    
### 4.2 用户进行提币    
输入提币数量，手机短信验证，点击确认。    
    
### 4.2 平台执行提币操作    
参考“3.1.4”章节，有2种转账方式，请自行决定用哪一种。接口会返回，提币的交易id，记录到数据库中并展示到前端页面，更新提币状态为“成功”。    
### 4.3 用户确认    
用户自行确认提币结果，如有疑问，可以拿着交易id来平台这里进行查询验证。
