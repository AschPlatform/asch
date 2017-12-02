# DApp Development Tutorial 3: Asch DApp Mini DAO

After warming up with two previous tutorials, let us start a realistic project. It is time for us to create a new transaction type or smart contract.


## 1 Create contract

Firstly, let us go into the folder where DApp located:

```
cd dapps/<dapp id>/
```

Then execute the ```asch-cli``` with ```contract``` sub-command:

```
asch-cli contract -a
```

We will be asked to provide the contract's name, this time we input "Project":

```
? Contract file name (without .js) Project
New contract created: ./contracts/Project.js
Updating contracts list
Done
```

This command would bring three results:

1. Newly created the contract template file, located in modules/contracts/Project.js```
2. Registered the transaction type in ```modules/helper/transaction-types.js```
3. Registered the new modules in  ```modules.full.json```


## 2 Define the entity field

Before we create a smart contract, we need to define in advance the transaction data entity that will be generated after the contract is conducted, which means we need to decide what kind of data that will be stored in blockchain. We may imagine this step as create a table in RDBMS.

Usually one contract type is related to one table. And the schema of the table is configured in ```blockchain.json```.

Our project is simple, which only contains ```name``` and  ```description```  fields.
Another field, ```transactionId```, is required by every entity table, and it is the foreign key of fundamental transaction ```transactions``` .

```
{
		"table": "asset_project",
		"alias": "t_p",
		"type": "table",
		"tableFields": [
			{
				"name": "name",
				"type": "String",
				"length": 16,
				"not_null": true
			},
			{
				"name": "description",
				"type": "Text",
				"not_null": true
			},
			{
				"name": "transactionId",
				"type": "String",
				"length": 21,
				"not_null": true
			}
		],
		"foreignKeys": [
			{
				"field": "transactionId",
				"table": "transactions",
				"table_field": "id",
				"on_delete": "cascade"
			}
		]
	}
```

Then we need to add the new configuration in ```join``` field, which is used to union query and serialization and deserialization. 

```
{
				"type": "left outer",
				"table": "asset_project",
				"alias": "t_p",
				"on": {
					"t.id": "t_p.transactionId"
				}
			}
```

In the future, we will generate these configurations automatically, and developers only need to enter the entity fields' name and type. 


## 3 Implement the contract interface

One contract contains several interfaces as follows, some of which must be implemented, and others can directly utilize the system generated codes.

```
create              # create a data object for transaction, mainly is assignment operation.
calculateFee        # set the transaction fee, which is the amount of XAS that will be consumed in one transaction.
verify              # validate the transaction data, such as whether a field is valid, or whether dependency condition is met
getBytes            # return the binary data of transaction as Buffer type
apply               # indicate the execution logic of contract which is applied when packaging blocks. It mainly distributes and transfers each account's asset involved in transaction, and also configures other fields of account.
undo                # the undo operation of "apply", which is used to rollback.
applyUnconfirmed    # indicate the pre-execution logic of contract, similar with "apply". The difference is that it will be called in realtime. Here "realtime" means that the logic will be called before blocks are packed, so those accounts involved are temporary and unconfirmed.
undoUnconfirmed     # the undo operation of "applyUnconfirmed", which is used to rollback.
ready               # shows that whether the transaction is complete, satisfying the requirement of packing. It is an advanced interface which is not necessary for most situations. We will discuss it later.
save                # serializing the transaction data, which maps the JSON fields to the fields of database table.
dbRead              # deserializing the transaction data, which maps the fields of database table to JSON fields.
normalize           # formatting the transaction data, which removes unrelevant fields and put relevant objects together. Usually not necessary.
```

Most of above interfaces can be used by default value.
Developers need to concern ```apply``` and ```applyUnconfirmed```, since they are the main parts of the business logic.

## 4 Implement Project contract

**Implement create**

```
	trs.recipientId = null;
  // Recipiant is not necessary when creating project, so set to null

	trs.amount = 0;
  // nor the amount, only transaction fee is needed

	trs.asset.project = {
		name: data.name,
		description: data.description
	}
  // these are the two data fields of project

	return trs;
