Table of Contents
=================

   * [Asch-HTTP Interface Specification](#asch-http-interface-specification)
      * [1 API Usage Guide](#1-api-usage-guide)
         * [1.1 Request Process Overview](#11-request-process-overview)
      * [2 Interface](#2-interface)
         * [2.1 Accounts](#21-accounts)
            * [2.1.1 Login](#211-login)
               * [2.1.1.1 Login after locally encrypt (recommended)](#2111-login-after-locally-encrypt-recommended)
               * [2.1.1.2 Login without locally encrypt (not recommend)](#2112-login-without-locally-encrypt-not-recommend)
            * [2.1.2 Get Account Information](#212-get-account-information)
            * [2.1.3 Get Balance of Account](#213-get-balance-of-account)
            * [2.1.4 Get Account's Public Key](#214-get-accounts-public-key)
            * [2.1.5 Generate Public Key](#215-generate-public-key)
            * [2.1.6 Get Voting List by Address](#216-get-voting-list-by-address)
            * [2.1.7 Get the Fee of Given Delegate](#217-get-the-fee-of-given-delegate)
            * [2.1.8 Voting](#218-voting)
         * [2.2 Transactions](#22-transactions)
            * [2.2.1 Get the Transaction Detail Information](#221-get-the-transaction-detail-information)
            * [2.2.2 Get the Transaction Detail Information by Transaction ID](#222-get-the-transaction-detail-information-by-transaction-id)
            * [2.2.3 Get Transaction Detail by Unconfirmed Transaction ID](#223-get-transaction-detail-by-unconfirmed-transaction-id)
            * [**2.2.4 Get Unconfirmed Transaction Detail Inforamtion [within all network]](#224-get-unconfirmed-transaction-detail-inforamtion-within-all-network)
            * [2.2.5 Create Transaction](#225-create-transaction)
         * [2.3 Blocks](#23-blocks)
            * [2.3.1 Get the Block Detail Information of the Given ID](#231-get-the-block-detail-information-of-the-given-id)
            * [2.3.2 Get the Latest Block](#232-get-the-latest-block)
            * [2.3.3 Get the Block Height](#233-get-the-block-height)
            * [2.3.4 Get the Transaction Fee](#234-get-the-transaction-fee)
            * [2.3.5 Get the Milestone](#235-get-the-milestone)
            * [2.3.6 Get the Reward Information of a Block](#236-get-the-reward-information-of-a-block)
            * [2.3.7 Get the Current Maximum Supply of the Blockchain](#237-get-the-current-maximum-supply-of-the-blockchain)
            * [2.3.8 Get Current Status of Blockchain](#238-get-current-status-of-blockchain)
         * [2.4 Delegates](#24-delegates)
            * [2.4.1 Get the Total Number of Delegates](#241-get-the-total-number-of-delegates)
            * [2.4.2 Check the Voters of Delegates by Public Key](#242-check-the-voters-of-delegates-by-public-key)
            * [2.4.3 Get the Delegate's Detail by Public Key or Name](#243-get-the-delegates-detail-by-public-key-or-name)
            * [2.4.4 Get the List of Delegates](#244-get-the-list-of-delegates)
            * [2.4.5 Get the Transaction Fee Set by Delegate](#245-get-the-transaction-fee-set-by-delegate)
            * [2.4.6 Get Forge Information by Public Key](#246-get-forge-information-by-public-key)
            * [2.4.7 Register Delegate](#247-register-delegate)
         * [2.5 Peers](#25-peers)
            * [2.5.1 Get all Peers' Information in the Whole Network](#251-get-all-peers-information-in-the-whole-network)
            * [2.5.2 Get the Version of Peer](#252-get-the-version-of-peer)
            * [2.5.3 Get the Peer Information of a Given IP Address](#253-get-the-peer-information-of-a-given-ip-address)
         * [2.6 Sync and Loader](#26-sync-and-loader)
            * [2.6.1 Get the local blockchain loadig status](#261-get-the-local-blockchain-loadig-status)
            * [2.6.2 Get the block syncing status](#262-get-the-block-syncing-status)
         * [2.7 Second Password](#27-second-password)
            * [2.7.1 Set the Second Password](#271-set-the-second-password)
            * [2.7.2 Get the Transaction Fee of Setting Second Password](#272-get-the-transaction-fee-of-setting-second-password)
         * [2.8 Multiple Signatures](#28-multiple-signatures)
            * [2.8.1 Set Normal Account to Multi-signatures Account](#281-set-normal-account-to-multi-signatures-account)
            * [2.8.2 Get the Detail Information of Pending Multi-signature Transaction](#282-get-the-detail-information-of-pending-multi-signature-transaction)
            * [2.8.3 Sign the Multi-signature Transaction (by non-initiator)](#283-sign-the-multi-signature-transaction-by-non-initiator)
            * [2.8.4 Get Detail Information of the Multi-signature Account](#284-get-detail-information-of-the-multi-signature-account)
         * [2.9 Peer to Peer Transportation[secure API]](#29-peer-to-peer-transportationsecure-api)
            * [2.9.1 Overview](#291-overview)
            * [2.9.2 Transaction](#292-transaction)
               * [2.9.2.1 Set the Second Payment Password](#2921-set-the-second-payment-password)
               * [2.9.2.2 Transfer Money](#2922-transfer-money)
               * [2.9.2.3 Register Delegates](#2923-register-delegates)
               * [2.9.2.4 Vote and Cancel the vote](#2924-vote-and-cancel-the-vote)
      * [Appendix 1： Install 'asch-js' library](#appendix-1-install-asch-js-library)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)

# Asch-HTTP Interface Specification

---
## 1 API Usage Guide
### 1.1 Request Process Overview
- **Generate request data:** according the interface specification provided by Asch system, generate the request data as a JSON object. (In one case, if you write about secure peer to peer transportation, you may need a JS library called asch-js to create signature. see [2.9 Peer to Peer transportation](# 29-peer-to-peer-transportation) for detail).
- **Send request data:** transfer the generated data object to Asch  platform through POST/GET method upon HTTP
- **Asch system handles the data object:** after receiving the data object, Asch server will validate the data firstly, then deal with it.
- **Return the response data:** Asch system send the response data to client as a JSON object. See interface part for detail, like response data format and error code.
- **Client handles the response data**

## 2 Interface   
### 2.1 Accounts   
   
#### 2.1.1 Login   
##### 2.1.1.1 Login after locally encrypt (recommended)   
Interface Address: /api/accounts/open2/   
Request Type: post   
Supported Format: json   
Comment: Public key needs to be generated locally according to user's password (see Request Example)   

Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |Asch account public key       |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |Whether login is successful      |    
|account|json   |Account Information          |    
Request Example:   
  
```js
var AschJS = require('asch-js');  //For further information about asch-js, please see Appendix
var publicKey = AschJS.crypto.getKeys(secret).publicKey;  //Generate public key according to password 
// var address = AschJS.crypto.getAddress(publicKey);   //Generate address according to public key

// Submit the above data to Asch server through post method   
curl -X POST -H "Content-Type: application/json" -k -d '{"publicKey":"bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"}' http://45.32.248.33:4096/api/accounts/open2/   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"account": {   
		"address": "16723473400748954103",   
		"unconfirmedBalance": 19480000000,   
		"balance": 19480000000,   
		"unconfirmedSignature": false,   
		"secondSignature": true,   
		"secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",   
		"multisignatures": [],   
		"u_multisignatures": []   
	},   
	"latestBlock": {   
		"height": 111923,   
		"timestamp": 4446270   
	},   
	"version": {   
		"version": "1.0.0",   
		"build": "12:11:11 16/08/2016",   
		"net": "testnet"   
	}   
```   
   
##### 2.1.1.2 Login without locally encrypt (not recommend)   
Interface Address: /api/accounts/open/   
Request Method:post   
Supported Format: json   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |asch account password       |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |Whether login is successful      |    
|account|json   |Account information          |    
   
Request Example:   
```bash   
curl -X POST -H "Content-Type: application/json" -k -d '{"secret":"fault still attack alley expand music basket purse later educate follow ride"}' http://45.32.248.33:4096/api/accounts/open/   
```   
   
JSON Response Example:   
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
#### 2.1.2 Get Account Information   
Interface Address: /api/accounts   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|address |string |Y    |Client's address, minimum length:1      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |whether response data can be returned |    
|account|json  |account information      |    
|latestBlock|json  |latest block information      |    
|version|json  |version information      |    
   
Request Example:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/accounts?address=16723473400748954103   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"account": {   
		"address": "16723473400748954103",  //Asch address   
		"unconfirmedBalance": 19480000000,  //the sum of unconfirmed and confirmed balance, that should be larger than or equal to balance below.   
		"balance": 19480000000, //balance   
		"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",    //Public key   
		"unconfirmedSignature": false,   
		"secondSignature": true,    //second signature   
		"secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",  //second public key   
		"multisignatures": [],    
		"u_multisignatures": []   
	},   
	"latestBlock": {   
		"height": 114480,   //block height   
		"timestamp": 4471890   
	},   
	"version": {   
		"version": "1.0.0",   
		"build": "12:11:11 16/08/2016", //build date   
		"net": "testnet"    //blockchain type: main chain or test one   
	}   
}   
```   
#### 2.1.3 Get Balance of Account   
Interface Address: /api/accounts/getBalance   
Request Method: get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|address |string |Y    |Client's address, minimum length:1      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|balance|integer  |balance      |    
|unconfirmedBalance|integer|the sum of unconfirmed and confirmed balance, that should be larger than or equal to balance|   
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/getBalance?address=14636456069025293113'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"balance": 5281328514990,   
	"unconfirmedBalance": 5281328514990   
}   
```   
   
#### 2.1.4 Get Account's Public Key   
Interface Address: /api/accounts/getPublickey   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|address |string |Y    |Client's address, minimum length:1     |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|publicKey|string  |public key      |    
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/getPublickey?address=14636456069025293113'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7"   
}   
```   
   
#### 2.1.5 Generate Public Key   
Interface Address: /api/accounts/generatePublickey   
Request Method: post   
Supported Format: json   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |Asch account password     |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|publicKey|string  |public key      |    
   
Request Example:   
```bash   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"fault still attack alley expand music basket purse later educate follow ride"}' 'http://45.32.248.33:4096/api/accounts/generatePublickey'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"   
}   
```   
   
#### 2.1.6 Get Voting List by Address   
Interface Address: /api/accounts/delegates   
Request Method: get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|address |string |Y    |Voter's address      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|delegates|Array  |A list that contains detail information of those delegates who have already voted   |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/delegates?address=14636456069025293113'   
```   
   
JSON Response Example:   
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
   
#### 2.1.7 Get the Fee of Given Delegate   
Interface Address: /api/accounts/delegates/fee   
Request Method:get   
Supported Format: none   
Request Parameter Description: none  

Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|fee|integer  |fee setting      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/delegates/fee  
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"fee": 100000000   
}   
```   
   
   
#### 2.1.8 Voting   
Interface Address: /api/accounts/delegates   
Request Method:put   
Supported Format: json   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |Asch account password       |   
|publicKey|string  |N|public key      |    
|secondSecret|string|N|Asch account's second password，minimum length：1，maximum length：100|   
|delegates|Array|a list that contains delegates' public key. put +/- in front of each public key, which means vote/abolish this delegate. |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transaction|json  |voting detail inforamtion      |    
   
   
Request Example:   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"call scissors pupil water friend timber spend brand vote obey corn size","publicKey":"3ec1c9ec08c0512641deba37c0e95a0fe5fc3bdf58424009f594d7d6a4e28a2a","delegates":["+fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575"]}' 'http://45.32.248.33:4096/api/accounts/delegates'     
```   
   
JSON Response Example:   
```js   
 {
	"success": true,
	"transaction": {
		"type": 3,  //the type of vote is '3'
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
   
### 2.2 Transactions   
#### 2.2.1 Get the Transaction Detail Information   
Interface Address: /api/transactions   
Request Method: get   
Supported Format: urlencoded   
Comment： if there is no parameter in request data, all network transactions will be returned.    
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|blockId |string |N    |block id      |   
|limit |integer |N    |the limitation of returned records，minimum：0,maximum：100   |   
|type|integer  |N      |The transaction type,0:normal transfer，1:setting second password，2:registering delegate，3:voting，4:multiple signature，5:DAPP，6:IN_TRANSFER，7:OUT_TRANSFER      |   
|orderBy|string  |N      |sort with a field in the table，senderPublicKey:desc  |   
|offset|integer  |N      |offset, minimum 0  |   
|senderPublicKey|string|N|sender's public key|   
|ownerPublicKey|string|N||   
|ownerAddress|string|N||   
|senderId|string|N|sender's address|   
|recipientId|string|N|recipient's address, minimum:1|   
|amount|integer|N|amount|   
|fee|integer|N|charge fee|   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transactions|Array  |A JSON object list containing multiple transactions' detail      |    
|count|int|the total number of retrieved transactions|   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions?recipientId=16723473400748954103&orderBy=t_timestamp:desc&limit=3'   
```   
   
JSON Response Example:   
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
#### 2.2.2 Get the Transaction Detail Information by Transaction ID
Interface Address: /api/transactions/get   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|Id |string |Y    |transaction id      |   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transactions|json  |transaction detail information      |    
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions/get?id=14093929199102906687'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transaction": {   
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
		"confirmations": "34268",   
		"asset": {   
		}   
	}   
}   
```   
   
#### 2.2.3 Get Transaction Detail by Unconfirmed Transaction ID   
Interface Address: /api/transactions/unconfirmed/get   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|id|string |Y    |unconfirmed transaction id      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transaction|json  |unconfirmed transaction detail inforamtion      |   
   
   
Request Example:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/transactions/unconfirmed/get?id=7557072430673853692  //Regularly, this unconfirmed transaction exist during an extremely short time, almost 0~10 second. 
```   
   
JSON Response Example:   
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
   
   
#### **2.2.4 Get Unconfirmed Transaction Detail Inforamtion [within all network]
Interface Address: /api/transactions/unconfirmed   
Request Method:get   
Supported Format: urlencoded   
Comment: If there is no parameter, all unconfirmed transactions in the whole network will be returned.
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|senderPublicKey |string |N    |sender's public key      |   
|address |string |N    |address      |   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transactions|Array  |a list containing all unconfirmed transactions      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions/unconfirmed'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transactions": []      //Currently there is no unconfirmed transaction in the whole network 
}   
```   
   
#### 2.2.5 Create Transaction   
Interface Address: /api/transactions   
Request Method:PUT   
Supported Format: json   
Comment: Recipiant acount must have already login in wallet on the web.  
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |Asch account password       |   
|amount|integer|Y|amount，between 1 and 10000000000000000|   
|recipientId|string|Y|recipient's address, minimum:1|   
|publicKey|string|N|sender's public key|   
|secondSecret|string|N|sender's second password (must fit the BIP39 standard), the length should be between 1 and 100|   
|multisigAccountPublicKey|string|N|the public key of multiple signature account|   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transactionId|string  |transaction id      |    
   
   
Request Example:   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","amount":1000000,"recipientId":"16723473400748954103"}' 'http://45.32.248.33:4096/api/transactions'    
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transactionId": "16670272591943275531"   
}   
```   
   
### 2.3 Blocks
#### 2.3.1 Get the Block Detail Information of the Given ID   
Interface Address: /api/blocks/   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|id |string |only choose one of these three parameters    |block ID      |   
|height|string|ditto|block height|   
|hash|string|ditto|block hash value|   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|block|json  |the block detail information      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/get?id=6076474715648888747'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"block": {   
		"id": "6076474715648888747",   
		"version": 0,   
		"timestamp": 4734070,   
		"height": 140538,   
		"previousBlock": "16033230167082515105",    //previous block ID   
		"numberOfTransactions": 0,  //The number of transactions   
		"totalAmount": 0,   //the total transactions' amount   
		"totalFee": 0,   
		"reward": 350000000,    //reward   
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
   
#### 2.3.2 Get the Latest Block  
Interface Address: /api/blocks   
Request Method: get   
Supported Format: urlencoded   
Comment: if there is no parameter, the detail of all the blocks in the whole network will be returned  
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|limit |integer |N    |maximum number of returned records, between 0 and 100   |   
|orderBy|string  |N      |sort by a field in the table, for example, height:desc  |   
|offset|integer  |N      |offset, minimum 0  |   
|generatorPublicKey|string  |N      |public key of the block generator  |   
|totalAmount|integer  |N       |total amount of transactions, from 0 to 10000000000000000 |   
|totalFee|integer  |N      |total fee of transaction, from 0 to 10000000000000000  |   
|reward|integer  |N      |the amount of reward, minimum: 0  |   
|previousBlock|string  |N      |previous block  |   
|height|integer  |N      |block height  |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|blocks|Array  |a list of JSON objects containing block detail|    
|count|integer|block height|   
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks?limit=2&offset=0&orderBy=height:desc'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"blocks": [{   
		"id": "12634047624004615059",   
		"version": 0,   
		"timestamp": 4708080,   
		"height": 137986,   
		"previousBlock": "3498191422350401106",   
		"numberOfTransactions": 0,  // the number of transactions   
		"totalAmount": 0,   // total amount of transactions   
		"totalFee": 0,  // transaction fee   
		"reward": 350000000,    // reward   
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
   
#### 2.3.3 Get the Block Height   
Interface Address: /api/blocks/getHeight   
Request Method:get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|height|integer  |block height      |    
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getheight'    
```   
   
JSON Response Example:   
```js   
{"success":true,"height":140569}   
```   
   
#### 2.3.4 Get the Transaction Fee   
Interface Address: /api/blocks/getFee   
Request Method:get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|fee|integer  |transaction fee     |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getfee'   
```   
   
JSON Response Example:   
```js   
{"success":true,"fee":10000000}     //transaction fee is 
0.1 XAS   
```   
   
#### 2.3.5 Get the Milestone   
Interface Address: /api/blocks/getMilestone   
Request Method: get   
Supported Format: none   
Request Parameter Description: none   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|milestone|integer  |      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getMilestone'    
```   
   
JSON Response Example:   
```js   
{"success":true,"milestone":0}   
```   
   
#### 2.3.6 Get the Reward Information of a Block 
Interface Address: /api/blocks/getReward   
Request Method:get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|reward|integer  |the reward of the block      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getReward'   
```   
   
JSON Response Example:   
```js   
{"success":true,"reward":350000000} //every single block you created will be rewarded by 3.5 XAS   
```   
   
#### 2.3.7 Get the Current Maximum Supply of the Blockchain
Interface Address: /api/blocks/getSupply   
Request Method:get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|supply|integer  |the total amount of XAS in the whole network      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getSupply'   
```   
   
JSON Response Example:   
```js   
{"success":true,"supply":10049222600000000} //There are totally 100492226 XAS in current testnet   
```   
   
#### 2.3.8 Get Current Status of Blockchain  
Interface Address: /api/blocks/getStatus   
Request Method:get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|height|integer  |blockchain height      |    
|fee|integer  |transaction fee      |    
|milestone|integer  |      |    
|reward|integer  |block reward      |    
|supply|integer  |total amount of XAS in the whole network      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getStatus'   
```   
   
JSON Response Example:   
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
   
   
   
### 2.4 Delegates  
   
#### 2.4.1 Get the Total Number of Delegates 
Interface Address: /api/delegates/count   
Request Method: get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|count|integer   |total number of delegates      |    
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/count'   
```   
   
JSON Response Example:   
```js   
{"success":true,"count":234}   
```   
   
#### 2.4.2 Check the Voters of Delegates by Public Key   
Interface Address: /api/delegates/voters   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |public key of the delegate      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|accounts|Array  |a JSON object list of account    |    
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/voters?publicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
JSON Response Example:   
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
   
#### 2.4.3 Get the Delegate's Detail by Public Key or Name   
Interface Address:  /api/delegates/get/   
Request Method:get   
Supported Format: urlencoded   
Comment:Get the delegate's detail by his/her public key or user name      
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|publickey |string |choose only one parameter of these two    |delegate's public key      |   
|username  |string |ditto    |delegate's user name      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|delegate|json  |the detail information of this delegate      |    
   
   
Request Example:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/delegates/get?publicKey=bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9   
curl -k -X GET http://45.32.248.33:4096/api/delegates/get?username=delegate_register   
```   
   
JSON Response Example:   
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
   
#### 2.4.4 Get the List of Delegates   
Interface Address: /api/delegates   
Request Method:get   
Supported Format: urlencoded   
Comment: if there is no parameter, all delegates in the whole network will be returned. 
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|address |string |N    |delegate's address      |   
|limit|int  |N       |maximum return records       |   
|offset|integer  |N       |offset, minimum: 0      |   
|orderBy|string  |N       |[field used to sort]:[sort type] e.g., address:desc      |   
   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|delegates|Array  |a list containing delegates' detail information      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates?orderby=approval:desc&limit=2' //the first two delegates order by approval vote, descendingly  
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"delegates": [{   
		"username": "wgl_002",  //delegate's user name   
		"address": "14636456069025293113",  //delegate's address   
		"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",    //delegate's public key   
		"vote": 9901984015600500,   //the number of vote   
		"producedblocks": 1371, //the number of generated blocks   
		"missedblocks": 6,  //the number of missed blocks   
		"fees": 12588514990,       
		"rewards": 276850000000,    //the gained reward   
		"rate": 1,   
		"approval": 98.54,  //the rate of approval votes   
		"productivity": 99.56,  //the productivity   
		"forged": "289438514990"    //All reward from forge   
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
   
   
   
   
   
   
#### 2.4.5 Get the Transaction Fee Set by Delegate 
Interface Address: /api/delegates/fee   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |delegate's public key      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|fee|integer  |transaction fee      |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/fee?publicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
JSON Response Example:   
```js   
{"success":true,"fee":10000000000}  //0.1 XAS   
```   
   
#### 2.4.6 Get Forge Information by Public Key 
Interface Address: /api/delegates/forging/getForgedByAccount   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|generatorPublicKey |string |Y    |block generator's public key      |   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|fees|integer  |total amount of charged fee      |    
|rewards|integer|gained rewards|   
|forged|integer|total rewards comming from forge|   
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/forging/getForgedByAccount?generatorPublicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"fees": 12589307065,   
	"rewards": 285600000000,   
	"forged": 298189307065   
}   
```   
   
#### 2.4.7 Register Delegate
Interface Address: /api/delegates   
Request Method:put   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |Asch account password       |   
|publicKey|string  |N      |public key|    
|secondSecret|string|N|Asch account's second password, minimum length:1 maximum length: 100 |   
|username|string|N|the delegate's user name|   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transaction|json  |the detail of the registering process      |    
   
   
Request Example:   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","username":"delegate_0821"}' 'http://45.32.248.33:4096/api/delegates'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transaction": {   
		"type": 2,  //the transaction type of registering delegate is 2   
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
   
### 2.5 Peers 
   
#### 2.5.1 Get all Peers' Information in the Whole Network   
Interface Address: /api/peers   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|state |integer |N    |peer's status: 0:,1:,2:,3:     |   
|os|string|N|Linux kernel version|   
|version|string|N|Asch system version|   
|limit |integer |N    |maximum return records, minimum:0, maximum: 100|   
|orderBy|string|N||   
|offset|integer  |N      |offset, minimum 0  |   
|port|integer|N|port number，1~65535|   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|peers|Array  |a JSON array of peers' information |    
|totalCount|integer|the number of currently running peers|   
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/peers?limit=1'   
```   
   
JSON Response Example:   
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
   
#### 2.5.2 Get the Version of Peer
Interface Address: /api/peers/version   
Request Method:get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|version|string  |version number     |    
|build  |timestamp |built time     |    
|net    |string  |if the peer is mainnet or testnet     |   
   
   
Request Example:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/peers/version   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"version": "1.0.0",   
	"build": "12:11:11 16/08/2016",   
	"net": "testnet"   
}   
```   
   
#### 2.5.3 Get the Peer Information of a Given IP Address   
Interface Address: /api/peers/get   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|ip |string |Y    |peer's IP      |   
|port|integer|Y|peer's port，1~65535|   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|peer|json  | peer's information     |    
   
   
Request Example:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/peers/get?ip=45.32.248.33&port=4096'   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"peer": {   
	}   
}   
```   
   
### 2.6 Sync and Loader  
#### 2.6.1 Get the local blockchain loadig status   
Interface Address: /api/loader/status   
Request Method: get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|loaded |bool    |          |   
|blocksCount|integer||   
   
Request Example:   
```bash   
curl -k http://45.32.248.33:4096/api/loader/status -X GET   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"loaded": true,   
	"blocksCount": 0   
}   
```   
   
#### 2.6.2 Get the block syncing status
Interface Address: /api/loader/status/sync   
Request Method: get   
Supported Format: none   
Request Parameter Description: none   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|height |int    |block height          |   
   
Request Example:   
```bash   
curl -k http://45.32.248.33:4096/api/loader/status/sync -X GET   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"syncing": false,  // show whether in synchronising. if yes, it will be "true". if there is no data to synchronise, it will be "false" 
	"blocks": 0,   
	"height": 111987   
}   
```   
   
### 2.7 Second Password   
#### 2.7.1 Set the Second Password
Interface Address: /api/signatures   
Request Method: put   
Supported Format: json   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |Asch account's password       |   
|publicKey|string  |N|public key      |    
|secondSecret|string|Y|Asch account's second password，minimum length：1，maximum length：100|   
|multisigAccountPublicKey|string|N|the public key of multi signatures account|   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transaction|json  |the detail information of setting transaction   |    
   
   
Request Example:   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","secondSecret":"fault still attack alley expand music basket purse later educate follow ride"}' 'http://45.32.248.33:4096/api/signatures'    
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transaction": {   
		"type": 1,  //the transaction type of setting second password is 1  
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
		"fee": 500000000,       //the transaction fee of setting second password is 5 XAS   
		"senderId": "250438937633388106"   
	}   
}   
```   
   
#### 2.7.2 Get the Transaction Fee of Setting Second Password
Interface Address: /api/signatures/fee   
Request Method:get   
Supported Format: none   
Request Parameter Description: none   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|fee|integer  |transaction fee     |    
   
   
Request Example:   
```bash   
curl -k http://45.32.248.33:4096/api/signatures/fee -X GET   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"fee": 500000000         //5 XAS   
}     
```   
   
### 2.8 Multiple Signatures 
#### 2.8.1 Set Normal Account to Multi-signatures Account
Interface Address: /api/multisignatures   
Request Method: put   
Supported Format: json   
Comment: the return value is transaction ID only. To successfully set to multi-signature account still needs other's signatures. Every transaction after registered as multi-signatures account will be asked for multiple signatures. The minimum necessary signatures is defined by "min" (include sender itself) 
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |Asch account's password       |   
|publicKey|string  |N|public key      |    
|secondSecret|string|N|Asch account's second password, minimum length:1 maximum length: 100|   
|min|integer|Y|the minimum signatures that is required to each transaction for multi-signatures account. (When the transaction is to register multi-signature account, this parameter will not work since everyone needs to sign.) Minimum:2, maximum:16. This number must not be larger than keysgroup.length+1. |   
|lifetime|integer|Y|the maximum pending time of multi-signature transaction. Minimum:1, maximum:24. NOTE: this parameter is not available currently.|   
|keysgroup|array|Y|an array containing other signaturers' public key. There are plus/minus (+/-) in front of each public key, means add or delete multi-signature account respectively. Minimum length:1, maximum length:10.|   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transactionId|string  |the multi-signature transaction ID     |    
   
   
Request Example:   
```bash   
curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"vanish deliver message evil canyon night extend unusual tell prosper issue antenna","min":2,"lifetime":1,"keysgroup":["+eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97","+d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"]}' 'http://45.32.248.33:4096/api/multisignatures'  //公钥为2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transactionId": "17620378998277022323"     //only transaction ID is returned. To successfully set to multi-signature account needs other accounts' signatures.   
}   
```   
   
#### 2.8.2 Get the Detail Information of Pending Multi-signature Transaction
Interface Address: /api/multisignatures/pending   
Request Method:get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|publicKey|string  |Y|public key      |    
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transactions|Array  |a JSON object list containing those pending transactions      |    
   
   
Request Example:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transactions": [{      //the detail information of the setting multi-signature account transaction (see 2.8.1, transactionId: 17620378998277022323)  
		"min": 2,   
		"lifetime": 1,   
		"signed": true,   
		"transaction": {   
			"type": 4,      //4 means registering multi-signature account   
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
   
#### 2.8.3 Sign the Multi-signature Transaction (by non-initiator)   
Interface Address: /api/multisignatures/sign   
Request Method:post   
Supported Format: json   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|secret |string |Y    |Asch account's password       |   
|secondSecret|string|N|Asch account second password. Minimum length:1, maximum length:100|   
|publicKey|string  |N|public key      |    
|transactionId|string|Y|transaction ID|   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|transactionId|string  |multi-signature transaction ID      |    
   
   
Request Example:   
```bash   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"lemon carpet desk accuse clerk future oyster essay seminar force live dog","transactionId":"17620378998277022323"}' 'http://45.32.248.33:4096/api/multisignatures/sign'   //signed by a user whose public key is eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"transactionId": "17620378998277022323"   
}   
// Now get the pending transaction again   
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
			"signatures": ["b38a161264db2a23e353d3fbc4983562f6343d5ee693144543ca54e2bc67c0f73d1c761b7bfa38b2bb101ac2ab0797b674b1a9964ccd400aaa310746c3494d03"]      //new multi-signature generated   
		}   
	}]   
}   
   
// a user whose public key is "d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb" sign this registering transaction   
curl -k -H "Content-Type: application/json" -X POST -d '{"secret":"chalk among elbow piece badge try van round quality position simple teach","transactionId":"17620378998277022323"}' 'http://45.32.248.33:4096/api/multisignatures/sign'   
{"success":true,"transactionId":"17620378998277022323"}   
// trying to get pending transaction again, but this time there isn't any of it.   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
{"success":true,"transactions":[]}   
// Check the detail of this transaction. (at this time, this transaction has been broadcasted to the whole network and been written to the blockchain) Now the account has already registered as a multi-signature account. 
curl -k -X GET http://45.32.248.33:4096/api/transactions/get?id=17620378998277022323   
{   
	"success": true,   
	"transaction": {   
		"id": "17620378998277022323",   //the registering transaction ID   
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
   
#### 2.8.4 Get Detail Information of the Multi-signature Account
Interface Address: /api/multisignatures/accounts   
Request Method: get   
Supported Format: urlencoded   
Request Parameter Description:    

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|publicKey |string |Y    |One of the participants‘ public key      |   
   
   
Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |true: response data return successfully |    
|accounts|Array  |the detail of this multi-signature account   |    
   
   
Request Example:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/accounts?publicKey=eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97   
```   
   
JSON Response Example:   
```js   
{   
	"success": true,   
	"accounts": [{   
		"address": "3855903394839129841",       //the address of this multi-signature account   
		"balance": 18500000000,     //the balance of this multi-signature account   
		"multisignatures": ["eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
		"d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"],    //the public key of this multi-signature account   
		"multimin": 2,  //minimum required signature  
		"multilifetime": 1,   
		"multisigaccounts": [{          //the detail of signer's account  
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

### 2.9 Peer to Peer Transportation[secure API]  
#### 2.9.1 Overview 
To request a peer related API, it is required to set a header like this:  

 - key=magic, and value=594fe0f3  
 - key=version, and value=''  

#### 2.9.2 Transaction 
All the writing operations in Asch system are finished by starting a transaction.
The transaction data is generated through a JS library named "asch-js", and then broadcasted by a POST API.
The POST API specification is as follows:

payload: transaction data generated by asch-js
API Address: /peer/transactions  
Request Method: POST   
Supported Format: JSON  

##### 2.9.2.1 Set the Second Payment Password 
Request Parameter Description:  

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|transaction data generated by [asch-js.signature.createSignature]|

Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |whether the transaction is successful |  
   
   
Request Example:   
```js   
var asch = require('asch-js');    
var transaction = asch.signature.createSignature('measure bottom stock hospital calm hurdle come banner high edge foster cram','erjimimashezhi001')       
console.log(JSON.stringify(transaction))  
{"type":1,"amount":0,"fee":500000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5328943,"asset":{"signature":{"publicKey":"27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b"}},"signature":"71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a","id":"15605591820551652547"}   

// submit above data of setting second password to Asch server by POST method
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":1,"amount":0,"fee":500000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5328943,"asset":{"signature":{"publicKey":"27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b"}},"signature":"71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a","id":"15605591820551652547"}}' http://45.32.248.33:4096/peer/transactions   
```   
   
JSON Response Example:   
```js  
{
    "success":true  //setting is successful
}	
``` 

##### 2.9.2.2 Transfer Money
Request Parameter Description:   

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|transaction data generated by [asch-js.transaction.createTransaction]|

Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |whether the transaction is successful |  
   
   
Request Example:   
```js   
var asch = require('asch-js');   
var targetAddress = "16358246403719868041";  
var amount = 100*100000000;   //100 XAS
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';

// in above code, password is recorded when user logs in. meanwhile the second password needs to be input every time by user.
// To input or not depends on whether user has second password, which can be identified by "user.secondPublicKey" function.

var transaction = asch.transaction.createTransaction(targetAddress, amount, password, secondPassword || undefined);       
JSON.stringify(transaction)
'{"type":0,"amount":10000000000,"fee":10000000,"recipientId":"16358246403719868041","timestamp":5333378,"asset":{},"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","signature":"2d47810b7d9964c5c4d330a53d1382769e5092b3a53639853f702cf4a382aafcff8ef8663c0f6856a23f41c249944f0c3cfac0744847268853a62af5dd8fc90a","signSignature":"dfa9b807fff362d581170b41c56a2b8bd723c48d1f100f2856d794408723e8973016d75aeff4705e6837dcdb745aafb41aa10a9f1ff8a77d128ba3d712e90907","id":"16348623380114619131"}'

// submit above data of transfer to Asch server by POST method
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":0,"amount":10000000000,"fee":10000000,"recipientId":"16358246403719868041","timestamp":5333378,"asset":{},"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","signature":"2d47810b7d9964c5c4d330a53d1382769e5092b3a53639853f702cf4a382aafcff8ef8663c0f6856a23f41c249944f0c3cfac0744847268853a62af5dd8fc90a","signSignature":"dfa9b807fff362d581170b41c56a2b8bd723c48d1f100f2856d794408723e8973016d75aeff4705e6837dcdb745aafb41aa10a9f1ff8a77d128ba3d712e90907","id":"16348623380114619131"}}' http://45.32.248.33:4096/peer/transactions
```   
   
JSON Response Example:   
```js  
{
    "success":true  //transfer success
}		
``` 

##### 2.9.2.3 Register Delegates   
Request Parameter Description:  

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|transaction data generated by [asch-js.delegate.createDelegate]|

Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |whether transaction is success |  
   
   
Request Example:   
```js   
var asch = require('asch-js');   
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';
var userName = 'zhenxi_test';  

var transaction = asch.delegate.createDelegate(password, userName, secondPassword || undefined);   
JSON.stringify(transaction)  
'{"type":2,"amount":0,"fee":10000000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334485,"asset":{"delegate":{"username":"zhenxi_test","publicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f"}},"signature":"a12ce415d2d21ab46e4c1b918b8717b1d351dd99abd6f2f94d9a1a7e1f32b697f843a05b1851cb857ea45a2476dce592f5ddd612c00cd44488b8b610c57d7f0a","signSignature":"35adc9f1f37d14458e8588f9b4332eedf1151c02480159f64a287a4b0cbb59bfe82040dfec96a4d9560bae99b8eaa1799a7023395db5ddc640d95447992d6e00","id":"12310465407307249905"}'

// submit above data of registering delegate to Asch server by POST method
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":2,"amount":0,"fee":10000000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334485,"asset":{"delegate":{"username":"zhenxi_test","publicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f"}},"signature":"a12ce415d2d21ab46e4c1b918b8717b1d351dd99abd6f2f94d9a1a7e1f32b697f843a05b1851cb857ea45a2476dce592f5ddd612c00cd44488b8b610c57d7f0a","signSignature":"35adc9f1f37d14458e8588f9b4332eedf1151c02480159f64a287a4b0cbb59bfe82040dfec96a4d9560bae99b8eaa1799a7023395db5ddc640d95447992d6e00","id":"12310465407307249905"}}' http://45.32.248.33:4096/peer/transactions
```   
   
JSON Response Example:   
```js  
{
    "success":true  //register successfully
}		
``` 

##### 2.9.2.4 Vote and Cancel the vote  

Request Parameter Description: 

|Name	|Type   |Required |Description              |   
|------ |-----  |---  |----              |   
|transaction|json|Y|transaction data generated by [asch-js.vote.createVote]|

Response Parameter Description:   

|Name	|Type   |Description              |   
|------ |-----  |----              |   
|success|bool  |whether the transaction is successful |  
   
   
Request Example:   
```js   
var asch = require('asch-js');   
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';
// the voting content is a list in which each item consists of a symbol (+ or -) and the delegate's public key. The "+" means vote, and "-" means cancel the vote.
var voteContent = [
    '-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7',
    '+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2'
];

var transaction = asch.vote.createVote(password, voteContent, secondPassword || undefined);
JSON.stringify(transaction)
{"type":3,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334923,"asset":{"vote":{"votes":["-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7","+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2"]}},"signature":"6036c2066a231c452a1c83aafd3bb9db3842ee05d5f17813f8264a4294cdec761faa89edf4a95f9b2e2451285807ab18aa9f989ad9a3165b95643179b8e4580f","signSignature":"a216ca739112e6f65986604b9467ccc8058138a7077faf134d6c4d673306cd1c514cc95bd54a036f7c602a56c4b4f2e4e59f6aa7c376cb1429e89054042e050b","id":"17558357483072606427"}

// submit above data of vote/cancel vote to Asch server by POST method
curl -H "Content-Type: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":3,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334923,"asset":{"vote":{"votes":["-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7","+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2"]}},"signature":"6036c2066a231c452a1c83aafd3bb9db3842ee05d5f17813f8264a4294cdec761faa89edf4a95f9b2e2451285807ab18aa9f989ad9a3165b95643179b8e4580f","signSignature":"a216ca739112e6f65986604b9467ccc8058138a7077faf134d6c4d673306cd1c514cc95bd54a036f7c602a56c4b4f2e4e59f6aa7c376cb1429e89054042e050b","id":"17558357483072606427"}}' http://45.32.248.33:4096/peer/transactions
```   
   
JSON Response Example:   
```js  
{
    "success":true  //transaction of vote/cancel the vote is success
}		
``` 

   
## Appendix 1： Install 'asch-js' library   
All the writing operations in Asch system are finished by starting a transaction.
The transaction data is generated through a JS library named "asch-js", and then broadcasted by a POST API.
  
**Install the library**   
`npm install asch-js`   
   