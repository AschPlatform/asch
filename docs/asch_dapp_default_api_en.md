Table of Contents
=================


- [Asch Dapp Default API](#asch-dapp-default-api)
    - [**1 Blocks**](#1-blocks)
        - [**1.1 Get the Dapp Block Height**](#11-get-the-dapp-block-height)
        - [**1.2 Get Dapp Block Data**](#12-get-dapp-block-data)
    - [**2 Accounts**](#2-accounts)
        - [**2.1 Get Information to a Single Account**](#21-get-information-to-a-single-account)
    - [**3 Transactions**](#3-transactions)
        - [**3.1 Signature**](#31-signature)
            - [**3.1.1 Client signed transaction - more secure**](#311-client-signed-transaction---more-secure)
                - [**3.1.1.1 Dapp Recharge**](#3111-dapp-recharge)
                - [**3.1.1.2 Dapp Money, Type=2**](#3112-dapp-money-type2)
                - [**3.1.1.2 Dapp Internal Transfer,Type=3**](#3112-dapp-internal-transfertype3)
                - [**3.1.1.2 Dapp set a Nickname, Type=4**](#3112-dapp-set-a-nickname-type4)
            - [**3.1.2 Server Side Signed Transaction (unsigned)**](#312-server-side-signed-transaction-unsigned)
                - [**3.1.2.1 Dapp recharge**](#3121-dapp-recharge)
                - [**3.1.2.2 Dapp withdrawal, Type=2**](#3122-dapp-withdrawal-type2)
                - [**3.1.2.2 Dapp Internal Transfer, Type=3**](#3122-dapp-internal-transfer-type3)
                - [**3.1.2.2 set a dapp nickname, type=4**](#3122-set-a-dapp-nickname-type4)
        - [**3.2 Get unconfirmed transactions**](#32-get-unconfirmed-transactions)
        - [**3.3 Get already confirmed transactions**](#33-get-already-confirmed-transactions)
        - [**3.4 Get transaction details for one transaction by id**](#34-get-transaction-details-for-one-transaction-by-id)
        - [**3.5 Obtain dapp transfer records**](#35-obtain-dapp-transfer-records)
    - [**4 Smart Contract**](#4-smart-contract)
        - [**4.1 Get all smart contracts for one Dapp**](#41-get-all-smart-contracts-for-one-dapp)


# Asch Dapp Default API

This documents describes the default API that every Dapp inherits from the asch-sandbox.

## **1 Blocks**
### **1.1 Get the Dapp Block Height** 
API Endpoint: /api/dapps/dappID/blocks/height   
HTTP Header: GET
Supported Format: urlencode   
  
Return Parameter:

|Name	  |Type   |Description       |   
|------ |-----  |----              |   
|success|boolean|Was the operation successful |   
|height |integer|Dapp Block Height |   
 
Example:
```bash   
curl -k -H "Content-Type: application/json" -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/blocks/height && echo   
```   

JSON Response:
```js
{
	height: 10,
	success: true
}
```


### **1.2 Get Dapp Block Data**
API Endpoint: /api/dapps/dappID/blocks
HTTP Header: GET
Supported Format: urlencode
Endpoint Description: Get all blocks from the Dapp

Request Parameters:

|Name	  |Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|limit |integer |No    |Limit the number of results, Minimum: 0, Maximum: 100  |   
|orderBy|string  |No      |Sort by a field of the table, e.g. height:desc (sorts after height descending)  |   
|offset|integer  |No     |Offset, Minimum: 0 |   
|generatorPublicKey|string  |No      |The public key of the generator of this block.  |   
|totalAmount|integer  |No       |Total amount of transactions, Minimum: 0, Maximum: 10000000000000000 |   
|totalFee|integer  |No      |Total fee, Minimum: 0，Maximum: 10000000000000000  |   
|previousBlock|string  |No      |Previous Block  |   
|height|integer  |No      |Block height  |    

Return Parameter:

|Name	|Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |   
|count|integer  |A number indicating how many blocks being returned      |   
|blocks|Array  |Each element of the returned array carries the data of one block, like id, height and other information|
        

Example:   
```bash   
curl -k -H "Content-Type: application/json" -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/blocks?limit=1 && echo   
``` 

JSON Response:
```js   
{    
	blocks: [{    
		id: "451dd17f273ea5fbd240238178c1343b11031a1d309ee8b29e8b1a5838473ec6",    
		timestamp: 0,    
		height: 1,    
		payloadLength: 103,    
		payloadHash: "995f4749e1924af55f1cdefd202efd0b37b2aa70553982378c037bc6015d5634",    
		prevBlockId: "",    
		pointId: "",    
		pointHeight: 0,    
		delegate: "8065a105c785a08757727fded3a06f8f312e73ad40f1f3502e0232ea42e67efd",    
		signature: "b1d0171494ce6c0621902c6005f7a85e15f3509a68ac6106b166abf711ced73efaeaf1eae0cdf594143854e27b417b253485cf98b3cc9f7aa967a929b717020b",    
		count: 1    
	}],    
	count: 133,    
	success: true    
}   
```

## **2 Accounts**
### **2.1 Get Information to a Single Account** 
API Endpoint: /api/dapps/dappID/accounts/:address   
HTTP Header: GET
Supported Format: urlencode
Request Parameter:
  
|Name   |Type   |Required   |Description   |   
|------ |-----  |---        |----          |   
|address |string|Yes        |Asch Address|   
  
Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |   
|account|json  |All information regarding one account such as: Asset balances, is the address a delegate? and other information|
  
  
Example:   
```bash   
curl -k -H "Content-Type: application/json" -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/accounts/ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M && echo   
```   

JSON Response:   
```js   
{    
	account: {    
		balances: [{    
			currency: "XAS", // this account has a XAS balance (either through a recharge or a dapp transfer)   
			balance: "10000000000"  // 100 XAS
		}],    
		extra: null,    
		isDelegate: false // is not a delegate
	},    
	success: true    
}  
```


## **3 Transactions**  
### **3.1 Signature**
The HTTP Endpoint is devided into signed und unsigned. Either will the transaction be signed locally and then send to the server (sigend) or the secret must be send to the server and there the transaction will be signed (unsigned).

#### **3.1.1 Client signed transaction - more secure**
Peer related API, you need to set the a header at a request.

 - key is magic, testnet: 594fe0f3, mainnet: 5f5b3cf5
 - key version is '' (empty)

All write operations in Asch are started with a transaction.
The transaction data is created through a library called `asch-js` and then published via a POST interface.
The HTTP-POST API specification are as follows:

|Matter   |Description  |
|---    |---   |
|API Endpoint|/peer/transactions  |
|payload|transaction data that was created with `asch-js`|
|HTTP Method|post/put etc.|
|Supported format|json |
  
##### **3.1.1.1 Dapp Recharge**  
API Endpoint: /peer/transactions  
HTTP Header: POST   
Supported Format: json   
Note: When the recharge occurs in the main chain (transaction-type 6, intransfer) then the Dapp will automatically call the smart contract number 1 for a dapp internal recharge.

Request Parameter:

|Name   |Type   |Required   |Description   |
|------ |-----  |---  |----              |   
|transaction|json|Yes|A transaction generated with a function call to aschJS.transfer.createInTransfer|

  
Return Parameter: 

|Name   |Type   |Description   |
|------ |-----  |----              |
|success|boolean  |Was the operation successful?     |
|transactionId|string  |Transaction id|
  
Example:   
```js   
var aschJS = require('asch-js');    
var dappid = "bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024";  
var currency = "XAS";  
var amount = 10*100000000 ;  
var secret = "found knife gather faith wrestle private various fame cover response security predict";  
var secondSecret = "";
var transaction = aschJS.transfer.createInTransfer(dappid, currency, amount, secret, secondSecret || undefined);  
 
console.log(JSON.stringify(transaction));    
{
	"type":6,
	"amount":1000000000,
	"fee":10000000,
	"recipientId":null,
	"senderPublicKey":"2856bdb3ed4c9b34fd2bba277ffd063a00f703113224c88c076c0c58310dbec4",
	"timestamp":39721503,
	"asset":
	{
		"inTransfer":
		{
			"dappId":"bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024",
			"currency":"XAS"
		}
	},"signature":"8cefc8fa933e4d5e8699828dc8cd5d1b4737ffa82175c744fd681bad0b1a6b68526e0783e85d7979f894fc38850bd2ed0a983ce3cb3f5d16b68fd37dfb9dfb0a",
	"id":"4b580f8f61f4586920a4c0d37b6fad21daf3453fe9ccc5426c2cae7a263c160c"
}  
// transction type:6 means dapp recharge

// This "recharage" transaction will be send to the asch server
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":6,"amount":1000000000,"fee":10000000,"recipientId":null,"senderPublicKey":"2856bdb3ed4c9b34fd2bba277ffd063a00f703113224c88c076c0c58310dbec4","timestamp":39721503,"asset":{"inTransfer":{"dappId":"bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024","currency":"XAS"}},"signature":"8cefc8fa933e4d5e8699828dc8cd5d1b4737ffa82175c744fd681bad0b1a6b68526e0783e85d7979f894fc38850bd2ed0a983ce3cb3f5d16b68fd37dfb9dfb0a","id":"4b580f8f61f4586920a4c0d37b6fad21daf3453fe9ccc5426c2cae7a263c160c"}}' http://localhost:4096/peer/transactions && echo    

```
JSON Response:
```js   
{    
	"success": true,    
	"transactionId": "4b580f8f61f4586920a4c0d37b6fad21daf3453fe9ccc5426c2cae7a263c160c"    
}  
```

##### **3.1.1.2 Dapp Money, Type=2**
API Endpoint: /api/dapps/dappID/transactions/signed
HTTP Header: PUT
Supported Format: json
Request Parameter:

|Name   |Type   |Required   |Description   |   
|------ |-----  |---  |----              |   
|dappID|string|Yes|Dapp Id|
|transaction|json|Yes|Transaction data generated by a function call to aschJS.dapp.createInnerTransaction|

  
Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |
|transactionId|string  |Transaction Id|


Example:   
```js
var aschJS = require('asch-js');   
var fee = String(0.1 * 100000000);  
var type = 2;  
var options = 
{
	fee: fee, 
	type: type, 
	args: '["CCTime.XCT", "100000000"]'
};  
var secret = "elite brush pave enable history risk ankle shrimp debate witness ski trend";  
var transaction = aschJS.dapp.createInnerTransaction(options, secret);  
 
console.log(JSON.stringify(transaction));    
{
	"fee":"10000000",
	"timestamp":40384202,"senderPublicKey":"aa4e4ac1336a1e9db1ee5ce537a59d3fcb0f068cb4b25aac9f48e0e8bc6259c9",
	"type":2,
	"args":"[\"CCTime.XCT\", \"100000000\"]",
	"signature":"05dba744705fd1dbc1854b415392364cdbae11778671be8eb5fdbce57855a87b3dde5bf2d0219059411253fb304497758422c8d1546ec45eb5521b4a6577d507"
}

// The Money withdraw transaction (type=2) is send to the server
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X PUT -d '{"transaction":{"fee":"10000000","timestamp":40384202,"senderPublicKey":"aa4e4ac1336a1e9db1ee5ce537a59d3fcb0f068cb4b25aac9f48e0e8bc6259c9","type":2,"args":"[\"CCTime.XCT\", \"100000000\"]","signature":"05dba744705fd1dbc1854b415392364cdbae11778671be8eb5fdbce57855a87b3dde5bf2d0219059411253fb304497758422c8d1546ec45eb5521b4a6577d507"}}' http://localhost:4096/api/dapps/d352263c517195a8b612260971c7af869edca305bb64b471686323817e57b2c1/transactions/signed && echo
```

JSON Response:
```js
{
	"success": true,    
	"transactionId": "8bcae742206bf236214b9972efaca0bbe29f3703b4055a14cc8b095546880dc4"    
}
```

##### **3.1.1.2 Dapp Internal Transfer,Type=3**  
API Endpoint: /api/dapps/dappID/transactions/signed  
HTTP Header: PUT   
Supported Format: json   
Request Parameter:  
  
|Name   |Type   |Required   |Description   |   
|------ |-----  |---  |----              |   
|dappID|string|Yes|Dapp Id|
|transaction|json|Yes|Transaction data generated by a function call to aschJS.dapp.createInnerTransaction|  

  
Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?|   
|transactionId|string  |Internal Transfer Transaction Id|   
  
Example:
```js
var aschJS = require('asch-js');   
var fee = String(0.1 * 100000000);  
var type = 3;  
var options = {fee: fee, type: type, args: '["CCTime.XCT", "100000000", "A6H9rawJ7qvE2rKwQfdtBHdeYVehB8gFzC"]'};  
var secret = "elite brush pave enable history risk ankle shrimp debate witness ski trend";  
var transaction = aschJS.dapp.createInnerTransaction(options, secret);  
 
console.log(JSON.stringify(transaction));    
{
	"fee":"10000000",
	"timestamp":40387708,"senderPublicKey":"aa4e4ac1336a1e9db1ee5ce537a59d3fcb0f068cb4b25aac9f48e0e8bc6259c9",
	"type":3,
	"args":"[\"CCTime.XCT\", \"100000000\", \"A6H9rawJ7qvE2rKwQfdtBHdeYVehB8gFzC\"]",
	"signature":"e2364534b8c4b0735a85c68ba17fddf5321fc48af04d483ad05531d4993058eaa35ff44d913a03b6d7278890ff7f42435f8313e08ce70c523dfc256b4de9e303"
}

// The cash withdrawal transaction data is send to the server
 将上面生成的“提现”交易数据通过post提交给asch server  
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X PUT -d '{"transaction":{"fee":"10000000","timestamp":40387708,"senderPublicKey":"aa4e4ac1336a1e9db1ee5ce537a59d3fcb0f068cb4b25aac9f48e0e8bc6259c9","type":3,"args":"[\"CCTime.XCT\", \"100000000\", \"A6H9rawJ7qvE2rKwQfdtBHdeYVehB8gFzC\"]","signature":"e2364534b8c4b0735a85c68ba17fddf5321fc48af04d483ad05531d4993058eaa35ff44d913a03b6d7278890ff7f42435f8313e08ce70c523dfc256b4de9e303"}}'  http://localhost:4096/api/dapps/d352263c517195a8b612260971c7af869edca305bb64b471686323817e57b2c1/transactions/signed && echo    

```   

JSON Response:   
```js   
{    
	"success": true,    
	"transactionId": "e2687a471ac2ddbbdd919266e58b0b652c55f74402b27be850d767fa44162c79"    
}  
```

##### **3.1.1.2 Dapp set a Nickname, Type=4**  
API Endpoint: /api/dapps/dappID/transactions/signed  
HTTP Header: PUT   
Supported Format: json   
Request Parameter:  
  
|Name   |Type   |Required   |Description   |   
|------ |-----  |---  |----              |   
|dappID|string|Yes|Dapp Id|
|transaction|json|Yes|Transaction data generated by a function call to aschJS.dapp.createInnerTransaction|

  
Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |   
|transactionId|string  |The TransactionId for the set nickname operation|   
  
Example:   
```js
var aschJS = require('asch-js');
var fee = String(0.1 * 100000000);
var type = 4;  
var options = {fee: fee, type: type, args: '["Nickname"]'};  // specify the nickname in
var secret = "elite brush pave enable history risk ankle shrimp debate witness ski trend";  
var transaction = aschJS.dapp.createInnerTransaction(options, secret);  
 
console.log(JSON.stringify(transaction));    
{
	"fee":"10000000",
	"timestamp":40388287,"senderPublicKey":"aa4e4ac1336a1e9db1ee5ce537a59d3fcb0f068cb4b25aac9f48e0e8bc6259c9",
	"type":4,
	"args":"[\"Nickname\"]",
	"signature":"be08cdb2f4d1a0f2f2e5b02e33e67fdf43e403703ce35cb42a2dc7338c7a352adca56dc61e3be0fedc1727c1adc0101f1a9e1a3e67ac0623602bf872deb80802"
}

// 将上面生成的“提现”交易数据通过post提交给asch server  
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X PUT -d '{"transaction":{"fee":"10000000","timestamp":40388287,"senderPublicKey":"aa4e4ac1336a1e9db1ee5ce537a59d3fcb0f068cb4b25aac9f48e0e8bc6259c9","type":4,"args":"[\"Nickname\"]","signature":"be08cdb2f4d1a0f2f2e5b02e33e67fdf43e403703ce35cb42a2dc7338c7a352adca56dc61e3be0fedc1727c1adc0101f1a9e1a3e67ac0623602bf872deb80802"}}' http://45.32.22.78:4096/api/dapps/d352263c517195a8b612260971c7af869edca305bb64b471686323817e57b2c1/transactions/signed && echo    

```   

JSON Response:   
```js   
{
	"success": true,    
	"transactionId": "7teae742206bf236214b9972efaca0bbe29f3703b4055a14cc8b095546880dc4"  
}
```

#### **3.1.2 Server Side Signed Transaction (unsigned)**  
##### **3.1.2.1 Dapp recharge**
##### **3.1.2.2 Dapp withdrawal, Type=2**  
API Endpoint: /api/dapps/dappId/transactions/unsigned    
HTTP Header: PUT
Supported Format: json
Request Parameter:  
  
|Name   |Type   |Required   |Description   |   
|------ |-----  |---  |----              |   
|secret|string|Yes|Asch secret|  
|fee|string|Yes|Transaction fee, currently fixed at 10000000  |  
|type|integer|Yes|Smart contract type |  
|args|string Array|Yes|The string Array must contain the contract type|


Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |   
|transactionId|string  |Withdrawal transaction Id   |   

Example:
```bash
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X PUT -d  '{"secret":"elite brush pave enable history risk ankle shrimp debate witness ski trend","fee":"10000000","type":2,"args":"[\"CCTime.XCT\",\"100000000\"]"}' 'http://localhost:4096/api/dapps/d352263c517195a8b612260971c7af869edca305bb64b471686323817e57b2c1/transactions/unsigned' && echo

```
JSON Response:   
```js
{
	"success": true,
	"transactionId": "f59d365cbc8ea29f5d3798af795dc66dbdda00e2f1ae6677d5c7239180f3e98a"
}
```

##### **3.1.2.2 Dapp Internal Transfer, Type=3**  
API Endpoint: /api/dapps/dappId/transactions/unsigned    
HTTP Header: PUT
Supported Format: json   
Request Parameter:  
  
|Name   |Type   |Required   |Description   |
|------ |-----  |---  |----              |
|secret|string|Yes|Asch secret |
|fee|string|Yes|  |  
|type|integer|Yes|The number of the smart contract |  
|args|string array|Yes|The corresponding contract number needs to be passed in |

  
Return Parameter: 

|Name   |Type   |Description   |
|------ |-----  |----              |
|success|boolean  |Was the operation successful?     |
|transactionId|string  |Internal transfer transacation Id|

Example:
```bash
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X PUT -d  '{"secret":"elite brush pave enable history risk ankle shrimp debate witness ski trend","fee":"10000000","type":3,"args":"[\"CCTime.XCT\",\"1000000000\",\"ADimyhJa99XFzVrbnTYsCqPB4TKQNdjCWw\"]"}' 'http://localhost:4096/api/dapps/d352263c517195a8b612260971c7af869edca305bb64b471686323817e57b2c1/transactions/unsigned' && echo   

```

JSON Response:
```js
{    
	"success": true,    
	"transactionId": "96d886b7d724e6a00cc8c52c24b674ec8a9fc7fd8145a326bf69983fdc74a006"    
}  
```

##### **3.1.2.2 set a dapp nickname, type=4**  
API Endpoint: /api/dapps/dappId/transactions/unsigned    
HTTP Header: PUT
Supported Format: json   
Request Parameter:  
  
|Name   |Type   |Required   |Description   |
|------ |-----  |---  |----              |
|secret|string|Yes|asch password |
|fee|string|Yes|Transaction fee, currently 10000000|
|type|integer|Yes|Smart contract number |
|args|string array|Yes|对应合约编号需要传入的参数，这里是昵称 |

  
Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?|   
|transactionId|string  |Set nickname transaction id|   
  
Example:   
```bash   
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X PUT -d  '{"secret":"minor borrow display rebel depart core buzz right distance avocado immense push","fee":"10000000","type":4,"args":"[\"zhenxi\"]"}' 'http://localhost:4096/api/dapps/d352263c517195a8b612260971c7af869edca305bb64b471686323817e57b2c1/transactions/unsigned' && echo  
```   

JSON Response:   
```js   
{    
	"success": true,    
	"transactionId": "7b5d9d13cf718ee28efde6bae85fbefbcd0eca3d6c0c6fff1421a1102d730669"    
}  
```

### **3.2 Get unconfirmed transactions** 
API Endpoint: /api/dapps/dappID/transactions/unconfirmed    
HTTP Header: GET   
Supported Format: urlencode   

Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |   
|transactions|array  |A list of unconfirmed transactions|


Example:   
```bash   
curl -k -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/transactions/unconfirmed && echo   
```   

JSON Response:   
```js   
{    
	"transactions": [],    
	"success": true    
}  
```

### **3.3 Get already confirmed transactions** 
API Endpoint: /api/dapps/dappID/transactions   
HTTP Header: GET   
Supported Format: urlencode   
Request Parameter:  
  
|Name   |Type   |Required   |Description   |   
|------ |-----  |---  |----              |   
|senderId |string |No|Address of sender |
|type |interger |No|contract number |
|limit |interger |No|Limit the ressult set, default is 100|   
|offset |interger |No|Offset |  


Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |
|transactions|array  |List of confirmed transactions|
|count|integer  |The total number of transactions that met the query conditions|
  
Example:   
```bash   
curl -k -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/transactions?senderId=AJTGR8EGsprrF7r63D2XLDftGAKUu1Ucjn && echo   
```   

JSON Response:   
```js   
{
    "transactions": [{
        "id": "b12b144b3dbb76b70cd62f97e3d3b0606d97c0f402bba1fb973dd2d3ab604a16",
        "timestamp": 0,
        "senderId": "AJTGR8EGsprrF7r63D2XLDftGAKUu1Ucjn",
        "senderPublicKey": "27823f51a3dddd475943fb8142380d2f8722b0f6c651f6ac37930b63666c7803",
        "fee": "0",
        "signature": "22739bb762ff0135a0c4199507e3c45a8615c467bfeb4efa5110802033959698588e39b76d037445e02959ee67b483ac4d24f12304181f4955871cdcd28e3001",
        "type": 3,
        "args": "[\"CNY\",\"100000000000000\",\"A8QCwz5Vs77UGX9YqBg9kJ6AZmsXQBC8vj\"]",
        "height": 1
    }],
    "count": 1,
    "success": true
}   
```

### **3.4 Get transaction details for one transaction by id** 
API Endpoint: /api/dapps/dappID/transactions/:id   
HTTP Header: GET   
Supported Format: urlencode   
Request Parameter:  
  
|Name   |Type   |Required   |Description   |
|------ |-----  |---  |----              |
|id |string |Yes|Transaction Id|

Return Parameter: 

|Name   |Type   |Description|
|------ |-----  |----              |
|success|boolean  |Was the operation successful?|
|transaction|dict  |The requested transaction|
  
  
Example:   
```bash   
curl -k -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/transactions/7088c67edd43326276453b833727677df6f312271b824564a6a934371265f0dc && echo     
```   

JSON Response:   
```js   
{
	"transaction": {
		"id": "7088c67edd43326276453b833727677df6f312271b824564a6a934371265f0dc",
		"timestamp": 39709980,
		"senderId": "ADYGpYHmgkbukqByZ2JzwFXZM6wYfMXCaR",
		"senderPublicKey": "55ad778a8ff0ce4c25cb7a45735c9e55cf1daca110cfddee30e789cb07c8c9f3",
		"fee": "0",
		"signature": "bd51295c3373da2a92c77b6a96a0edbda75cdcde5fd7824ff326c366ed0ec5778e1d02e7d9c280a219d6c815d9bfdbc2d03bb960a0f5d8d35458e4bda87d6104",
		"type": 1,
		"args": "[\"XAS\",\"10000000000\",\"2f1db0014483ffef85289e086af321e374944668dd7fb4f156c70609276ed903\",\"ANH2RUADqXs6HPbPEZXv4qM8DZfoj4Ry3M\"]",
		"height": 637
	},
	"success": true
}
```

### **3.5 Obtain dapp transfer records**
API Endpoint: /api/dapps/dappID/transfers   
HTTP Header: GET   
Supported Format: urlencode   
Request Parameter:  
  
|Name   |Type   |Required   |Description   |
|------ |-----  |---  |----              |
|ownerId |string |No|At least one of the following have to exists: Sender-Address, OwernId, Currency| 
|currency |string |No|At least one of the following have to exist: Token name, OwnerId, Currency|
|limit |interger |No|Limits the return list, default is 10|
|offset |interger |No|Offset, default 0|

Return Parameter: 

|Name   |Type   |Description|
|------ |-----  |----              |
|success|boolean|Was the operation successful?|
|transfers|array|Get the transfers that met the query|
|count|integer|The number of transfers that got returned|

Example:
```bash
curl -k -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/transfers?ownerid=ADYGpYHmgkbukqByZ2JzwFXZM6wYfMXCaR && echo
```

JSON Response:   
```js   
{
	"count": 1,
	"transfers": [{
		"tid": "b12b144b3dbb76b70cd62f97e3d3b0606d97c0f402bba1fb973dd2d3ab604a16",
		"senderId": "AJTGR8EGsprrF7r63D2XLDftGAKUu1Ucjn",
		"recipientId": "A8QCwz5Vs77UGX9YqBg9kJ6AZmsXQBC8vj",q
		"currency": "CNY",
		"amount": "100000000000000",
		"t_timestamp": 0,
		"t_type": 3,
		"t_height": 1
	}],
	"success": true
} 
```

## **4 Smart Contract**
### **4.1 Get all smart contracts for one Dapp** 
API Endpoint: /api/dapps/dappID/contracts   
HTTP Header: GET
Supported Format: urlencode

Return Parameter: 

|Name   |Type   |Description   |   
|------ |-----  |----              |   
|success|boolean  |Was the operation successful?     |   
|contracts|array  |Each element is a object with the following properties: type (number), contract name (string)|   


Example:
```bash
curl -k -H "Content-Type: application/json" -X GET http://localhost:4096/api/dapps/bebe3c57d76a5bbe3954bd7cb4b9e381e8a1ba3c78e183478b4f98b9d532f024/contracts && echo   
```

JSON Response: 
```js   
{
	contracts: [{    
		type: "1",    
		name: "core.deposit" // built-in contract, recharge (from the main chain to dapp within the asset reload), ordinary users can not be called directly (the trustee can call this contract but the operation can not be verified by other nodes), when the main chain transaction-type=9 (intransfer) the smart contract will automatically call app recharge
	},    
	{    
		type: "2",    
		name: "core.withdrawal" // built-in contract, this operation transfers the asset from the dapp-sidechain to the mainchain
	},
	{
		type: "3",
		name: "core.transfer" // built-in contract, dapp internal transfers including XAS and UIA
	},
	{
		type: "4",
		name: "core.setNickname" // built-in contract, set nickname for dapp address
	},
	{
		type: "1000",
		name: "cctime.postArticle" // custom contract, publish article
	},
	{
		type: "1001",
		name: "cctime.postComment" // custom contract, post a comment
	},
	{
		type: "1002",
		name: "cctime.voteArticle" // custom contract, vote for an article
	},
	{
		type: "1003",
		name: "cctime.likeComment" // custom contract, reward for comments
	},
	{
		type: "1004",
		name: "cctime.report" // custom contract, report articles
	}],
	success: true
}
```