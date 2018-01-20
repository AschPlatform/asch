Table of Contents
=================

   * [ASCH HTTP API文档](#asch-http-api文档)
      * [<strong>1 API使用说明</strong>](#1-api使用说明)
         * [<strong>1.1 请求过程说明</strong>](#11-请求过程说明)
      * [<strong>2 接口</strong>](#2-接口)
         * [<strong>2.1 账户accounts</strong>](#21-账户accounts)
            * [<strong>2.1.1 登录</strong>](#211-登录)
               * [<strong>2.1.1.1 本地加密后再登陆（推荐使用）</strong>](#2111-本地加密后再登陆推荐使用)
               * [<strong>2.1.1.2 本地不加密直接登陆</strong>](#2112-本地不加密直接登陆)
            * [<strong>2.1.2 根据地址获取账户信息</strong>](#212-根据地址获取账户信息)
            * [<strong>2.1.3 获取账户余额</strong>](#213-获取账户余额)
            * [<strong>2.1.4 根据地址获取账户公钥</strong>](#214-根据地址获取账户公钥)
            * [<strong>2.1.5 生成公钥</strong>](#215-生成公钥)
            * [<strong>2.1.6 根据地址获取其投票列表</strong>](#216-根据地址获取其投票列表)
            * [<strong>2.1.7 获取受托人手续费设置</strong>](#217-获取受托人手续费设置)
            * [<strong>2.1.8 给受托人投票</strong>](#218-给受托人投票)
            * [<strong>2.1.9 生成新账户</strong>](#219-生成新账户)
            * [<strong>2.1.10 获取账户排行榜前100名</strong>](#2110-获取账户排行榜前100名)
            * [<strong>2.1.11 获取当前链上账户总个数</strong>](#2111-获取当前链上账户总个数)
         * [<strong>2.2 交易transactions</strong>](#22-交易transactions)
            * [<strong>2.2.1 获取交易信息</strong>](#221-获取交易信息)
            * [<strong>2.2.2 根据交易id查看交易详情</strong>](#222-根据交易id查看交易详情)
            * [<strong>2.2.3 根据未确认交易id查看详情</strong>](#223-根据未确认交易id查看详情)
            * [<strong>2.2.4 获取[全网所有]未确认的交易详情</strong>](#224-获取全网所有未确认的交易详情)
            * [<strong>2.2.5 创建交易并广播</strong>](#225-创建交易并广播)
         * [<strong>2.3 区块blocks</strong>](#23-区块blocks)
            * [<strong>2.3.1 获取指定区块的详情</strong>](#231-获取指定区块的详情)
            * [<strong>2.3.2 获取区块数据</strong>](#232-获取区块数据)
            * [<strong>2.3.3 获取区块链高度</strong>](#233-获取区块链高度)
            * [<strong>2.3.4 获取普通转账手续费</strong>](#234-获取普通转账手续费)
            * [<strong>2.3.5 获取里程碑</strong>](#235-获取里程碑)
            * [<strong>2.3.6 查看单个区块奖励</strong>](#236-查看单个区块奖励)
            * [<strong>2.3.7 获取XAS当前供应值</strong>](#237-获取xas当前供应值)
            * [<strong>2.3.8 区块链状态</strong>](#238-区块链状态)
            * [<strong>2.3.9 获取指定区块的交易信息</strong>](#239-获取指定区块的交易信息)
         * [<strong>2.4 受托人delegates</strong>](#24-受托人delegates)
            * [<strong>2.4.1 获取受托人总个数</strong>](#241-获取受托人总个数)
            * [<strong>2.4.2 根据受托人公钥查看哪些人为其投了票</strong>](#242-根据受托人公钥查看哪些人为其投了票)
            * [<strong>2.4.3 根据公钥或者用户名获取受托人详情</strong>](#243-根据公钥或者用户名获取受托人详情)
            * [<strong>2.4.4 获取受托人列表</strong>](#244-获取受托人列表)
            * [<strong>2.4.5 获取受托人设置的转账费</strong>](#245-获取受托人设置的转账费)
            * [<strong>2.4.6 根据公钥查看其锻造情况</strong>](#246-根据公钥查看其锻造情况)
            * [<strong>2.4.7 注册受托人</strong>](#247-注册受托人)
            * [<strong>2.4.8 受托人开启锻造</strong>](#248-受托人开启锻造)
            * [<strong>2.4.9 受托人关闭锻造</strong>](#249-受托人关闭锻造)
            * [<strong>2.4.10 受托人锻造状态查看</strong>](#2410-受托人锻造状态查看)
         * [<strong>2.5 节点peers</strong>](#25-节点peers)
            * [<strong>2.5.1 获取全网节点信息</strong>](#251-获取全网节点信息)
            * [<strong>2.5.2 获取本节点版本号等信息</strong>](#252-获取本节点版本号等信息)
            * [<strong>2.5.3 获取指定ip节点信息</strong>](#253-获取指定ip节点信息)
         * [<strong>2.6 同步和加载</strong>](#26-同步和加载)
            * [<strong>2.6.1 查看本地区块链加载状态</strong>](#261-查看本地区块链加载状态)
            * [<strong>2.6.2 查看区块同步信息</strong>](#262-查看区块同步信息)
         * [<strong>2.7 二级密码signatures</strong>](#27-二级密码signatures)
            * [<strong>2.7.1 设置二级密码</strong>](#271-设置二级密码)
            * [<strong>2.7.2 获取二级密码设置手续费</strong>](#272-获取二级密码设置手续费)
         * [<strong>2.8 多重签名multisignatures</strong>](#28-多重签名multisignatures)
            * [<strong>2.8.1 设置普通账户为多重签名账户</strong>](#281-设置普通账户为多重签名账户)
            * [<strong>2.8.2 根据公钥获取挂起的多重签名交易详情</strong>](#282-根据公钥获取挂起的多重签名交易详情)
            * [<strong>2.8.3 非交易发起人对交易进行多重签名</strong>](#283-非交易发起人对交易进行多重签名)
            * [<strong>2.8.4 获取多重签名账户信息</strong>](#284-获取多重签名账户信息)
         * [<strong>2.9 点对点传输tansport[安全的api]</strong>](#29-点对点传输tansport安全的api)
            * [<strong>2.9.1 说明</strong>](#291-说明)
            * [<strong>2.9.2 普通交易</strong>](#292-普通交易)
               * [<strong>2.9.2.1 设置二级密码</strong>](#2921-设置二级密码)
               * [<strong>2.9.2.2 转账</strong>](#2922-转账)
               * [<strong>2.9.2.3 注册受托人</strong>](#2923-注册受托人)
               * [<strong>2.9.2.4 投票 &amp; 取消投票</strong>](#2924-投票--取消投票)
               * [<strong>2.9.2.5 账户锁仓</strong>](#2925-账户锁仓)
            * [<strong>2.9.3 UIA相关交易</strong>](#293-uia相关交易)
               * [<strong>2.9.3.1 注册资产发行商</strong>](#2931-注册资产发行商)
               * [<strong>2.9.3.2 注册资产</strong>](#2932-注册资产)
               * [<strong>2.9.3.3 资产设置acl模式</strong>](#2933-资产设置acl模式)
               * [<strong>2.9.3.4 更新访问控制列表（acl）</strong>](#2934-更新访问控制列表acl)
               * [<strong>2.9.3.5 资产发行</strong>](#2935-资产发行)
               * [<strong>2.9.3.6 资产转账</strong>](#2936-资产转账)
               * [<strong>2.9.3.7 资产注销</strong>](#2937-资产注销)
            * [<strong>2.9.4 其它内部通讯安全接口</strong>](#294-其它内部通讯安全接口)
         * [<strong>2.10 用户自定义资产uia</strong>](#210-用户自定义资产uia)
            * [<strong>2.10.1 获取全网所有发行商</strong>](#2101-获取全网所有发行商)
            * [<strong>2.10.2 查询指定发行商的信息</strong>](#2102-查询指定发行商的信息)
            * [<strong>2.10.3 查看指定发行商的资产</strong>](#2103-查看指定发行商的资产)
            * [<strong>2.10.4 获取全网所有资产信息</strong>](#2104-获取全网所有资产信息)
            * [<strong>2.10.5 获取指定资产信息</strong>](#2105-获取指定资产信息)
            * [<strong>2.10.6 获取指定资产的访问控制列表（acl）</strong>](#2106-获取指定资产的访问控制列表acl)
            * [<strong>2.10.7 获取指定账户所有uia的余额</strong>](#2107-获取指定账户所有uia的余额)
            * [<strong>2.10.8 获取指定账户所有资产相关操作记录</strong>](#2108-获取指定账户所有资产相关操作记录)
            * [<strong>2.10.9 获取指定账户指定资产的余额</strong>](#2109-获取指定账户指定资产的余额)
            * [<strong>2.10.10 获取指定账户指定资产转账记录</strong>](#21010-获取指定账户指定资产转账记录)
            * [<strong>2.10.11 获取指定资产转账记录</strong>](#21011-获取指定资产转账记录)
            * [<strong>2.10.12 资产创建相关</strong>](#21012-资产创建相关)
               * [<strong>2.10.12.1 注册资产发行商</strong>](#210121-注册资产发行商)
               * [<strong>2.10.12.2 注册资产</strong>](#210122-注册资产)
               * [<strong>2.10.12.3 更新资产访问控制列表(acl)</strong>](#210123-更新资产访问控制列表acl)
               * [<strong>2.10.12.4 资产发行</strong>](#210124-资产发行)
               * [<strong>2.10.12.5 资产转账</strong>](#210125-资产转账)
               * [<strong>2.10.12.6 更新黑白名单</strong>](#210126-更新黑白名单)
         * [<strong>2.11 存储storages</strong>](#211-存储storages)
            * [<strong>2.11.1 上传数据</strong>](#2111-上传数据)
               * [<strong>2.11.1.1 上传数据(直接上传)</strong>](#21111-上传数据直接上传)
               * [<strong>2.11.1.2 上传数据(签名后再上传)</strong>](#21112-上传数据签名后再上传)
            * [<strong>2.11.2 根据交易id查询存储的数据-1</strong>](#2112-根据交易id查询存储的数据-1)
            * [<strong>2.11.3 根据交易id查询存储的数据-2</strong>](#2113-根据交易id查询存储的数据-2)
      * [<strong>附录1：asch-js安装</strong>](#附录1asch-js安装)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)


# ASCH HTTP API文档


 
## **1 API使用说明**   
### **1.1 请求过程说明**   
1.1 构造请求数据，用户数据按照Asch提供的接口规则，通过程序生成签名，生成请求数据集合；       
1.2 发送请求数据，把构造完成的数据集合通过POST/GET等提交的方式传递给Asch；       
1.3 Asch对请求数据进行处理，服务器在接收到请求后，会首先进行安全校验，验证通过后便会处理该次发送过来的请求；       
1.4 返回响应结果数据，Asch把响应结果以JSON的格式反馈给用户，每个响应都包含success字段，表示请求是否成功，成功为true, 失败为false。 如果失败，则还会包含一个error字段，表示错误原因；       
1.5 对获取的返回结果数据进行处理；       
   
---   
   
## **2 接口**   
### **2.1 账户accounts**   
   
#### **2.1.1 登录**   
##### **2.1.1.1 本地加密后再登陆（推荐使用）**   
接口地址：/api/accounts/open2/   
请求方式：post   
支持格式：json   
接口备注：根据用户密码在本地客户端用js代码生成公钥    

请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |asch账户公钥      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否登陆成功      |    
|account|json   |账户信息          |    
请求示例：   
  
```js
var secret = 'Asch账户密码'  //在浏览器内存中保留
var AschJS = require('asch-js');  //asch-js具体安装方法见附录 
var publicKey = AschJS.crypto.getKeys(secret).publicKey;  //根据密码生成公钥 
// var address = AschJS.crypto.getAddress(publicKey);   //根据公钥生成地址

// 将上面生成的数据通过post提交到asch server   
curl -X POST -H "Content-Type: application/json" -k -d '{"publicKey":"bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"}' http://45.32.248.33:4096/api/accounts/open2/   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"account": {   
		"address": "16723473400748954103",  //asch地址   
		"unconfirmedBalance": 19480000000,  //未确认和已确认的余额之和，该值大于等于balance   
		"balance": 19480000000, //余额   
		"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",    //公钥   
		"unconfirmedSignature": false,   
		"secondSignature": true,    //二级签名   
		"secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",  //二级密码公钥   
		"multisignatures": [],    
		"u_multisignatures": [],   
		"lockHeight: ": 0 // 锁仓高度    
	},   
	"latestBlock": {   
		"height": 114480,   //当前节点最新区块高度     
		"timestamp": 4471890   
	},   
	"version": {   
		"version": "1.0.0",   //当前节点版本号    
		"build": "12:11:11 16/08/2016", //构建日期   
		"net": "testnet"    //区块链类型，是主链还是测试链   
	}   
}   
```   
   
##### **2.1.1.2 本地不加密直接登陆**   
接口地址：/api/accounts/open/   
请求方式：post   
支持格式：json   
接口备注：将密码传入到server端，根据生成的地址去查询账户信息。不推荐在公网坏境使用！ 
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否登陆成功      |    
|account|json   |账户信息          |    
   
请求示例：   
```bash   
curl -X POST -H "Content-Type: application/json" -k -d '{"secret":"fault still attack alley expand music basket purse later educate follow ride"}' http://45.32.248.33:4096/api/accounts/open/   
```   
   
JSON返回示例：   
```js   
{   
    "success": true,    
    "account": {   
        "address": "16723473400748954103",    
        "unconfirmedBalance": 19480000000,    
        "balance": 19480000000,    
        "publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",    
        "unconfirmedSignature": false,    
        "secondSignature": true,    
        "secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",    
        "multisignatures": [ ],    
        "u_multisignatures": [ ]   
    }   
}   
```   
#### **2.1.2 根据地址获取账户信息**   
接口地址：/api/accounts   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address |string |Y    |用户地址,最小长度：1      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|account|json  |账户信息      |    
|latestBlock|json  |该节点最新的区块信息      |    
|version|json  |版本相关信息      |    
   
请求示例：   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/accounts?address=16723473400748954103   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"account": {   
		"address": "16723473400748954103",  //asch地址   
		"unconfirmedBalance": 19480000000,  //未确认和已确认的余额之和，该值大于等于balance   
		"balance": 19480000000, //余额   
		"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",    //公钥   
		"unconfirmedSignature": false,   
		"secondSignature": true,    //二级签名   
		"secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",  //二级密码公钥   
		"multisignatures": [],    
		"u_multisignatures": [],   
		"lockHeight: ": 0 // 锁仓高度    
	},   
	"latestBlock": {   
		"height": 114480,   //当前节点最新区块高度     
		"timestamp": 4471890   
	},   
	"version": {   
		"version": "1.0.0",   //当前节点版本号    
		"build": "12:11:11 16/08/2016", //构建日期   
		"net": "testnet"    //区块链类型，是主链还是测试链   
	}   
}   
```   
#### **2.1.3 获取账户余额**   
接口地址：/api/accounts/getBalance   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address |string |Y    |用户地址,最小长度：1      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|balance|integer  |余额      |    
|unconfirmedBalance|integer|未确认和已确认的余额之和，该值大于等于balance|   
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/getBalance?address=14636456069025293113'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"balance": 5281328514990,   
	"unconfirmedBalance": 5281328514990   
}   
```   
   
#### **2.1.4 根据地址获取账户公钥**   
接口地址：/api/accounts/getPublickey   
请求方式：get   
支持格式：urlencoded   
请求参数说明：只有给别人转过账，db中才会存取公钥，否则是查不到的。btc也是这样

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address |string |Y    |用户地址,最小长度：1      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|publicKey|string  |公钥      |    
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/getPublickey?address=14636456069025293113'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7"   
}   
```   
   
#### **2.1.5 生成公钥**   
接口地址：/api/accounts/generatePublickey   
请求方式：post   
支持格式：json   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|publicKey|string  |公钥      |    
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"fault still attack alley expand music basket purse later educate follow ride"}' 'http://45.32.248.33:4096/api/accounts/generatePublickey'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"   
}   
```   
   
#### **2.1.6 根据地址获取其投票列表**   
接口地址：/api/accounts/delegates   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address |string |Y    |投票人地址      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|delegates|Array  |已投票的受托人详情数组      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/delegates?address=14636456069025293113'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"delegates": [{   
		"username": "wgl_002",   
		"address": "14636456069025293113",   
		"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",   
		"vote": 9901985415600500,   
		"producedblocks": 1373,   
		"missedblocks": 6,   
		"rate": 1,   
		"approval": "98.54",   
		"productivity": "99.56"   
	},   
	{   
		"username": "wgl_003",   
		"address": "9961157415582672274",   
		"publicKey": "c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2",   
		"vote": 9891995435600500,   
		"producedblocks": 1371,   
		"missedblocks": 8,   
		"rate": 2,   
		"approval": "98.44",   
		"productivity": "99.41"   
	},   
	{   
		"username": "wgl_001",   
		"address": "1869971419039689816",   
		"publicKey": "c547df2dde6cbb4508aabcb5970d8f9132e5a1d1c422632da6bc20bf1df165b8",   
		"vote": 32401577128413,   
		"producedblocks": 969,   
		"missedblocks": 8,   
		"rate": 102,   
		"approval": "0.32",   
		"productivity": 0   
	}]   
}   
```   
   
#### **2.1.7 获取受托人手续费设置**   
接口地址：/api/accounts/delegates/fee   
请求方式：get   
支持格式：无   
请求参数说明：无  

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|fee|integer  |手续费      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/delegates/fee  
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"fee": 100000000  // 0.1 XAS   
}   
```   
   
   
#### **2.1.8 给受托人投票**   
接口地址：/api/accounts/delegates   
请求方式：put   
支持格式：json   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|publicKey|string  |N|公钥      |    
|secondSecret|string|N|asch账户二级密码，最小长度：1，最大长度：100|   
|delegates|Array|受托人公钥数组，每个公钥前需要加上+或者-号，代表增加/取消对其的投票|   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transaction|json  |投票交易详情      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"call scissors pupil water friend timber spend brand vote obey corn size","publicKey":"3ec1c9ec08c0512641deba37c0e95a0fe5fc3bdf58424009f594d7d6a4e28a2a","delegates":["+fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575"]}' 'http://45.32.248.33:4096/api/accounts/delegates'     
```   
   
JSON返回示例：   
```js   
 {
	"success": true,
	"transaction": {
		"type": 3,  //投票的交易类型为3
		"amount": 0,
		"senderPublicKey": "3ec1c9ec08c0512641deba37c0e95a0fe5fc3bdf58424009f594d7d6a4e28a2a",
		"requesterPublicKey": null,
		"timestamp": 5056064,
		"asset": {
			"vote": {
				"votes": ["+fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575"]
			}
		},
		"recipientId": null,
		"signature": "0bff58c7311fc59b3c8b3ffc236bbfece9850c334fb0c292ab087f78cf9a6c0f4d3e541c501887a2c2ec46294c777e8f7bf7dea9cb7c9a175fdec641bb684f08",
		"id": "5630629337798595849",
		"fee": 10000000,
		"senderId": "15238461869262180695"
	}
}  
```   


#### **2.1.9 生成新账户**   
接口地址：/api/accounts/new   
请求方式：get   
支持格式：无   
请求参数：无   

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|secret|string  |密码      |    
|publicKey|string  |公钥      |    
|privateKey|string  |私钥      |    
|address|string  |地址      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/new'   
```   
   
JSON返回示例：   
```js  
{    
	success: true,
	secret: "during crush zoo wealth horror left night upset spike iron divert lawn", // 密码   
	publicKey: "261fa56f389c324fddbe8777dbc0ef3341ee7b75d1ffdc82192265633b90d503", // 公钥    
	privateKey: "67c9523b7622704c4bcfe960cb32d7fa04d3eb94e30e7964d3c6a24a3647a0a3261fa56f389c324fddbe8777dbc0ef3341ee7b75d1ffdc82192265633b90d503", // 私钥    
	address: "ANfXDQUZroMnrQ6vRGR7UXXtbPn3fhEVRJ" // 地址    
}    
```    


#### **2.1.10 获取账户排行榜前100名**   
接口地址：/api/accounts/top   
请求方式：get   
支持格式：无   
请求参数说明：如果不加请求参数则返回持币量前100名账户信息  

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|limit |integer |N    |限制结果集个数，最小值：0,最大值：100   |  
|offset|integer  |N      |偏移量，最小值0  |  

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|accounts|json  |账户信息元组，每个元素包含地址、余额、公钥      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/top?limit=5&offset=0'  //返回前5名账户信息
```   
   
JSON返回示例：   
```js   
{
	"success": true,
	"accounts": [{
		"address": "355198157736313687",
		"balance": 4400099900000000,        //44000999 XAS
		"publicKey": "0b8e120db026d58cbf9d3f392f88eefe3a82a0a3023298b9466d7ed64ff05881"
	},
	{
		"address": "3196144307608101364",
		"balance": 3750000020000000,
		"publicKey": "988eb82a603dd033f94a4f3b6f9f9ef4a7d3d066607c433e5255d50ea7270720"
	},
	{
		"address": "9248745407080572308",
		"balance": 988703397029757,
		"publicKey": "02cedc56da08099532e312c5e563e2859bc5b93cc594eb3e5d350f368d681988"
	},
	{
		"address": "15745540293890213312",
		"balance": 498186229718623,
		"publicKey": "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3"
	},
	{
		"address": "8812460086240160222",
		"balance": 100704426831866,
		"publicKey": "0af92cc32f54d50dd83c4f7de14e71223a57843a40e993bc0813454aa9270053"
	}
}    
```   


#### **2.1.11 获取当前链上账户总个数**   
接口地址：/api/accounts/count   
请求方式：get   
支持格式：无   
请求参数：无    

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|count|integer  |当前链上账户总个数     |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/count'    
```   
   
JSON返回示例：   
```js   
{
	success: true,
	count: 105
}
```    
   
   
### **2.2 交易transactions**   
#### **2.2.1 获取交易信息**   
接口地址：/api/transactions   
请求方式：get   
支持格式：urlencoded   
接口备注：如果请求不加参数则会获取全网所有交易   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|and|integer|N|取值范围0和1，默认值0。select查询时下面这些条件都是or的关系，and=1时select是and的关系  | 
|blockId |string |N    |区块id      |   
|limit |integer |N    |限制结果集个数，最小值：0,最大值：100   |   
|type|integer  |N      |交易类型,0:普通转账，1:设置二级密码，2:注册受托人，3:投票，4:多重签名，5:DAPP，6:IN_TRANSFER，7:OUT_TRANSFER      |   
|orderBy|string  |N      |根据表中字段排序，senderPublicKey:desc  |   
|offset|integer  |N      |偏移量，最小值0  |   
|senderPublicKey|string|N|发送者公钥|   
|ownerPublicKey|string|N||   
 ownerAddress|string|N||   
|senderId|string|N|发送者地址|   
|recipientId|string|N|接收者地址,最小长度：1|   
|amount|integer|N|金额|   
|fee|integer|N|手续费|   
|uia|integer|N|是否uia，0：不是，1：是|   
|currency|string|N|资产名|   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transactions|列表  |多个交易详情json构成的列表      |    
|count|int|获取到的交易总个数|   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions?recipientId=16723473400748954103&orderBy=t_timestamp:desc&limit=3'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactions": [{   
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
		"confirmations": "31802",   
		"asset": {   
			   
		}   
	},   
	{   
		"id": "7000452951235123088",   
		"height": "105473",   
		"blockId": "11877628176330539727",   
		"type": 0,   
		"timestamp": 4380147,   
		"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575",   
		"senderId": "16358246403719868041",   
		"recipientId": "16723473400748954103",   
		"amount": 10000000000,   
		"fee": 10000000,   
		"signature": "dc84044d4f6b4779eecc3a986b6507e458cc5964f601ebeb4d3b68a96129813f4940e14de950526dd685ca1328b6e477e6c57e95aeac45859a2ea62a587d0204",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "32280",   
		"asset": {   
			   
		}   
	},   
	{   
		"id": "14093929199102906687",   
		"height": "105460",   
		"blockId": "2237504897174225512",   
		"type": 0,   
		"timestamp": 4380024,   
		"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575",   
		"senderId": "16358246403719868041",   
		"recipientId": "16723473400748954103",   
		"amount": 10000000000,   
		"fee": 10000000,   
		"signature": "73ceddc3cbe5103fbdd9eee12f7e4d9a125a3bcf2e7cd04282b7329719735aeb36936762f17d842fb14813fa8f857b8144040e5117dffcfc7e2ae88e36440a0f",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "32293",   
		"asset": {   
			   
		}   
	}],   
	"count": 3   
}   
```   
#### **2.2.2 根据交易id查看交易详情**   
接口地址：/api/transactions/get   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|Id |string |Y    |交易id      |   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transactions|json  |交易详情      |    
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions/get?id=14093929199102906687'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transaction": {   
		"id": "14093929199102906687", // 交易id  
		"height": "105460",// 该交易所在区块高度   
		"blockId": "2237504897174225512",// 所在区块id   
		"type": 0,// 交易类型，0：普通XAS转账   
		"timestamp": 4380024,// 距离阿希创世块的timestamp   
		"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575", // 发送者公钥   
		"senderId": "16358246403719868041",// 发送者地址   
		"recipientId": "16723473400748954103",// 接收者地址   
		"amount": 10000000000,// 交易额，100XAS   
		"fee": 10000000, // 手续费0.1XAS  
		"signature": "73ceddc3cbe5103fbdd9eee12f7e4d9a125a3bcf2e7cd04282b7329719735aeb36936762f17d842fb14813fa8f857b8144040e5117dffcfc7e2ae88e36440a0f",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "34268",// 确认数   
		"asset": {   
		}   
	}   
}   
```   
   
#### **2.2.3 根据未确认交易id查看详情**   
接口地址：/api/transactions/unconfirmed/get   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|id|string |Y    |未确认交易id      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transaction|json  |未确认交易详情      |   
   
   
请求示例：   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/transactions/unconfirmed/get?id=7557072430673853692  // 正常情况，该未确认交易存在时间极短0~10秒   
```   
   
JSON返回示例：   
```js   
{
	"success": true,
	"transaction": {
		"type": 0,
		"amount": 10000,
		"senderPublicKey": "3ec1c9ec08c0512641deba37c0e95a0fe5fc3bdf58424009f594d7d6a4e28a2a",
		"requesterPublicKey": null,
		"timestamp": 5082322,
		"asset": {
			
		},
		"recipientId": "16723473400748954103",
		"signature": "3a97f8d63509ef964bda3d816366b8e9e2d9b5d4604a660e7cbeefe210cb910f5de9a51bece06c32d010f55502c62f0f59b8224e1c141731ddfee27206a88d02",
		"id": "7557072430673853692",
		"fee": 10000000,
		"senderId": "15238461869262180695"
	}
}
```   
   
   
#### **2.2.4 获取[全网所有]未确认的交易详情**   
接口地址：/api/transactions/unconfirmed   
请求方式：get   
支持格式：urlencoded   
接口说明：如果不加参数，则会获取全网所有未确认交易
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|senderPublicKey |string |N    |发送者公钥      |   
|address |string |N    |地址      |   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transactions|Array  |未确认交易列表      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions/unconfirmed'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactions": []      //全网目前不存在未确认的交易   
}   
```   
   
#### **2.2.5 创建交易并广播**   
接口地址：/api/transactions   
请求方式：PUT   
支持格式：json   
 
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|amount|integer|Y|金额，最小值：1，最大值：10000000000000000|   
|recipientId|string|Y|接收者地址,最小长度：1|   
|publicKey|string|N|发送者公钥|   
|secondSecret|string|N|发送者二级密码，最小长度1，最大长度：100|   
|multisigAccountPublicKey|string|N|多重签名账户公钥|   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transactionId|string  |交易id      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","amount":1000000,"recipientId":"16723473400748954103"}' 'http://45.32.248.33:4096/api/transactions'    
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactionId": "16670272591943275531"   
}   
```  
   
### **2.3 区块blocks**   
#### **2.3.1 获取指定区块的详情**   
接口地址：/api/blocks/get   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|id |string |参数3选1    |区块id      |   
|height|string|参数3选1|区块高度|   
|hash|string|参数3选1|区块hash|   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|block|json  |区块详情      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/get?id=6076474715648888747'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"block": {   
		"id": "6076474715648888747",   
		"version": 0,   
		"timestamp": 4734070,   
		"height": 140538,   
		"previousBlock": "16033230167082515105",    //上一个区块id   
		"numberOfTransactions": 0,  //交易数   
		"totalAmount": 0,   //交易额   
		"totalFee": 0,   
		"reward": 350000000,    //奖励   
		"payloadLength": 0,   
		"payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",   
		"generatorPublicKey": "1d352950c8141e1b35daba4a974a604519d7a2ef3a1ec0a503ce2653646aa052",   
		"generatorId": "6656029629904254066",   
		"blockSignature": "a53de66922cdc2f431acd0a474beec7cf7c420a8460b7b7caf84999be7caebb59fb7fbb7166c2c7013dbb431585ea7294722166cb08bf9663abf50b6bd81cd05",   
		"confirmations": "2",   
		"totalForged": 350000000   
	}   
}   
```   
   
#### **2.3.2 获取区块数据**   
接口地址：/api/blocks   
请求方式：get   
支持格式：urlencoded   
接口说明：不加参数则获取全网区块详情   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|limit |integer |N    |限制结果集个数，最小值：0,最大值：100   |   
|orderBy|string  |N      |根据表中字段排序，如height:desc  |   
|offset|integer  |N      |偏移量，最小值0  |   
|generatorPublicKey|string  |N      |区块生成者公钥  |   
|totalAmount|integer  |N       |交易总额，最小值：0，最大值：10000000000000000 |   
|totalFee|integer  |N      |手续费总额，最小值：0，最大值：10000000000000000  |   
|reward|integer  |N      |奖励金额，最小值：0  |   
|previousBlock|string  |N      |上一个区块  |   
|height|integer  |N      |区块高度  |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|blocks|Array  |由区块详情json串构成的数组 |    
|count|integer|区块链高度|   
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks?limit=2&offset=0&orderBy=height:desc'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"blocks": [{   
		"id": "12634047624004615059",   
		"version": 0,   
		"timestamp": 4708080,   
		"height": 137986,   
		"previousBlock": "3498191422350401106",   
		"numberOfTransactions": 0,  // 交易数   
		"totalAmount": 0,   // 金额   
		"totalFee": 0,  // 手续费   
		"reward": 350000000,    // 奖励   
		"payloadLength": 0,   
		"payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",   
		"generatorPublicKey": "44db7bec89ef289d0def257285675ca14f2a947dfd2b70e6b1cff4392ce42ada",   
		"generatorId": "4925169939071346193",   
		"blockSignature": "83a2124e3e8201c1a6099b2ac8ab1c117ad34867978add3a90d41a64df9d2ad8fabc9ec14d27a77cd34c08a6479ef684f247c11b1cbbcb0e9767dffc85838600",   
		"confirmations": "1",   
		"totalForged": 350000000   
	},   
	{   
		"id": "3498191422350401106",   
		"version": 0,   
		"timestamp": 4708070,   
		"height": 137985,   
		"previousBlock": "14078155423801039323",   
		"numberOfTransactions": 0,   
		"totalAmount": 0,   
		"totalFee": 0,   
		"reward": 350000000,   
		"payloadLength": 0,   
		"payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",   
		"generatorPublicKey": "500b1ec025cd64d36008341ed8d2508473ecf559be213ca5f9580620a21a592c",   
		"generatorId": "16006295608945777169",   
		"blockSignature": "a0b5ed6c94b1f33c4d0f017f21a08357061493392b19e34eeedf274b77c751e3f86c92443280de09ea1754d62fe7ef00e02acbdc3bc0c1063cef344bacaa4f07",   
		"confirmations": "2",   
		"totalForged": 350000000   
	}],   
	"count": 137986   
}   
```   
   
#### **2.3.3 获取区块链高度**   
接口地址：/api/blocks/getHeight   
请求方式：get   
支持格式：无   
请求参数说明：无   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|height|integer  |区块链高度      |    
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getheight'    
```   
   
JSON返回示例：   
```js   
{"success":true,"height":140569}   
```   
   
#### **2.3.4 获取普通转账手续费**   
接口地址：/api/blocks/getFee   
请求方式：get   
支持格式：无   
请求参数说明：无   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|fee|integer  |交易手续费      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getfee'   
```   
   
JSON返回示例：   
```js   
{"success":true,"fee":10000000}     //手续费为0.1 XAS   
```   
   
#### **2.3.5 获取里程碑**   
接口地址：/api/blocks/getMilestone   
请求方式：get   
支持格式：无   
请求参数说明：无   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|milestone|integer  |      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getMilestone'    
```   
   
JSON返回示例：   
```js   
{"success":true,"milestone":0}   
```   
   
#### **2.3.6 查看单个区块奖励**   
接口地址：/api/blocks/getReward   
请求方式：get   
支持格式：无   
请求参数说明：无   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|reward|integer  |区块奖励，包含受托人奖励和手续费      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getReward'   
```   
   
JSON返回示例：   
```js   
{"success":true,"reward":350000000} //每个生成一个block奖励3.5 XAS   
```   
   
#### **2.3.7 获取XAS当前供应值**   
接口地址：/api/blocks/getSupply   
请求方式：get   
支持格式：无   
请求参数说明：无   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|supply|integer  |全网XAS个数      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getSupply'   
```   
   
JSON返回示例：   
```js   
{"success":true,"supply":10049222600000000} //当前testnet共有100492226XAS   
```   
   
#### **2.3.8 区块链状态**   
接口地址：/api/blocks/getStatus   
请求方式：get   
支持格式：无   
请求参数说明：无   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|height|integer  |区块链高度      |    
|fee|integer  |交易手续费      |    
|milestone|integer  |      |    
|reward|integer  |区块奖励      |    
|supply|integer  |全网XAS个数      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getStatus'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"height": 140649,   
	"fee": 10000000,   
	"milestone": 0,   
	"reward": 350000000,   
	"supply": 10049227150000000   
}   
```   
   

#### **2.3.9 获取指定区块的交易信息**   
接口地址：/api/blocks/full   
请求方式：get   
支持格式：无   
请求参数说明：无  
 
   
请求参数说明：

|名称	|类型   |必填    |说明              |
|------ |-----  |----   |----           |
|id |string |参数2选1    |区块id      |
|height|string|参数2选1|区块高度|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|block|json  |区块详情，包含交易信息transactions      |   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/full?height=2392'   
```   
   
JSON返回示例：   
```js   
{    
	success: true,    
	block: {    
		id: "99773e6fc4feddc2d876427701ce2b52aabfefc8b54a5a8560ed237acb1c9565",    
		version: 0,    
		timestamp: 39605950,    
		height: 2392,    
		previousBlock: "436ca0351028854792ca63862e01b5285b017dd40bc8748a97c1de034e97817f",    
		numberOfTransactions: 1,    
		totalAmount: 100000000,    
		totalFee: 10000000,    
		reward: 350000000,    
		payloadLength: 117,    
		payloadHash: "07af33c345f733e5224877b290888db2faab26e779e784881fadb086148335f1",    
		generatorPublicKey: "1b36e7183125e3de33a4d778c5a705d4e6180e426b15f4737b18d1e09c150a42",    
		generatorId: "8280768395963849562",    
		blockSignature: "59b292c97e68f8a0fc311c0894e79e1fe23613b2387f42e389e0b5f4aba61847fb13feb8153578b3eb37d6249c13347001cce9c4d06ae521b6c8cefedb829804",    
		totalForged: 360000000,    
		transactions: [{    // 该区块包含的交易信息数组
			id: "07af33c345f733e5224877b290888db2faab26e779e784881fadb086148335f1",    
			height: 2392,    
			blockId: "99773e6fc4feddc2d876427701ce2b52aabfefc8b54a5a8560ed237acb1c9565",    
			type: 0,    
			timestamp: 39605935,    
			senderPublicKey: "8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd",    
			requesterPublicKey: "",    
			senderId: "14762548536863074694",    
			recipientId: "1",    
			amount: 100000000,    
			fee: 10000000,    
			signature: "72b72b3db7eb86436a32bff72f19f89fffc51e10f73ca19536968e70d34c38efd24e96ce43e5d4981a23b07849c9baa20263aeadd9dbbbad233c3efa2fa97100",    
			signSignature: "",    
			signatures: null,    
			args: null,    
			message: "",    
			asset: {    
				    
			}    
		}]    
	}    
}     
``` 
   
   
### **2.4 受托人delegates**   
   
#### **2.4.1 获取受托人总个数**   
接口地址：/api/delegates/count   
请求方式：get   
支持格式：无   
请求参数说明：无   
   
返回参数说明：   
    
|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|count|integer   |受托人总个数      |    
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/count'   
```   
   
JSON返回示例：   
```js   
{    
	"success": true,    
	"count": 234    
}     
```   
   
#### **2.4.2 根据受托人公钥查看哪些人为其投了票**   
接口地址：/api/delegates/voters   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |受托人公钥      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|accounts|Array  |账户json串组成的数组      |    
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/voters?publicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"accounts": [{   
		"address": "2918354313445278349",   
		"publicKey": "4fde4c49f1297d5d3a24b1494204543c4281aff17917ff7ff8ff32da3b4b222f",   
		"balance": 1338227722727,   
		"weight": 0.013316660647014596   
	},   
	{   
		"address": "1523444724068322527",   
		"publicKey": "8a6a61c28dc47541aadf1eecec2175c8f768f2331eea3472b1593bf1aa4e1fb4",   
		"balance": 2109297623765,   
		"weight": 0.020989552213127274   
	},   
	{   
		"address": "14483826354741911727",   
		"publicKey": "5dacb7983095466b9b037690150c3edec0f073815326e33a4744b6d1d50953e2",   
		"balance": 5135815841470,   
		"weight": 0.051106336795243436   
	}   
	}]   
}   
```   
   
#### **2.4.3 根据公钥或者用户名获取受托人详情**   
接口地址： /api/delegates/get   
请求方式：get   
支持格式：urlencoded   
接口备注：通过公钥或者用户名获取受托人信息   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|publickey |string |二选一    |受托人公钥      |   
|username  |string |二选一    |受托人用户名      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|delegate|json  |委托人详情      |    
   
   
请求示例：   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/delegates/get?publicKey=bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9   
curl -k -X GET http://45.32.248.33:4096/api/delegates/get?username=delegate_register   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"delegate": {   
		"username": "delegate_register",   
		"address": "16723473400748954103",   
		"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",   
		"vote": 0,   
		"producedblocks": 0,   
		"missedblocks": 0,   
		"fees": 0,   
		"rewards": 0,   
		"rate": 191,   
		"approval": 0,   
		"productivity": 0,   
		"forged": "0"   
	}   
}   
```   
   
#### **2.4.4 获取受托人列表**   
接口地址：/api/delegates   
请求方式：get   
支持格式：urlencoded   
接口说明：如果不加参数则会返回全网受托人列表   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address |string |N    |受托人地址      |   
|limit|int  |N       |限制返回结果数据集的个数       |   
|offset|integer  |N       |偏移量，最小值：0      |   
|orderBy|string  |N       |排序字段:排序规则，如:desc      |   
   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|delegates|Array  |受托人详情列表      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates?orderby=approval:desc&limit=2' //按照得票率降序排序，取出前2名   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"delegates": [{   
		"username": "wgl_002",  //受托人名字   
		"address": "14636456069025293113",  //受托人地址   
		"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",    //受托人公钥   
		"vote": 9901984015600500,   //得票数   
		"producedblocks": 1371, //生成的区块数   
		"missedblocks": 6,  //丢失的区块数   
		"fees": 12588514990,       
		"rewards": 276850000000,    //已经得到的奖励   
		"rate": 1,   
		"approval": 98.54,  //得票率   
		"productivity": 99.56,  //生产率   
		"forged": "289438514990"    //锻造产生的所有奖励   
	},   
	{   
		"username": "wgl_003",   
		"address": "9961157415582672274",   
		"publicKey": "c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2",   
		"vote": 9891994035600500,   
		"producedblocks": 1370,   
		"missedblocks": 8,   
		"fees": 12355148480,   
		"rewards": 275100000000,   
		"rate": 2,   
		"approval": 98.44,   
		"productivity": 99.42,   
		"forged": "287455148480"   
	}],   
	"totalCount": 233   
}   
```   
   
   
#### **2.4.5 获取受托人设置的转账费**   
接口地址：/api/delegates/fee   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |受托人公钥      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|fee|integer  |转账费      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/fee?publicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
JSON返回示例：   
```js   
{"success":true,"fee":10000000000}  //0.1 XAS   
```   
   
#### **2.4.6 根据公钥查看其锻造情况**   
接口地址：/api/delegates/forging/getForgedByAccount   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|generatorPublicKey |string |Y    |区块生成者公钥      |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|fees|integer  |收取的手续费      |    
|rewards|integer|已获得奖励|   
|forged|integer|锻造获得的总奖励|   
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/forging/getForgedByAccount?generatorPublicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"fees": 12589307065,   
	"rewards": 285600000000,   
	"forged": 298189307065   
}   
```   
   
#### **2.4.7 注册受托人**   
接口地址：/api/delegates   
请求方式：put   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|publicKey|string  |N      |公钥|    
|secondSecret|string|N|asch账户二级密码，最小长度：1，最大长度：100|   
|username|string|N|受托人名字|   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transaction|json  |注册受托人交易详情      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","username":"delegate_0821"}' 'http://45.32.248.33:4096/api/delegates'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transaction": {   
		"type": 2,  //注册受托人的交易类型为2   
		"amount": 0,   
		"senderPublicKey": "3b64f1833e6328043e1f2fee31e638bdaa6dfff5c7eb9c8577a5cefcf11261f2",   
		"requesterPublicKey": null,   
		"timestamp": 4737615,   
		"asset": {   
			"delegate": {   
				"username": "delegate_0821",   
				"publicKey": "3b64f1833e6328043e1f2fee31e638bdaa6dfff5c7eb9c8577a5cefcf11261f2"   
			}   
		},   
		"recipientId": null,   
		"signature": "7f8417e8db5f58ddff887c86c789c26b32fd3f01083ef1e3c8d4e18ed16622bf766492d78518c6c7a07aada1c98b1efc36d40c8e09394989dbde229d8e3f8103",   
		"id": "16351320834453011577",   
		"fee": 10000000000,   
		"senderId": "250438937633388106"   
	}   
}   
```   
   
#### **2.4.8 受托人开启锻造**   
接口地址：/api/delegates/forging/enable   
请求方式：post   
支持格式：urlencoded   // url必须是受托人所在服务器  
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|publicKey|string  |N      |公钥|    

   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|address|string  |受托人地址      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"motion group blossom coral upper warrior pattern fragile sister misery palm detect"}' 'http://localhost:4096/api/delegates/forging/enable'   
```   
   
JSON返回示例：   
```js   
{"success":true,"address":"16358246403719868041"}   
```      

#### **2.4.9 受托人关闭锻造**   
接口地址：/api/delegates/forging/disable   
请求方式：post   
支持格式：urlencoded   // url必须是受托人所在服务器  
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|publicKey|string  |N      |公钥|    

   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|address|string  |受托人地址      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"motion group blossom coral upper warrior pattern fragile sister misery palm detect"}' 'http://localhost:4096/api/delegates/forging/disable'   
```   
   
JSON返回示例：   
```js   
{"success":true,"address":"16358246403719868041"}     
```     

#### **2.4.10 受托人锻造状态查看**   
接口地址：/api/delegates/forging/status      
请求方式：get     
支持格式：urlencoded    
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|publicKey|string  |Y      |公钥|    

   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|enabled|string  |锻造是否开启      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/forging/status?publicKey=fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575'        
```   
   
JSON返回示例：   
```js   
{"success":true,"enabled":false}    
```     
   
### **2.5 节点peers**   
   
#### **2.5.1 获取本机连接的所有节点信息**   
接口地址：/api/peers   
请求方式：get   
支持格式：urlencoded   
备注：展示节点只是和本机有连接的节点，并不是全网所有的节点    
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|state |integer |N    |节点状态,0: ,1:,2:,3:     |   
|os|string|N|内核版本|   
|version|string|N|asch版本号|   
|limit |integer |N    |限制结果集个数，最小值：0,最大值：100   |   
|orderBy|string|N||   
|offset|integer  |N      |偏移量，最小值0  |   
|port|integer|N|端口，1~65535|   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|peers|Array  |节点信息json构成的数组     |    
|totalCount|integer|当前正在运行的节点个数|   
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/peers?limit=1'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"peers": [{   
		"ip": "45.32.19.241",   
		"port": 4096,   
		"state": 2,   
		"os": "linux3.13.0-87-generic",   
		"version": "1.0.0"   
	}],   
	"totalCount": ["54"]   
}   
```   
   
#### **2.5.2 获取本节点版本号等信息**   
接口地址：/api/peers/version   
请求方式：get   
支持格式：无   
请求参数说明：无参数   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|version|string  |版本号      |    
|build  |timestamp |构建时间     |    
|net    |string  |主链或者测试链     |   
   
   
请求示例：   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/peers/version   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"version": "1.0.0",   
	"build": "12:11:11 16/08/2016",   
	"net": "testnet"   
}   
```   
   
#### **2.5.3 获取指定ip节点信息**   
接口地址：/api/peers/get   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|ip |string |Y    |待查询节点ip      |   
|port|integer|Y|待查询节点端口，1~65535|   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|peer|json  |      |    
   
   
请求示例：   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/peers/get?ip=45.32.248.33&port=4096'   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"peer": {   
	}   
}   
```   
   
   
### **2.6 同步和加载**   
#### **2.6.1 查看本地区块链加载状态**   
接口地址：/api/loader/status   
请求方式：get   
支持格式：无   
请求参数说明：无参数   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|loaded |boole    |          |   
|blocksCount|integer||   
   
请求示例：   
```bash   
curl -k http://45.32.248.33:4096/api/loader/status -X GET   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"loaded": true,   
	"blocksCount": 0   
}   
```   
   
#### **2.6.2 查看区块同步信息**   
接口地址：/api/loader/status/sync   
请求方式：get   
支持格式：无   
请求参数说明：无参数   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|height |int    |区块高度          |   
   
请求示例：   
```bash   
curl -k http://45.32.248.33:4096/api/loader/status/sync -X GET   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"syncing": false,  // 是否在同步中，如果是则为true，目前没有数据可以同步所以为false   
	"blocks": 0,   
	"height": 111987   
}   
```   
   
### **2.7 二级密码signatures**   
#### **2.7.1 设置二级密码**   
接口地址：/api/signatures   
请求方式：put   
支持格式：json   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|publicKey|string  |N|公钥      |    
|secondSecret|string|Y|asch账户二级密码，最小长度：1，最大长度：100|   
|multisigAccountPublicKey|string|N|多重签名账户公钥|   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transaction|json  |设置二级密码产生的交易详情      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","secondSecret":"fault still attack alley expand music basket purse later educate follow ride"}' 'http://45.32.248.33:4096/api/signatures'    
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transaction": {   
		"type": 1,  //设置二级密码密码的交易类型为1   
		"amount": 0,   
		"senderPublicKey": "3b64f1833e6328043e1f2fee31e638bdaa6dfff5c7eb9c8577a5cefcf11261f2",   
		"requesterPublicKey": null,   
		"timestamp": 4872315,   
		"asset": {   
			"signature": {   
				"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"   
			}   
		},   
		"recipientId": null,   
		"signature": "e76d9b25ec0fdaa88b19d59c5a222b7efdc04f738ee05896f55f4e6959229d9b1600ca25aa92fbea176668f3be7c12c506f2091e2b38c52ef0ece7a5d35e240a",   
		"id": "1614688380530105232",   
		"fee": 500000000,       //设置二级密码密码的手续费为5 XAS   
		"senderId": "250438937633388106"   
	}   
}   
```   
   
#### **2.7.2 获取二级密码设置手续费**   
接口地址：/api/signatures/fee   
请求方式：get   
支持格式：无   
请求参数说明：无   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|fee|integer  |费用      |    
   
   
请求示例：   
```bash   
curl -k http://45.32.248.33:4096/api/signatures/fee -X GET   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"fee": 500000000         //5 XAS   
}     
```   
   
   
### **2.8 多重签名multisignatures**   
#### **2.8.1 设置普通账户为多重签名账户**   
接口地址：/api/multisignatures   
请求方式：put   
支持格式：json   
接口说明：返回结果只是生成交易id，还需要其他人签名后该账户才能成功设置成多重签名账户。注册多重签名账户后任意一笔转账都需要多人签名，签名最少个数为min的值（含交易发起人自身）   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|publicKey|string  |N|公钥      |    
|secondSecret|string|N|asch账户二级密码，最小长度：1，最大长度：100|   
|min|integer|Y|多重签名交易账户的任意一笔转账都需要多人签名的最少个数，如果是注册多重签名账户操作，这该值不生效（此时需要所有人都签名）。最小值：2，最大值：16,该值需要小于keysgroup.length+1|   
|lifetime|integer|Y|多重签名交易的最大挂起时间，最小值：1，最大值：24，暂时不生效|   
|keysgroup|array|Y|其它签名人的公钥数组，每个公钥前需要加上+或者-号，代表增加/删除多重签名账户，数组最小长度：1，数组最大长度：10|   
   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transactionId|string  |多重签名交易的id      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"vanish deliver message evil canyon night extend unusual tell prosper issue antenna","min":2,"lifetime":1,"keysgroup":["+eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97","+d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"]}' 'http://45.32.248.33:4096/api/multisignatures'  //公钥为2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactionId": "17620378998277022323"     //返回结果只是生成交易id，还需要其他人签名后该账户才能成功设置成多重签名账户   
}   
```   
   
#### **2.8.2 根据公钥获取挂起的多重签名交易详情**   
接口地址：/api/multisignatures/pending   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|publicKey|string  |Y|公钥      |    
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transactions|Array  |交易json组成的数组      |    
   
   
请求示例：   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactions": [{      //上一步中设置账户为多重签名交易的详情，transactionId: 17620378998277022323   
		"min": 2,   
		"lifetime": 1,   
		"signed": true,   
		"transaction": {   
			"type": 4,      //4代表注册多重签名账户   
			"amount": 0,   
			"senderPublicKey": "2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd",   
			"requesterPublicKey": null,   
			"timestamp": 4879978,   
			"asset": {   
				"multisignature": {   
					"min": 2,   
					"keysgroup": ["+eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
					"+d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"],   
					"lifetime": 1   
				}   
			},   
			"recipientId": null,   
			"signature": "a42feaccd9f2a4940fc0be1a1580e786b360f189db3154328f307988e75484293eae391f2f9eee489913cc6d15984eb1f5f5a0aa1bf78ea745d5c725f161af08",   
			"id": "17620378998277022323",   
			"fee": 1500000000,   
			"senderId": "3855903394839129841"   
		}   
	}]   
}   
   
```   
   
#### **2.8.3 非交易发起人对交易进行多重签名**   
接口地址：/api/multisignatures/sign   
请求方式：post   
支持格式：json   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|secondSecret|string|N|asch账户二级密码，最小长度：1，最大长度：100|   
|publicKey|string  |N|公钥      |    
|transactionId|string|Y|交易id|   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|transactionId|string  |多重签名交易id      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"lemon carpet desk accuse clerk future oyster essay seminar force live dog","transactionId":"17620378998277022323"}' 'http://45.32.248.33:4096/api/multisignatures/sign'   //公钥为eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97的用户进行签名   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactionId": "17620378998277022323"   
}   
// 此时再次获取pending   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
{   
	"success": true,   
	"transactions": [{   
		"min": 2,   
		"lifetime": 1,   
		"signed": true,   
		"transaction": {   
			"type": 4,   
			"amount": 0,   
			"senderPublicKey": "2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd",   
			"requesterPublicKey": null,   
			"timestamp": 4879978,   
			"asset": {   
				"multisignature": {   
					"min": 2,   
					"keysgroup": ["+eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
					"+d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"],   
					"lifetime": 1   
				}   
			},   
			"recipientId": null,   
			"signature": "a42feaccd9f2a4940fc0be1a1580e786b360f189db3154328f307988e75484293eae391f2f9eee489913cc6d15984eb1f5f5a0aa1bf78ea745d5c725f161af08",   
			"id": "17620378998277022323",   
			"fee": 1500000000,   
			"senderId": "3855903394839129841",   
			"signatures": ["b38a161264db2a23e353d3fbc4983562f6343d5ee693144543ca54e2bc67c0f73d1c761b7bfa38b2bb101ac2ab0797b674b1a9964ccd400aaa310746c3494d03"]      //新生成的多重签名   
		}   
	}]   
}   
   
// 公钥为d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb的账户对该注册交易进行签名   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"chalk among elbow piece badge try van round quality position simple teach","transactionId":"17620378998277022323"}' 'http://45.32.248.33:4096/api/multisignatures/sign'   
{"success":true,"transactionId":"17620378998277022323"}   
// 此时再次获取pending,结果为空   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
{"success":true,"transactions":[]}   
// 查看该注册交易详情（该交易已广播并写入blockchain）,此时该账户已成功注册成为多重签名账户   
curl -k -X GET http://45.32.248.33:4096/api/transactions/get?id=17620378998277022323   
{   
	"success": true,   
	"transaction": {   
		"id": "17620378998277022323",   //注册账户为多重签名用户的交易id   
		"height": "157013",   
		"blockId": "4680888982781013372",   
		"type": 4,   
		"timestamp": 4879978,   
		"senderPublicKey": "2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd",   
		"senderId": "3855903394839129841",   
		"recipientId": "",   
		"amount": 0,   
		"fee": 1500000000,   
		"signature": "a42feaccd9f2a4940fc0be1a1580e786b360f189db3154328f307988e75484293eae391f2f9eee489913cc6d15984eb1f5f5a0aa1bf78ea745d5c725f161af08",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "26",   
		"asset": {   
			   
		}   
	}   
}   
   
```   
   
#### **2.8.4 获取多重签名账户信息**   
接口地址：/api/multisignatures/accounts   
请求方式：get   
支持格式：urlencoded   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |多重签名参与者之一的公钥       |   
   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据 |    
|accounts|Array  |多重签名账户详情      |    
   
   
请求示例：   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/accounts?publicKey=eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"accounts": [{   
		"address": "3855903394839129841",       //多重签名账户地址   
		"balance": 18500000000,     //多重签名账户余额   
		"multisignatures": ["eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
		"d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"],    //多重签名账户公钥   
		"multimin": 2,  //最少签名个数   
		"multilifetime": 1,   
		"multisigaccounts": [{          //签名者账户详情   
			"address": "13542769708474548631",   
			"publicKey": "eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
			"balance": 0   
		},   
		{   
			"address": "4100816257782486230",   
			"publicKey": "d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb",   
			"balance": 0   
		}]   
	}]   
}   
```   

### **2.9 点对点传输tansport[安全的api]**   
#### **2.9.1 说明**   
/peer相关的api，在请求时都需要设置一个header  

 - key为magic，testnet value:594fe0f3, mainnet value:5f5b3cf5  
 - key为version，value为''  

#### **2.9.2 普通交易**   
asch系统的所有写操作都是通过发起一个交易来完成的。 
交易数据通过一个叫做asch-js的库来创建，然后再通过一个POST接口发布出去

POST接口规格如下：
payload为asch-js创建出来的交易数据
接口地址：/peer/transactions  
请求方式：post   
支持格式：json  

##### **2.9.2.1 设置二级密码**   
请求参数说明： 

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|asch-js.signature.createSignature生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
   
   
请求示例：   
```js   
var asch = require('asch-js');  
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';  
var secondPassword  = 'erjimimashezhi001';  
var transaction = asch.signature.createSignature(password,secondPassword);       
console.log(JSON.stringify(transaction))  
{"type":1,"amount":0,"fee":500000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5328943,"asset":{"signature":{"publicKey":"27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b"}},"signature":"71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a","id":"15605591820551652547"}   

// 将上面生成的设置二级密码的交易数据通过post提交给asch server
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":1,"amount":0,"fee":500000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5328943,"asset":{"signature":{"publicKey":"27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b"}},"signature":"71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a","id":"15605591820551652547"}}' http://45.32.248.33:4096/peer/transactions   
```   
   
JSON返回示例：   
```js  
{
    "success":true  //二级密码设置成功
}	
``` 

##### **2.9.2.2 转账**   
请求参数说明：  

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|asch-js.transaction.createTransaction生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
   
   
请求示例：   
```js   
var asch = require('asch-js');   
var targetAddress = "16358246403719868041";  
var amount = 100*100000000;   //100 XAS
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';  
var secondPassword  = 'erjimimashezhi001';  
var message = ''; // 转账备注

// 其中password是在用户登录的时候记录下来的，secondPassword需要每次让用户输入
// 可以通过user.secondPublicKey来判断用户是否有二级密码，如果没有，则不必输入，以下几个交易类型类似
var transaction = asch.transaction.createTransaction(targetAddress, amount, message, password, secondPassword || undefined);       
JSON.stringify(transaction)
'{"type":0,"amount":10000000000,"fee":10000000,"recipientId":"16358246403719868041","message":"","timestamp":37002975,"asset":{},"senderPublicKey":"8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd","signature":"bd0ed22abf09a13c1778ebfb96fc8584dd209961cb603fd0d818d88df647a926795b5e3c51e23f6ed38648169f4e4c912dd854725c22cce9bbdc15ec51c23008","id":"de72b89312c7d128db28611ed36eab2ff0136912c4a67f97342417c942b055cf"}'

// 将上面生成的转账操作的交易数据通过post提交给asch server
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":0,"amount":10000000000,"fee":10000000,"recipientId":"16358246403719868041","message":"","timestamp":37002975,"asset":{},"senderPublicKey":"8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd","signature":"bd0ed22abf09a13c1778ebfb96fc8584dd209961cb603fd0d818d88df647a926795b5e3c51e23f6ed38648169f4e4c912dd854725c22cce9bbdc15ec51c23008","id":"de72b89312c7d128db28611ed36eab2ff0136912c4a67f97342417c942b055cf"}}' http://45.32.248.33:4096/peer/transactions
```   
   
JSON返回示例：   
```js  
{
    "success":true,  //转账成功
    "transactionId":"a95c3a5bda15f3fd38295950268c234e922aae97cf803dd8c38c73a6ccf7c561"
}		
``` 

##### **2.9.2.3 注册受托人**   
请求参数说明： 

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|asch-js.delegate.createDelegate生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
   
   
请求示例：   
```js   
var asch = require('asch-js');   
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';
var userName = 'zhenxi_test';  

var transaction = asch.delegate.createDelegate(userName, password, secondPassword || undefined);   
JSON.stringify(transaction)  
'{"type":2,"amount":0,"fee":10000000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334485,"asset":{"delegate":{"username":"zhenxi_test","publicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f"}},"signature":"a12ce415d2d21ab46e4c1b918b8717b1d351dd99abd6f2f94d9a1a7e1f32b697f843a05b1851cb857ea45a2476dce592f5ddd612c00cd44488b8b610c57d7f0a","signSignature":"35adc9f1f37d14458e8588f9b4332eedf1151c02480159f64a287a4b0cbb59bfe82040dfec96a4d9560bae99b8eaa1799a7023395db5ddc640d95447992d6e00","id":"12310465407307249905"}'

// 将上面生成的注册受托人的交易数据通过post提交给asch server
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":2,"amount":0,"fee":10000000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334485,"asset":{"delegate":{"username":"zhenxi_test","publicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f"}},"signature":"a12ce415d2d21ab46e4c1b918b8717b1d351dd99abd6f2f94d9a1a7e1f32b697f843a05b1851cb857ea45a2476dce592f5ddd612c00cd44488b8b610c57d7f0a","signSignature":"35adc9f1f37d14458e8588f9b4332eedf1151c02480159f64a287a4b0cbb59bfe82040dfec96a4d9560bae99b8eaa1799a7023395db5ddc640d95447992d6e00","id":"12310465407307249905"}}' http://45.32.248.33:4096/peer/transactions
```   
   
JSON返回示例：   
```js  
{
    "success":true  //注册受托人成功
}		
``` 

##### **2.9.2.4 投票 & 取消投票**  

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|asch-js.vote.createVote生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
   
   
请求示例：   
```js   
var asch = require('asch-js');   
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';
// 投票内容是一个列表，列表中的每一个元素是一个符号加上所选择的受托人的公钥，符号为+表示投票，符号为-表示取消投票
var voteContent = [
    '-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7',
    '+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2'
];

var transaction = asch.vote.createVote(voteContent, password, secondPassword || undefined);
JSON.stringify(transaction)
{"type":3,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334923,"asset":{"vote":{"votes":["-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7","+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2"]}},"signature":"6036c2066a231c452a1c83aafd3bb9db3842ee05d5f17813f8264a4294cdec761faa89edf4a95f9b2e2451285807ab18aa9f989ad9a3165b95643179b8e4580f","signSignature":"a216ca739112e6f65986604b9467ccc8058138a7077faf134d6c4d673306cd1c514cc95bd54a036f7c602a56c4b4f2e4e59f6aa7c376cb1429e89054042e050b","id":"17558357483072606427"}

// 将上面生成的投票的交易数据通过post提交给asch server
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":3,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334923,"asset":{"vote":{"votes":["-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7","+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2"]}},"signature":"6036c2066a231c452a1c83aafd3bb9db3842ee05d5f17813f8264a4294cdec761faa89edf4a95f9b2e2451285807ab18aa9f989ad9a3165b95643179b8e4580f","signSignature":"a216ca739112e6f65986604b9467ccc8058138a7077faf134d6c4d673306cd1c514cc95bd54a036f7c602a56c4b4f2e4e59f6aa7c376cb1429e89054042e050b","id":"17558357483072606427"}}' http://45.32.248.33:4096/peer/transactions
```   
   
JSON返回示例：   
```js  
{
    "success":true  //投票&取消投票 成功
}		
``` 

##### **2.9.2.5 账户锁仓**  
备注：锁仓后且区块高度未达到锁仓高度，则该账户不能执行如下操作：

|交易类型type|备注|
|----|----|
|0|主链XAS转账|
|6|Dapp充值|
|7|Dapp提现|
|8|存储小文件|
|9|发行商注册|
|10|资产注册|
|13|资发行产|
|14|主链uia转账|

请求参数说明：  

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|asch-js.transaction.createLock生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|transactionId|string|交易id|
   
   
请求示例：   
```js   
var asch = require('asch-js');   
var height = 3500;  // 锁仓高度
var password = 'found knife gather faith wrestle private various fame cover response security predict';
var secondPassword  = '';


// 其中password是在用户登录的时候记录下来的，secondPassword需要每次让用户输入
// 可以通过user.secondPublicKey来判断用户是否有二级密码，如果没有，则不必输入，以下几个交易类型类似
var transaction = asch.transaction.createLock(height, password, secondPassword || undefined);       
JSON.stringify(transaction)
'{"type":100,"amount":0,"fee":10000000,"recipientId":null,"args":["3500"],"timestamp":39615653,"asset":{},"senderPublicKey":"2856bdb3ed4c9b34fd2bba277ffd063a00f703113224c88c076c0c58310dbec4","signature":"46770ea4ba48ebb0abbaae95b7931dd9f6cc0d178ff22ec50b9e97f3f31126b8d0c9c47f7d2e4479124530f7d36d9e1aac72da598330cda3b7404cd48fb10e0c","id":"b71187f59e2a7f6dd68f18b4ddd0bb87f20394473f0388952f0ceedf49596811"}'

// 将上面生成的转账操作的交易数据通过post提交给asch server
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":100,"amount":0,"fee":10000000,"recipientId":null,"args":["3500"],"timestamp":39615653,"asset":{},"senderPublicKey":"2856bdb3ed4c9b34fd2bba277ffd063a00f703113224c88c076c0c58310dbec4","signature":"46770ea4ba48ebb0abbaae95b7931dd9f6cc0d178ff22ec50b9e97f3f31126b8d0c9c47f7d2e4479124530f7d36d9e1aac72da598330cda3b7404cd48fb10e0c","id":"b71187f59e2a7f6dd68f18b4ddd0bb87f20394473f0388952f0ceedf49596811"}}' http://localhost:4096/peer/transactions && echo 
```   
   
JSON返回示例：   
```js  
{
    "success":true,  // 锁仓成功
    "transactionId":"b71187f59e2a7f6dd68f18b4ddd0bb87f20394473f0388952f0ceedf49596811"
}		
``` 

#### **2.9.3 UIA相关交易** 
asch系统的所有写操作都是通过发起一个交易来完成的。 
交易数据通过一个叫做asch-js的库来构建，然后再通过一个POST接口发布出去。

POST接口规格如下：
payload为asch-js创建出来的交易数据
接口地址：/peer/transactions  
请求方式：post   
支持格式：json  
公用变量：
```
var AschJS = require('asch-js');
// 一级密码
var secret = 'motion group blossom coral upper warrior pattern fragile sister misery palm detect'
// 二级密码
var secondSecret = 'erjimima001'
```

##### **2.9.3.1 注册资产发行商**
请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|AschJS.uia.createIssuer根据发行商名字、描述、一级密码、二级密码生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  

   
请求示例：   
```js   
// 发行商名称,唯一标识
var name = 'IssuerName'
// 发行商描述
var desc = 'IssuerDesc'
// 构造交易数据
var trs = AschJS.uia.createIssuer(name, desc, secret, secondSecret)
console.log(JSON.stringify(trs))
{"type":9,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19395607,"asset":{"uiaIssuer":{"name":"IssuerName","desc":"IssuerDesc"}},"signature":"c6ed2a4bafe2b8aa31f4aaceacc2a96cb028abbabb2ed062937498c58e24ca5467a340ddd63b67f809a680ff91b83e685c64991eb695494ddb2fdc57e5761607","signSignature":"8eceacbd47c2b8ed335145ced19d7a3a51f99bdd6631d16ed214180c6f80e29bd6d572f45e7c7d685584e55cb5c303cf340406553ece28c9c0a2fa7a777aac0b"}

// 将生成的交易数据通过post发送给server，注册资产发行商IssuerName
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":9,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19395607,"asset":{"uiaIssuer":{"name":"IssuerName","desc":"IssuerDesc"}},"signature":"c6ed2a4bafe2b8aa31f4aaceacc2a96cb028abbabb2ed062937498c58e24ca5467a340ddd63b67f809a680ff91b83e685c64991eb695494ddb2fdc57e5761607","signSignature":"8eceacbd47c2b8ed335145ced19d7a3a51f99bdd6631d16ed214180c6f80e29bd6d572f45e7c7d685584e55cb5c303cf340406553ece28c9c0a2fa7a777aac0b"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js  
{"success":true}		
```

##### **2.9.3.2 注册资产** 
请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|AschJS.uia.createAsset根据资产名字、描述、上限、精度、策略、一级密码、二级密码生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  

   
请求示例：   
```js   
// 资产名称，发行商名.资产名，唯一标识
var name = 'IssuerName.CNY';
var desc = '资产描述';
// 上限
var maximum = '1000000';
// 精度，小数点的位数，这里上限是1000000，精度为3，代表资产IssuerName.CNY的最大发行量为1000.000
var precision = 3;
// 策略
var strategy = '';
// 是否允许注销，默认不允许。0：不允许，1：允许
var allowWriteoff = 0;
// 是否允许白名单，默认不允许。0：不允许，1：允许
var allowWhitelist = 0;
// 是否允许黑名单，默认不允许。0：不允许，1：允许
var allowBlacklist = 0;
// 构造交易数据
var trs = AschJS.uia.createAsset(name, desc, maximum  , precision, strategy, allowWriteoff, allowWhitelist, allowBlacklist, secret, secondSecret)
console.log(JSON.stringify(trs))
// 返回的结果如下
{"type":10,"amount":0,"fee":50000000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":48697173,"message":null,"asset":{"uiaAsset":{"name":"IssuerName.CNY","desc":"资产描述","maximum":"1000000","precision":3,"strategy":"","allowBlacklist":0,"allowWhitelist":0,"allowWriteoff":0}},"signature":"17e12a741375bd0420b9e88a5be5b8563c12d90961914477116eb95ca5df119ca73c8edbcefef071a69bf5bf8a2b9829ed0e0d6fc3efedaaa16b528aa6239f04","signSignature":"a325267c0fc9cfcbed848494b7577dfe85f2ca751dcb02336ff84153cf46e79e99dc87a377f56ce2e500331f04df952415e38b7e3e8cbdb90192c99a0787120b","id":"8ef0982580b58094cb87f1f81c0cf3fa5588ec86681895b44b946ebbf05951d4"}

// 将生成的交易数据通过post发送给server，注册资产IssuerName.CNY
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{{"type":10,"amount":0,"fee":50000000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":48697173,"message":null,"asset":{"uiaAsset":{"name":"IssuerName.CNY","desc":"资产描述","maximum":"1000000","precision":3,"strategy":"","allowBlacklist":0,"allowWhitelist":0,"allowWriteoff":0}},"signature":"17e12a741375bd0420b9e88a5be5b8563c12d90961914477116eb95ca5df119ca73c8edbcefef071a69bf5bf8a2b9829ed0e0d6fc3efedaaa16b528aa6239f04","signSignature":"a325267c0fc9cfcbed848494b7577dfe85f2ca751dcb02336ff84153cf46e79e99dc87a377f56ce2e500331f04df952415e38b7e3e8cbdb90192c99a0787120b","id":"8ef0982580b58094cb87f1f81c0cf3fa5588ec86681895b44b946ebbf05951d4"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js  
{"success":true}		
```

##### **2.9.3.3 资产设置acl模式** 
请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|AschJS.uia.createFlags根据资产名、流通状态、黑白名单模式、一级密码、二级密码生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  

   
请求示例：   
```js   
var currency = 'IssuerName.CNY'
// 资产是否注销，1：流通，2：注销
var flagType = 1
// 访问控制列表的类型，0：黑名单， 1：白名单，资产创建后默认为黑名单模式
var flag = 1
var trs = AschJS.uia.createFlags(currency, flagType, flag, secret, secondSecret)
console.log(JSON.stringify(trs))
{"type":11,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19400996,"asset":{"uiaFlags":{"currency":"IssuerName.CNY","flagType":1,"flag":1}},"signature":"b96fb3d1456e1f26357109cc24d82834eb9a4687f29e69c374bbb1d534568336e148cac52f213aa4d2a69185092f8e1143b49ec4b8048cd9b3af4e20f6ba0b08","signSignature":"b37c77ebebe90341346be2aefe1e12bd7403e5d8f4d6e8f04630190b3e09494a28820da0ffd5f9ff011033aa6d70fc9bb4c159a4493be3b18fd7ff470103570d"}

// 将生成的交易数据通过post发送给server，将acl改为白名单模式
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":11,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19400996,"asset":{"uiaFlags":{"currency":"IssuerName.CNY","flagType":1,"flag":1}},"signature":"b96fb3d1456e1f26357109cc24d82834eb9a4687f29e69c374bbb1d534568336e148cac52f213aa4d2a69185092f8e1143b49ec4b8048cd9b3af4e20f6ba0b08","signSignature":"b37c77ebebe90341346be2aefe1e12bd7403e5d8f4d6e8f04630190b3e09494a28820da0ffd5f9ff011033aa6d70fc9bb4c159a4493be3b18fd7ff470103570d"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js  
{"success":true}		
```

##### **2.9.3.4 更新访问控制列表（acl）** 
请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|AschJS.uia.createAcl根据资产名字、列表操作方法、黑名单还是白名单、地址列表、一级密码、二级密码生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  

   
请求示例：   
```js   
var currency = 'IssuerName.CNY'
// '+'表示增加列表， ‘-’表示删除列表
var operator = '+'
var list = ['15745540293890213312']
// 访问控制列表的类型，0：黑名单， 1：白名单
var flag =1
var trs = AschJS.uia.createAcl(currency, operator, flag, list, secret, secondSecret)
console.log(JSON.stringify(trs))
{"type":12,"amount":0,"fee":20000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19403125,"asset":{"uiaAcl":{"currency":"IssuerName.CNY","operator":"+","flag":1,"list":["15745540293890213312"]}},"signature":"ad4060e04c1a12256de114e34499f8add24326753f1f8362991ee14aefc4c0fe90ff394d2db97e83770855a5688d463de00656fdd2d04604605cf3c04fdaca0e","signSignature":"63129c58b1b9fcce88cbe829f3104a10ab06037253e9b65feb50ce0d2bb988533b93e8edcad016a85675f9027758fc318cf899ca7ef161a95a8d8a055ae83a02"}

// 将生成的交易数据通过post发送给server，把地址列表['15745540293890213312']增加到该白名单中，只修改名单列表，不修改acl模式，手续费0.2XAS
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":12,"amount":0,"fee":20000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19403125,"asset":{"uiaAcl":{"currency":"IssuerName.CNY","operator":"+","flag":1,"list":["15745540293890213312"]}},"signature":"ad4060e04c1a12256de114e34499f8add24326753f1f8362991ee14aefc4c0fe90ff394d2db97e83770855a5688d463de00656fdd2d04604605cf3c04fdaca0e","signSignature":"63129c58b1b9fcce88cbe829f3104a10ab06037253e9b65feb50ce0d2bb988533b93e8edcad016a85675f9027758fc318cf899ca7ef161a95a8d8a055ae83a02"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js  
{"success":true}
// 查询更新后的列表（acl/1代表白名单）
curl -X GET -H "Content-Type: application/json" 'http://localhost:4096/api/uia/assets/IssuerName.CNY/acl/1?limit=10&offset=0' && echo
{
	"success": true,
	"list": [{
		"address": "15745540293890213312"
	}],
	"count": 1
}
```


##### **2.9.3.5 资产发行** 
请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|AschJS.uia.createIssuer根据发行商名字、描述、一级密码、二级密码生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  

   
请求示例：   
```js   
var currency = 'IssuerName.CNY'
// 本次发行量=真实数量（100）*10**精度（3），所有发行量之和需 <= 上限*精度
var amount = '100000'
var trs = AschJS.uia.createIssue(currency, amount, secret, secondSecret)
console.log(JSON.stringify(trs))
{"type":13,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19475744,"asset":{"uiaIssue":{"currency":"IssuerName.CNY","amount":"100000"}},"signature":"32b01a18eca2b0dc7e2ce77ba4e758eaae2532f60844760a762cc20918e7439ac6ca585b921db6ede833ed0bf1c62e30cec545a928abafe0b679183a6ad02202","signSignature":"4fc290d7d7d788e9112a56233df0fe796cba39be3efa0cebf00cbc7e5bc5fd1369fad49e5698d967845b5c02e427926049cab25845d4d385e4a395791906f909"}

curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":13,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19475744,"asset":{"uiaIssue":{"currency":"IssuerName.CNY","amount":"100000"}},"signature":"32b01a18eca2b0dc7e2ce77ba4e758eaae2532f60844760a762cc20918e7439ac6ca585b921db6ede833ed0bf1c62e30cec545a928abafe0b679183a6ad02202","signSignature":"4fc290d7d7d788e9112a56233df0fe796cba39be3efa0cebf00cbc7e5bc5fd1369fad49e5698d967845b5c02e427926049cab25845d4d385e4a395791906f909"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js  
{"success":true}			
```

##### **2.9.3.6 资产转账** 
请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|AschJS.uia.createTransfer根据资产名字、数量、接收者地址、一级密码、二级密码生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  

   
请求示例：   
```js   
var currency = 'IssuerName.CNY'
// 本次转账数（10000）=真实数量（10）*10**精度（3），需 <= 当前资产发行总量
var amount = '10000'
// 接收地址，需满足前文定义好的acl规则
var recipientId = 'AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a'
var trs = AschJS.uia.createTransfer(currency, amount, recipientId, secret, secondSecret)
console.log(JSON.stringify(trs))
{"type":14,"amount":0,"fee":10000000,"recipientId":"AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a","senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19481489,"asset":{"uiaTransfer":{"currency":"IssuerName.CNY","amount":"10000"}},"signature":"77789071a2ad6d407b9d1e0d654a9deb6d85340a3d2a13d786030e26ac773b4e9b5f052589958d2b8553ae5fc9449496946b5c225e0baa723e7ddecbd89f060a","signSignature":"f0d4a000aae3dd3fa48a92f792d4318e41e3b56cdbaf98649261ae34490652b87645326a432d5deb69f771c133ee4b67d2d22789197be34249e6f7f0c30c1705"}

// 给AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a发送10.000 IssuerName.CNY资产
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":14,"amount":0,"fee":10000000,"recipientId":"AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a","senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19481489,"asset":{"uiaTransfer":{"currency":"IssuerName.CNY","amount":"10000"}},"signature":"77789071a2ad6d407b9d1e0d654a9deb6d85340a3d2a13d786030e26ac773b4e9b5f052589958d2b8553ae5fc9449496946b5c225e0baa723e7ddecbd89f060a","signSignature":"f0d4a000aae3dd3fa48a92f792d4318e41e3b56cdbaf98649261ae34490652b87645326a432d5deb69f771c133ee4b67d2d22789197be34249e6f7f0c30c1705"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js  
{"success":true}		
```
 
##### **2.9.3.7 资产注销** 
请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|AschJS.uia.createFlags根据资产名字、注销状态、黑白名单模式、一级密码、二级密码生成的交易数据|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  

   
请求示例：   
```js   
var currency = 'IssuerName.CNY'
// flagType为资产是否注销，1：流通，2：注销
var flagType = 2
// flag为黑、白名单模式
var flag =1
var trs = AschJS.uia.createFlags(currency, flagType, flag, secret, secondSecret)
console.log(JSON.stringify(trs))
{"type":11,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19488690,"asset":{"uiaFlags":{"currency":"IssuerName.CNY","flagType":2,"flag":1}},"signature":"cbd656552417604704703e1236ec2bbed8eba6a2ccfcb54cc0b2d629c0a9d1335a264fc9f6dee1705f4a86c36a5ce2ba8e039d913a189b7c273c8ac0d9e3780c","signSignature":"3c7b91d03efeed2dc86e1f2301da60789751c1be8850460d8c66c0ae8f55ea27d26f0bc79541d74b4777d9b85c518c1c73c0284dbf3e826db0a686560e57a80b"}

curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":11,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":19488690,"asset":{"uiaFlags":{"currency":"IssuerName.CNY","flagType":2,"flag":1}},"signature":"cbd656552417604704703e1236ec2bbed8eba6a2ccfcb54cc0b2d629c0a9d1335a264fc9f6dee1705f4a86c36a5ce2ba8e039d913a189b7c273c8ac0d9e3780c","signSignature":"3c7b91d03efeed2dc86e1f2301da60789751c1be8850460d8c66c0ae8f55ea27d26f0bc79541d74b4777d9b85c518c1c73c0284dbf3e826db0a686560e57a80b"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js  
{"success":true}		
```  


#### **2.9.4 其它内部通讯安全接口**  
get /peer/list  //查找dapp peer   
get /peer/blocks/common //查找common block   
...    



### **2.10 用户自定义资产uia**  
#### **2.10.1 获取全网所有发行商**  
接口地址：/api/uia/issuers  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|issuers|list|元素为字典，每个字典代表一个发行商，包含发行商名字、描述、id（Asch地址）|
|count|integer|发行商总个数|

请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://testnet.asch.so:4096/api/uia/issuers?offset=0&limit=1' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"issuers": [{
		"name": "zhenxi",
		"desc": "注册资产发行商-测试",
		"issuerId": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a"
	},
	{
		"name": "speedtest",
		"desc": "speedtest",
		"issuerId": "AEVWQWAq3TEJkCPSDxXMP2uCRrL2xbQnsy"
	}],
	"count": 6
}		
``` 

#### **2.10.2 查询指定发行商的信息** 
接口地址：/api/uia/issuers/:name  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|name|string|Y|可以为发行商名称或Asch账户地址|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|issuers|dict|包含发行商名字、描述、id（Asch地址）|
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://testnet.asch.so:4096/api/uia/issuers/zhenxi' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"issuer": {
		"name": "zhenxi",
		"desc": "注册资产发行商-测试",
		"issuerId": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a"
	}
}		
``` 

#### **2.10.3 查看指定发行商的资产** 
接口地址：/api/uia/issuers/:name/assets  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|name|string|Y|可以为发行商名称或Asch账户地址|
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|assets|list|每个元素是一个字典，每个字典是一个资产详情，包含资产名字、描述、上限（最大发行量=真实发行量*10**精度）、精度、策略、当前发行量、发行高度、发行商id，acl模式（0：黑名单，1：白名单）、是否注销|
|count|interger|该发行商注册的资产总个数（包含已注销的）|

   
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://testnet.asch.so:4096/api/uia/issuers/zhenxi/assets?offset=0&limit=2' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"assets": [{
		"name": "zhenxi.UIA",
		"desc": "注册资产-测试",
		"maximum": "10000000",
		"precision": 3,
		"strategy": "",
		"quantity": "1000000",
		"height": 301,
		"issuerId": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a",
		"acl": 0,
		"writeoff": 1
	}],
	"count": 1
}		
``` 

#### **2.10.4 获取全网所有资产信息** 
接口地址：/api/uia/assets  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|assets|list|每个元素是一个字典，每个字典是一个资产详情，包含资产名字、描述、上限、精度、策略、当前发行量、发行高度、发行商id，acl、是否注销|
|count|integer|所有资产的个数|

   
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://testnet.asch.so:4096/api/uia/assets?offset=0&limit=2' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"assets": [{
		"name": "zhenxi.UIA",
		"desc": "注册资产-测试",
		"maximum": "10000000",
		"precision": 3,
		"strategy": "",
		"quantity": "1000000",
		"height": 301,
		"issuerId": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a",
		"acl": 0,
		"writeoff": 1
	},
	{
		"name": "speedtest.SPEED",
		"desc": "测速",
		"maximum": "10000",
		"precision": 1,
		"strategy": "",
		"quantity": "10000",
		"height": 380,
		"issuerId": "AEVWQWAq3TEJkCPSDxXMP2uCRrL2xbQnsy",
		"acl": 0,
		"writeoff": 0
	}],
	"count": 13
}		
``` 

#### **2.10.5 获取指定资产信息** 
接口地址：/api/uia/assets/:name  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|name|string|Y|资产名|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|assets|dict|包含资产名字、描述、上限、精度、策略、当前发行量、发行高度、发行商id，acl、是否注销|
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://testnet.asch.so:4096/api/uia/assets/zhenxi.UIA' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"asset": {
		"name": "zhenxi.UIA",
		"desc": "注册资产-测试",
		"maximum": "10000000",
		"precision": 3,
		"strategy": "",
		"quantity": "1000000",
		"height": 301,
		"issuerId": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a",
		"acl": 0,
		"writeoff": 1
	}
}		
``` 

#### **2.10.6 获取指定资产的访问控制列表（acl）** 
接口地址：/api/uia/assets/:name/acl/flag  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|name|string|Y|资产名|
|flag|boole|Y|取值0和1，0表示黑名单，1表示白名单|
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|list|list|符合规则的账户列表|
|count|integer|符合规则账户总数|

   
请求示例：   
```js   
// 获取资产zhenxi.UIA白名单中的地址列表
curl -X GET -H "Content-Type: application/json"  'http://localhost:4096/api/uia/assets/zhenxi.UIA/acl/1' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"list": [{
		"address": "15745540293890213312"
	},
	{
		"address": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a"
	}],
	"count": 2
}		
``` 

#### **2.10.7 获取指定账户所有uia的余额** 
接口地址：/api/uia/balances/:address  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address|string|Y|账户地址|
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|balances|list|拥有的资产详情列表，每个元素是一个资产，包含资产名、余额、上限、精度、当前发行量、是否注销（0：未注销，1：已注销）|
|count|integer|当前该地址拥有的资产个数|
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json" 'http://localhost:4096/api/uia/balances/AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"balances": [{
		"currency": "zhenxi.UIA",
		"balance": "900000",
		"maximum": "10000000",
		"precision": 3,
		"quantity": "1000000",
		"writeoff": 1
	},
	{
		"currency": "speedtest.SPEED",
		"balance": "400",
		"maximum": "10000",
		"precision": 1,
		"quantity": "10000",
		"writeoff": 0
	}],
	"count": 2
}		
```

#### **2.10.8 获取指定账户所有资产相关操作记录** 
接口地址：/api/uia/transactions/my/:address  
请求方式：get   
支持格式：urlencoded  
备注：包含发行商创建以及资产创建、发行、转账等  

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address|string|Y|账户地址|
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|transactions|list|交易列表，每个元素是一个字典代表一次交易，包含交易id、区块高度、区块id、交易类型、时间戳、发送者公钥、发送者id、接收者id（系统为空，如资产注册）、交易数量（资产交易都为0）、手续费0.1XAS、签名、多重签名、确认数、资产信息（包含发行商id、发行商名字、描述）、交易id。|
|count|integer|资产交易总个数|
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://localhost:4096/api/uia/my/transactions/16358246403719868041?offset=0&limit=2' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"transactions": [{
		"id": "12372526051670720162",   // 交易id
		"height": "286",    // 交易所在区块高度
		"blockId": "14863181420651287815",  // 交易所在区块id
		"type": 9,  // 交易类型，9代表注册发行商
		"timestamp": 17597873,  // 交易时间，距离创世块的offset
		"senderPublicKey": "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3",  // 交易发起者公钥
		"senderId": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a",   // 交易发起者id
		"recipientId": "",  //  接收者id，如果是系统则为空
		"amount": 0,    //  交易数量，如果是资产或者XAS则为非0，否则为0
		"fee": 10000000,    // 交易费
		"signature": "6a1e66387f610de5a89489105697082037b82bff4fb6f95f9786304176efe59f7d41e8fe9c5501e1b0b34a47e957a38e10e940fdb180f8ebcaf0ac062a63c601", // 交易签名
		"signSignature": "",    // 二级签名，有二级密码时才有
		"signatures": null, // 多重签名，使用多重签名账户时才有
		"confirmations": "155998",  // 交易确认数
		"asset": {
			"uiaIssuer": {
				"transactionId": "12372526051670720162",    // 交易id
				"name": "zhenxi",   // 发行商名字
				"desc": "注册资产发行商-测试"   // 发行商描述
			}
		},
		"t_id": "12372526051670720162"  // 交易id
	},
	{
		"id": "17308768226103450697",
		"height": "371",
		"blockId": "244913990990213995",
		"type": 9,
		"timestamp": 17598730,
		"senderPublicKey": "7bd645f9626820d390311fb28dc30875e8bd26cce2d04ba2809df82e84088020",
		"senderId": "AEVWQWAq3TEJkCPSDxXMP2uCRrL2xbQnsy",
		"recipientId": "",
		"amount": 0,
		"fee": 10000000,
		"signature": "6ea76ff6f58f1bc99d6b40ece45e371948db58a68f6fa41e13b34ff86bbf1f0bea53d6afe982562392861727f879205efc7d1342f6e963028985e243a94e5507",
		"signSignature": "",
		"signatures": null,
		"confirmations": "155913",
		"asset": {
			"uiaIssuer": {
				"transactionId": "17308768226103450697",
				"name": "speedtest",
				"desc": "speedtest"
			}
		},
		"t_id": "17308768226103450697"
	}],
	"count": 58
}		
```


说明：
    注意这里asset内容与type相关，9 <= type <= 14， 根据不同的type从asset中取出不同的值，详情如下：

```
type=9
"asset": {
                "uiaIssuer": {
                    "transactionId": "260434858608363290",
                    "name": "issuername",
                    "desc": "issuer1_desc"
                }
            },
展示： 注册了发行商"issuername"
```

```
type=10
"asset": {
                "uiaAsset": {
                    "transactionId": "11613326283813789432",
                    "name": "issuername.BTC",
                    "desc": "asset1_desc",
                    "maximum": "10000000000000",
                    "precision": "6",
                    "strategy": ""
                }
            },
展示： 注册了资产"issuername.BTC"
```

```
type=11
"asset": {
                "uiaFlags": {
                    "transactionId": "14649028077581400942",
                    "currency": "issuername.BTC",
                    "flagType": "1",
                    "flag": "1"
                }
            },
展示: 
如果$flagType==1 ： 资产issuername.BTC访问控制设置为(flag==0?黑名单：白名单)
如果$flagType==2 ： 资产issuername.BTC被注销
```

```
type=12
"asset": {
                "uiaAcl": {
                    "transactionId": "16597707943986371131",
                    "currency": "issuername.BTC",
                    "operator": "+",
                    "flag": "1",
                    "list": [
                        "196751217687897827",
                        "11053997261735317227"
                    ]
                }
            },
展示：资产issuername.BTC更新了访问控制列表
```

```
type=13
"asset": {
                "uiaIssue": {
                    "transactionId": "10646196155790595088",
                    "currency": "issuername.BTC",
                    "amount": "10000000000"
                }
            },
展示： 资产issuername.BTC新发行10000000000(实际数量*精度)
```

```
type=14
"asset": {
                "uiaTransfer": {
                    "transactionId": "9105235822289198060",
                    "currency": "issuername.BTC",
                    "amount": "10"
                }
            },
展示：转账10个issuername.BTC资产，交易id是9105235822289198060
```


   


#### **2.10.9 获取指定账户指定资产的余额** 
接口地址：/api/uia/balances/:address/:currency  
请求方式：get   
支持格式：urlencoded 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address|string|Y|Asch地址|
|currency|string|Y|资产名字|
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|balances|dict|包含资产名、余额、最大发行量、精度、当前发行量、是否注销|
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://localhost:4096/api/uia/balances/16358246403719868041/IssuerName.CNY' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"balance": {
		"currency": "IssuerName.CNY",
		"balance": "80000",
		"maximum": "1000000",
		"precision": 3,
		"quantity": "100000",
		"writeoff": 1
	}
}	
```

#### **2.10.10 获取指定账户指定资产转账记录** 
接口地址：/api/uia/transactions/my/:address/:currency  
请求方式：get   
支持格式：urlencoded  
备注：只返回资产转账记录  

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|address|string|Y|Asch地址|
|currency|string|Y|资产名字|
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|transactions|list|交易列表，每个元素是一个字典代表一次交易，包含交易id、区块高度、区块id、交易类型、时间戳、发送者公钥、发送者id、接收者id（系统为空，如资产注册）、交易数量（资产交易都为0）、手续费0.1XAS、签名、多重签名、确认数、资产信息（包含发行商id、发行商名字、描述）、交易id。|  
|count|integer|资产交易总个数|  
   
请求示例：   
```js   
curl -X GET -H "Content-Type: application/json"  'http://localhost:4096/api/uia/transactions/my/16358246403719868041/IssuerName.CNY' && echo
```   
   
JSON返回示例：   
```js  
{
	"success": true,
	"transactions": [{
		"id": "d6102fc30931e4dc449811cbbab705fd64bc79b09de703e8172f7bdd90835abc",
		"height": "173109",
		"blockId": "baa23acd566780e338436b48e4eb79a87d3bdd67caeb3812a663da8f77ae87d9",
		"type": 14,
		"timestamp": 19481489,
		"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575",
		"senderId": "16358246403719868041",
		"recipientId": "AKKHPvQb2A119LNicCQWLZQDFxhGVEY57a",
		"amount": 0,
		"fee": 10000000,
		"signature": "77789071a2ad6d407b9d1e0d654a9deb6d85340a3d2a13d786030e26ac773b4e9b5f052589958d2b8553ae5fc9449496946b5c225e0baa723e7ddecbd89f060a",
		"signSignature": "f0d4a000aae3dd3fa48a92f792d4318e41e3b56cdbaf98649261ae34490652b87645326a432d5deb69f771c133ee4b67d2d22789197be34249e6f7f0c30c1705",
		"signatures": null,
		"confirmations": "90853",
		"asset": {
			"uiaTransfer": {
				"transactionId": "d6102fc30931e4dc449811cbbab705fd64bc79b09de703e8172f7bdd90835abc",
				"currency": "IssuerName.CNY",
				"amount": "10000",
				"amountShow": "10"
			}
		},
		"t_id": "d6102fc30931e4dc449811cbbab705fd64bc79b09de703e8172f7bdd90835abc"
	}],
	"count": 15
}	
```

#### **2.10.11 获取指定资产转账记录** 
接口地址：/api/uia/transactions/:currency  
请求方式：get   
支持格式：urlencoded  
备注：只返回指定资产转账记录 

请求参数说明：

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|currency|string|Y|资产名字|
|limit|integer|N|限制结果集个数，最小值：0,最大值：100|
|offset|integer|N|偏移量，最小值0|

返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功 |  
|transactions|list|交易列表，每个元素是一个字典代表一次交易，包含交易id、区块高度、区块id、交易类型、时间戳、发送者公钥、发送者id、接收者id（系统为空，如资产注册）、交易数量（资产交易都为0）、手续费0.1XAS、签名、多重签名、确认数、资产信息（包含发行商id、发行商名字、描述）、交易id。|  
|count|integer|该资产交易总数|  
   
请求示例：   
```js   
// 查询引力波资产absorb.YLB的所有转账记录 
curl -X GET -H "Content-Type: application/json" 'http://127.0.0.1:4096/api/uia/transactions/absorb.YLB' && echo
```   
   
JSON返回示例：   
```js  
{
	success: true,
	transactions: [{
		id: "a1ff79e3f37fd73b41abd293c22171ac7760160ad457e55f028e7a8b527651d3",
		height: "43",
		blockId: "b16b87e79b47edffdc2fd93bd1de70cbe3541684d5dbf8dc1d292903275e03dc",
		type: 14,
		timestamp: 39167334,
		senderPublicKey: "2856bdb3ed4c9b34fd2bba277ffd063a00f703113224c88c076c0c58310dbec4",
		senderId: "ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M",
		recipientId: "AMzDw5BmZ39we18y7Ty9VW79eL9k7maZPH",
		amount: 0,
		fee: 10000000,
		signature: "a4e6b0e2c265e0d601fdfc9e82d971e7908457383835b801c725cdaac01bd619a435344241c64247599255f43a43b6576e1da3a357eac5bbd7058e013a8aa60e",
		signSignature: "",
		signatures: null,
		confirmations: "809",
		args: null,
		message: "",
		asset: {
			uiaTransfer: {
				transactionId: "a1ff79e3f37fd73b41abd293c22171ac7760160ad457e55f028e7a8b527651d3",
				currency: "absorb.YLB",
				amount: "200000000",
				amountShow: "2",
				precision: 8
			}
		}
	},
	{
		id: "7cf50223e12b6eb51096353a066befcf2ef862bdd4d4eddcba28a79aa0249af9",
		height: "809",
		blockId: "278b096893bc028bb79692faec02de8c2f367804485b71f14e46027f3dd3000c",
		type: 14,
		timestamp: 39182041,
		senderPublicKey: "b33b5fc45640cfc414981985bf92eef962c08c53e1a34f90dab039e985bb5fab",
		senderId: "AMzDw5BmZ39we18y7Ty9VW79eL9k7maZPH",
		recipientId: "1",
		amount: 0,
		fee: 10000000,
		signature: "560bd31a4efe103ef9bd92f52cae5cf5a3b2aeb90fc83298498ff4126705e0433f751169bc32a3a7cfe894c7d8586d7182ebc790f2311daf9f02b881dc2aca0e",
		signSignature: "",
		signatures: null,
		confirmations: "43",
		args: null,
		message: "",
		asset: {
			uiaTransfer: {
				transactionId: "7cf50223e12b6eb51096353a066befcf2ef862bdd4d4eddcba28a79aa0249af9",
				currency: "absorb.YLB",
				amount: "100000000",
				amountShow: "1",
				precision: 8
			}
		}
	}],
	count: 2
}
```   

#### **2.10.12 资产创建相关**   
下面没有内容的章节请参考《2.9.3》章节。
##### **2.10.12.1 注册资产发行商**  
##### **2.10.12.2 注册资产**  
##### **2.10.12.3 更新资产访问控制列表(acl)**  
##### **2.10.12.4 资产发行**  
##### **2.10.12.5 资产转账**  
接口地址：/api/uia/transfers   
请求方式：PUT   
支持格式：json   
接口备注：   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |发送者密码,最大长度100       |   
|currency |string |Y    |资产名，最大长度22       |   
|amount |string |Y    |转账金额，最大长度50       |   
|recipientId |string |Y    |接收地址，最小长度1       |  
|publicKey|string|N|发送者公钥，格式必须符合公钥格式|  
|secondSecret|string|N|发送者二级密码，最小长度1，最大长度：100|   
|multisigAccountPublicKey|string|N|多签账户公钥，格式必须符合公钥格式|   
|message|string|N|转账备注，最大长度256| 

   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据。|    
|transactionId|string  |交易id      |    
   
   
请求示例：   
```bash   
// 转0.01 absorb.YLB给16723473400748954103
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"found knife gather faith wrestle private various fame cover response security predict","amount":"1000000","recipientId":"16723473400748954103","currency":"absorb.YLB"}' 'http://localhost:4096/api/uia/transfers' && echo   
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactionId": "3cb6d97534a3b90cf7fc883927f0a9a7c7f4878a9df526c2906ca97e250fcaba"   
}   
```  

##### **2.10.12.6 更新黑白名单**  



### **2.11 存储storages**   
源码在src/core/transactions.js文件中，适合存储短文。
#### **2.11.1 上传数据**
##### **2.11.1.1 上传数据(直接上传)**
接口地址：/api/storages   
请求方式：PUT   
支持格式：json   
接口备注：   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|secondSecret|string|N|发送者二级密码，最小长度1，最大长度：100|   
|content|string|Y|上传数据内容|   
|encode|string|N|上传数据的格式，可选项为：raw/base64/hex，默认为raw|   
|wait|number|N|等待确认数，范围为0-6，默认为0。wait为0表示不等待，速度最快，但无法保证数据在掉电情况下不丢失，大于2时，可以100%确保数据已经同步到大部分机器上了，但需要时间较长10-20秒之间，折中的方案是1,wait为1时虽然不能100%保证同步到其他机器，但失败的几率非常小，只是理论上存在，实际上还没遇到过|  

   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据。|    
|transactionId|string  |交易id      |    
   
   
请求示例：   
```bash   
// 将字符串"helloworld"用base64进行编码
console.log(new Buffer('helloworld').toString('base64'));
aGVsbG93b3JsZA==
// Asch用base64方式存储刚才得到的编码值"aGVsbG93b3JsZA=="
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"motion group blossom coral upper warrior pattern fragile sister misery palm detect","secondSecret":"erjimima001","content":"aGVsbG93b3JsZA==","encode":"base64","wait":1}' http://localhost:4096/api/storages && echo
```   
   
JSON返回示例：   
```js   
{   
	"success": true,   
	"transactionId": "2ae89f859f20e6e9be7aeef5f7ff7b8c6a457ff712100a1b694436bddd9800c0"   
}   
```  

##### **2.11.1.2 上传数据(签名后再上传)**

POST接口规格如下：
payload为asch-js创建出来的交易数据
接口地址：/peer/transactions  
请求方式：post   
支持格式：json  

请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch账户密码       |   
|secondSecret|string|N|发送者二级密码，最小长度1，最大长度：100|   
|content|string|Y|上传数据内容，必须是hex格式|   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据。|    
|transactionId|string  |交易id      |    
   
   
请求示例：   
```  
var AschJS = require('asch-js');
// 一级密码
var secret = 'motion group blossom coral upper warrior pattern fragile sister misery palm detect'
// 二级密码
var secondSecret = 'erjimima001'
// 将字符串"helloworld"用base64进行编码
var content = new Buffer('helloworld').toString('base64')
aGVsbG93b3JsZA==

// Asch用base64方式存储刚才得到的编码值"aGVsbG93b3JsZA=="
var trs = AschJS.storage.createStorage(content, secret, secondSecret)
console.log(JSON.stringify(trs))
{"type":8,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":20587956,"asset":{"storage":{"content":"aGVsbG93b3JsZA=="}},"__assetBytes__":{"type":"Buffer","data":[]},"signature":"9663a7f54fd1c18c2447ada61326c34e1cb3ff417089b48e28c25196ebd4a648532782da2a2344de01100c896e568287c2445716f7ac096ff5972bcdf45d850a","signSignature":"60dcfc71cd93d09509c3384b5fa0311de2f31050628efb784e782d9dd39f9a76e76fc09dd03d73165853a194bb59a9d224c960d693c000490d83e58df5fbdd00"}

// 将生成的交易信息广播出去
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":8,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575","timestamp":20587956,"asset":{"storage":{"content":"aGVsbG93b3JsZA=="}},"__assetBytes__":{"type":"Buffer","data":[]},"signature":"9663a7f54fd1c18c2447ada61326c34e1cb3ff417089b48e28c25196ebd4a648532782da2a2344de01100c896e568287c2445716f7ac096ff5972bcdf45d850a","signSignature":"60dcfc71cd93d09509c3384b5fa0311de2f31050628efb784e782d9dd39f9a76e76fc09dd03d73165853a194bb59a9d224c960d693c000490d83e58df5fbdd00"}}' 'http://localhost:4096/peer/transactions' && echo
```   
   
JSON返回示例：   
```js   
{
	"success": true,
	"transactionId": "0e009c7b5b732bc8d78a7ff98462f74d57706a8b3a32ac31d5ab67fede5d4c8d"
}
```  

#### **2.11.2 根据交易id查询存储的数据-1**  
接口地址：/api/storages/get   
请求方式：GET   
支持格式：urlencode   
请求参数说明：   

|名称	|类型   |必填 |说明              |   
|------ |-----  |---  |----              |   
|id |string |Y    |交易id    |   
   
返回参数说明：   

|名称	|类型   |说明              |   
|------ |-----  |----              |   
|success|boole  |是否成功获得response数据。|    
|id|string  |交易id      |    
   
   
请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X GET http://localhost:4096/api/storages/get/?id=2ae89f859f20e6e9be7aeef5f7ff7b8c6a457ff712100a1b694436bddd9800c0 && echo   
```   
   
JSON返回示例：   
```js   
{
	"success": true,
	"id": "2ae89f859f20e6e9be7aeef5f7ff7b8c6a457ff712100a1b694436bddd9800c0",   // 交易id
	"height": "180182", // 交易所在区块高度
	"blockId": "b59e579a002297557003856fd4cc2b10ac72d3384a5d2a8aece5f906019d79ab",  // 交易所在区块id
	"type": 8,  // 交易类型，8代表存储信息
	"timestamp": 19552678,  // 交易时间，举例创世块的offset
	"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575",   // 上传者公钥
	"senderId": "16358246403719868041", // 上传者id
	"recipientId": "",
	"amount": 0,
	"fee": 10000000,    // 交易费。0.1XAS
	"signature": "8a8a256ab16c9cc966f2b975cf5ce39f13f4f13ae4a60f8c6bdfbe94e2e4ee4cb79c3be80630a5c15289d7e959e50dba5f711e9956781b150185ca9d8519f50b", // 交易签名
	"signSignature": "46431039f7e15f3147ca6991e6b46a856741b8566aeb54af97dd73d8d3e03b69eb74693c87d4ce1ef4aa2fb69d56c710681494a013fcf747de24d7ea4e79740f", // 二级签名，有二级密码时才有
	"signatures": null, // 多重签名，使用多重签名账户时才有
	"confirmations": "68",  // 交易确认数
	"asset": {
		"storage": {
			"content": "68656c6c6f776f726c64"   // 数据内容，16进制字符串
		}
	}
}  
// 将得到的16进制（hex）格式的字符串"68656c6c6f776f726c64"转为文本字符串正好是"helloworld"
console.log(new Buffer('68656c6c6f776f726c64','hex').toString());
helloworld
```  

#### **2.11.3 根据交易id查询存储的数据-2**  
接口地址：/api/storages/:id   
请求方式：GET   
支持格式：urlencode   
请求参数说明：交易id  
备注：与/api/storages/get功能相同   

请求示例：   
```bash   
curl -k -H "Content-Type: application/json" -X GET http://localhost:4096/api/storages/2ae89f859f20e6e9be7aeef5f7ff7b8c6a457ff712100a1b694436bddd9800c0 && echo   
```   

JSON返回示例：   
```js   

```



## **附录1：asch-js安装**   
asch系统的所有写操作都是通过发起一个交易来完成的。    
交易数据通过一个叫做asch-js的库来创建，然后再通过一个POST接口发布出去   
**库安装**   
npm install asch-js   


