title: 'DApp Development Tutorial 2: Asch DApp Asset'
---

In the previous tutorial we introduced the basic procedure of Asch DApp development. In this tutorial, we are about to create a DApp with inbuilt asset, and then to introduce the common protocols and interfaces between front-end and back-end.

# 1 Create a DApp with inbuilt asset

Don't be confused by the article's title, because creating inbuilt asset is a very simple thing. Creating inbuilt asset has just two more steps of common than creating a hello-world application.

In a step of creating DApp in the last tutorial we were asked if a inbuilt is required. And we chose "No" by default to create Hello-world. This time, let's try "Yes":

```
? Do you want publish a inbuilt asset in this dapp? yes
```

Then there will be a new scenario:

```
? Enter asset name, for example: BTC, CNY, USD, MYASSET CNY
# you need to input the unit or abbreviation of the asset name, which can be any string less then 16 characters.

? Enter asset total amount 1000000
# you need to input the total amount, in units of 1000000
```

And the rest of the procedure is as same as that of creating "hello-world" application.

Finally once we log in the DApp, we can notice that there is an asset customized by ourselves in our account. Also we can send this asset to another account via in-chain transfer.

Currently `asch-cli` can only create one type of inbuilt asset. Our development team will consider to more other assets if there were such demands. 

Actually developers can set more than one type of inbuilt asset when they create genesis block. The detail information can be found in [asch-cli source code](https://github.com/sqfasd/asch-cli)。

# 2 The communication protocol between front and back end

Usually the interface provided by DApp back-end has the format like`/api/dapps/<dapp id>/api/method`

For example, we used three kinds of interface in hello-world project:

**Login**

```
post /api/dapps/<dapp id>/api/openAccount

# The secret field is requred to use this interface, which will bring some security risks
# If you can access the public key in front end, the following interface will be more safe:

post /api/dapps/<dapp id>/api/openAccount2
```

**In-chain transaction**

```
put /api/dapps/<dapp id>/api/transaction
```

**Withdrawal**

```
post /api/dapps/<dapp id>/api/withdrawal
```

More detail of other interface can be found in `router.json`

For example

**Get the block list**

```
{
		"path": "/blocks",
		"method": "get",
		"handler": "blockchain.blocks.getBlocks"
	}
```

**Get the unconfirmed transaction list**

```
{
		"path": "/transactions",
		"method": "get",
		"handler": "blockchain.transactions.getTransactions"
	}
```

**Add delegates**

```
	{
		"path": "/delegates",
		"method": "put",
		"handler": "blockchain.delegates.addDelegates"
	}
```

More methods are provided by sidechain framework, but there is no API available. Developers can configure these APIs by themselves.