```

**Set the transaction fee**

Currently we do not want the project to interact with XAS, therefore we can set the transaction fee to zero.

```
Project.prototype.calculateFee = function (trs) {
	return 0;
}
```

**Validate the data**

Just as simple as this:

```
Project.prototype.verify = function (trs, sender, cb, scope) {
	if (trs.recipientId) {
		return cb("Recipient should not exist");
	}
	if (trs.amount != 0) {
		return cb("Amount should be zero");
	}
	if (!trs.asset.project.name) {
		return cb("Project must have a name");
	}
	if (trs.asset.project.name.length > 16) {
		return cb("Project name must be 16 characters or less");
	}
	if (!trs.asset.project.description) {
		return cb("Invalid project description");
	}
	if (trs.asset.project.description.length > 1024) {
		return cb("Project description must be 1024 characters or less");
	}
	cb(null, trs);
}
```

**Get the binary data**

Binary data is mainly used to generate signature data, which means that we only need combine all the transaction entity data together as ```Buffer``` type.
The way of combination can be flexible, for example, you can combine the data either by using ```bytebuffer``` or just by connecting strings.

```
Project.prototype.getBytes = function (trs) {
	try {
		var buf = new Buffer(trs.asset.project.name + trs.asset.project.description, "utf8");
	} catch (e) {
		throw Error(e.toString());
	}

	return buf;
}
```

**Contract execution logic**

Firstly let us check the execution process of unconfirmed contract:

```
Project.prototype.applyUnconfirmed = function (trs, sender, cb, scope) {
	if (sender.u_balance["POINTS"] < BURN_POINTS) {
		return setImmediate(cb, "Account does not have enough POINTS: " + trs.id);
	}
	if (private.uProjects[trs.asset.project.name]){
		return setImmediate(cb, "Project already exists");
	}
	modules.blockchain.accounts.mergeAccountAndGet({
		address: sender.address,
		u_balance: { "POINTS": -BURN_POINTS }
	}, function (err, accounts) {
		if (!err) {
			private.uProjects[trs.asset.project.name] = trs;
		}
		cb(err, accounts);
	}, scope);
}
```

During this stage, we check whether the user's balance is sufficient, if not, the execution will not be allowed.
We then identify whether the project name is duplicate.

Finally we will see one of the most important API in DApp development: ```modules.blockchain.accounts.mergeAccountAndGet```. 

This API deals with account, including adding/subtracting numbers, appending/removing arrays and manipulating strings.

In this case we make the subtraction to account balance, which is subtracting ```BURN_POINTS``` from ```POINTS``` asset of ```u_balance```.

The reason that we named ```BURN_POINTS``` here is that there will be some assets that need to be burned for the execution of contract. As we did not define the destination of these consumed assets, they would disappear without any result, so called "burned". 

We here set the ```BURN_POINTS``` just for simplicity. If your business logic does not want to "burn" some assets, you can transfer them to application developers or node operators as transaction fee, or to a fund account as expense of further development. It is totally up to you.

Then let us check the execution code of confirming contract:

```
Project.prototype.apply = function (trs, sender, cb, scope) {
	modules.blockchain.accounts.mergeAccountAndGet({
		address: sender.address,
		balance: {"POINTS": -BURN_POINTS}
	}, cb, scope);
}
```

Only one operation: a subtraction from account asset. As simple as that.

In most of cases, usage of ```applyUnconfirmed``` is more complicate than that of ```apply``` , especially asset subtracting operations are involved. When subtracting some assets, ```applyUnconfirmed``` is executed earlier than ```apply```, and therefore it is unnecessary for the latter to do some requirement checks.

And we must note that the field modified by ```apply``` is ```balance```, while that field for ```applyUnconfirmed``` is ```u_balance```. 

So if ```u_balance``` meets the requirement (i.e., there is enough assets remained), then ```balance``` must also meet the requirement, hence there is no need to do the further check.

About the ```save``` and ```dbRead```, since they are very straightforward, developers can read the related code for the inherent logic and just utilize them directly.

## 5 Implement HTTP interface

During the previous step, we have already defined all the logic required by a project contract.

At this stage, we would add two more interfaces that both of them are served for front-end. One is for creating transaction, and the other is for querying the transaction history.

Almost all types of transactions can be created through the same procedure, which mainly contains following steps:

1. Creating secret key pair ```keypair``` by using ```secret``` received from client
2. Querying or creating account data by public key through ```modules.blockchain.accounts.getAccount```
3. Then creating a transaction object by using transaction entity data received from client, as well as account data and key pair. This time we use ```modules.logic.transaction.create```
4. And finally calling ```modules.blockchain.transactions.processUnconfirmedTransaction``` to deal with this transaction.

One thing needed to know is the usage of ```library.sequence.add```, and this API can guarantee that the executions of multiple transactions would rigorously follow the pre-defined order. If your contract process involves asynchronous operations, you should use this API.

Also let us check the query interface ```list```, and if you are familiar with SQL language, you will find out that this is just an operation of union query. Why is union query necessary? Because ```transactions``` and ```asset_xxx``` are the different parts of one particular transaction, in which the former is the meta-data that would be used by all transactions, e.g., transaction initiator, digital signature of transaction data, and the amount of money, and etc., while the latter is a kind of extension of transaction data - or user defined data - that is related to specific business logic.


## 6 Implement voting contract

Since this part is very simple and straightforward, you can just check the source code of [asch-mini-dao](https://github.com/sqfasd/asch-mini-dao) directly and will find out it is very easy to understand.

