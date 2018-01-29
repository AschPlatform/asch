
# Table of Contents

- [Asch SDK API](#asch-sdk-api)
    - [<strong>1. Database</strong>](#1-database)
        - [1.1 `aync` app.sdb.load(model, fields, indices)](#11-aync-appsdbloadmodel-fields-indices)
        - [1.2 app.sdb.get(model, cond)](#12-appsdbgetmodel-cond)
        - [1.3 app.sdb.keys(model)](#13-appsdbkeysmodel)
        - [1.4 app.sdb.entries(model)](#14-appsdbentriesmodel)
        - [1.5 ap.sdb.lock(key)](#15-apsdblockkey)
        - [1.6 app.sdb.create(model, values)](#16-appsdbcreatemodel-values)
        - [1.7 app.sdb.replace(model, values)](#17-appsdbreplacemodel-values)
        - [1.8 app.sdb.update(model, modifier, cond)](#18-appsdbupdatemodel-modifier-cond)
        - [1.9 app.sdb.increment(model, modifier, cond)](#19-appsdbincrementmodel-modifier-cond)
        - [1.10 app.sdb.del(model, cond)](#110-appsdbdelmodel-cond)
    - [2. Balance](#2-balance)
        - [2.1 app.balances.get(address, currency)](#21-appbalancesgetaddress-currency)
        - [2.2 app.balances.increase(address, currency, amount)](#22-appbalancesincreaseaddress-currency-amount)
        - [2.3 app.balances.decrease(address, currency, amount)](#23-appbalancesdecreaseaddress-currency-amount)
        - [2.4 app.balances.transfer(currency, amount, from, to)](#24-appbalancestransfercurrency-amount-from-to)
    - [3 Data model](#3-data-model)
        - [3.1 app.model[name]](#31-appmodelname)
        - [3.2 fields()](#32-fields)
        - [3.3 count(cond)](#33-countcond)
        - [3.4 exists(cond)](#34-existscond)
        - [3.5 findOne(options)](#35-findoneoptions)
        - [3.6 findAll(options)](#36-findalloptions)
    - [4. Routing](#4-routing)
        - [4.1 app.route.get(path, handler)](#41-approutegetpath-handler)
        - [4.2 app.route.post(path, handler)](#42-approutepostpath-handler)
        - [4.3 app.route.put(path, handler)](#43-approuteputpath-handler)
    - [5. Cost pool](#5-cost-pool)
        - [5.1 app.feePool.add(currency, amount)](#51-appfeepooladdcurrency-amount)
    - [6. Icrement ID](#6-icrement-id)
        - [6.1 app.autoID.get(name)](#61-appautoidgetname)
        - [6.2 app.autoID.increment(name)](#62-appautoidincrementname)
    - [7. 日志](#7-日志)
        - [7.1 app.logger.setLevel(level)](#71-apploggersetlevellevel)
        - [7.2 app.logger.log()](#72-apploggerlog)
        - [7.3 app.logger.trace()](#73-apploggertrace)
        - [7.4 app.logger.debug()](#74-apploggerdebug)
        - [7.5 app.logger.info()](#75-apploggerinfo)
        - [7.6 app.logger.warn()](#76-apploggerwarn)
        - [7.7 app.logger.error()](#77-apploggererror)
    - [8. Tools](#8-tools)
        - [8.1 app.validate(type, value)](#81-appvalidatetype-value)
        - [8.2 app.registerContract(type, name)](#82-appregistercontracttype-name)
        - [8.3 app.getContractName(type)](#83-appgetcontractnametype)
        - [8.4 app.registerFee(type, min, currency)](#84-appregisterfeetype-min-currency)
        - [8.5 app.getFee(type)](#85-appgetfeetype)
        - [8.6 app.setDefaultFee(min, currency)](#86-appsetdefaultfeemin-currency)
        - [8.7 app.getRealTime(epochTime)](#87-appgetrealtimeepochtime)
        - [8.8 app.registerHook](#88-appregisterhook)
        - [8.9 app.custom[]](#89-appcustom)

Table created with [Markdown-TOC](https://github.com/AlanWalk/Markdown-TOC).


# Asch SDK API


## **1. Database**

### 1.1 `aync` app.sdb.load(model, fields, indices)

- `model` Datamodel
- `fields` Fields of the data model
- `indices` Array of indexes, it can be a single field index or a multi field index (provide an string array)

> The operation has no return value, it throws an Exception when an error occurs
> 将指定模型的数据加载到内存并建立索引, 这样可以提高查询和更新一个状态的效率
> 当一个数据模型需要频繁更新和查询时, 建议使用这个接口, 比如系统内置的账户余额、自增ID都使用了这个功能

Example:

```
await app.sdb.load('Balance', app.model.Balance.fields(), [['address', 'currency']])
await app.sdb.load('Variable', ['key', 'value'], ['key'])
```

### 1.2 app.sdb.get(model, cond)

- `model` Datamodel
- `cond` Query conditions

> Returns the model that matched the query conditions
> Query the data according to the specified query condition. When the model can't be loaded an exception will be thrown. Query conditions will also throw an error if the key value is not indexed

Example:

```
app.sdb.get('Variable', { key: 'foo' })
/* output:
{
  key: 'foo',
  value: 'bar'
}
*/

let balance = app.sdb.get('Balance', { address: 'foo', currency: 'XAS' })
/* output:
{
  address: 'foo',
  currency: 'XAS',
  balance: '1000000'
}
*/
```

### 1.3 app.sdb.keys(model)

- `model` Model

> This operation returns all indexed fields for a model

Example:

```
let keys = app.sdb.keys('Variable')
for (let i of keys) {
  console.log(i)
}
/* output:
foo
foo1
foo2
*/
```


### 1.4 app.sdb.entries(model)

- `model` Model name

> Returns all cached fields for a data model

Example:

```
let entries = app.sdb.entries('Variable')
for (let [key, value] of entries) {
  console.log(key, value)
}
/* output:
foo bar
foo1 bar1
foo2 bar2
*/
```

### 1.5 ap.sdb.lock(key)

- `key` 

> No return value
> Lock a key. This lock is valid for the timespan of a block interval. A block life cycle does not allow a second lock or an exception will be thrown.
> This features is to prevent a duplicate call in a block life cycle. For example: A contract needs to set a nickname for an account. Before the contract call is confirmed, we need to prevent that the nickname is set again. Therefore we can use the lock function.

Example:

```
app.sdb.lock('AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85@nickname'
```

### 1.6 app.sdb.create(model, values)

- `model` Model
- `values` Data items that will be created

> No return value
> This operation creates a data item that updates the cache in real time if the model is cached. After the block is confirmed, the data will be persisted in the database.

Example:

```
app.sdb.create('Article', {
  title: 'This is an article title',
  content: 'article contents',
  author: 'qingfeng',
  tag: 'Science'
})
```

### 1.7 app.sdb.replace(model, values)

- `model` model
- `values` data item that will be created or updated

> No return value
> Create or update the data model. If the data model already exists, update it. The parameter `values` must must contain the primary key.

Example:

```
app.sdb.replace('Account', {
  address: 'AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85',
  nickname: 'Nakamoto'
})
```

### 1.8 app.sdb.update(model, modifier, cond)

- `model` Model
- `modifier` Data item that should be updated
- `cond` Update condition

> No return value
> One or many data items of a model are updated according to the update condition.

Example:

```
app.sdb.update('Account', { nickname: 'Nakamoto' }, { nickname: 'Satoshi' })
```

### 1.9 app.sdb.increment(model, modifier, cond)

- `model` Model
- `modifier` Data item that should be updated
- `cond` Update condition

> Incremental update of a model by specified number. This can only be used to update integer types.

Example:

```
app.sdb.increment('Article', { votes: -10 }, { id: '10000' })
app.sdb.increment('Article', { comments: 1 }, { id: '10000' })
```

### 1.10 app.sdb.del(model, cond)

- `model` Model name
- `cond` Delete condition

> No return value
> Delete data items in a model according to a query condition
> The implementation of the delete operation is currently marked as obsolete. This query interface will not delete model data. However, a custom implementation can still delete data.

Example:

```
app.sdb.del('Article', { id: '100001' })
```

## 2. Balance

### 2.1 app.balances.get(address, currency)

- `address` Account address
- `currency` Currency

> Returns the balance of the specified account

Example:

```
app.balances.get('AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85', 'XAS')
/* output:
{
  address: 'AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85',
  currency: 'XAS',
  balance: '10000000'
}
*/
```

### 2.2 app.balances.increase(address, currency, amount)

- `address` Account address
- `currency` Currency
- `amount` Amount to increase

> No return value
> This operation raises the balance of the address by `amount` (amount to increase).

Example:

```
app.balances.increase('AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85', 'XAS', '100000')
```

### 2.3 app.balances.decrease(address, currency, amount)

- `address` Account address
- `currency` Currency
- `amount` Amount the subtract

> No return value
> This operation subtracts the `amount` of the balance.

Example:

```
app.balances.decrease('AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85', 'XAS', '100000')
```

### 2.4 app.balances.transfer(currency, amount, from, to)

- `currency` Currency
- `amount` Amount to transfer
- `from` Sender
- `to` Recipient

> No return value
> Transfers assets between two accounts

Example:

```
app.balances.transfer('XAS', '100000', 'AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85', 'A4MFPoF3c9vCzZ3GGf9sNQ3rDy2q8aXuVF')
```

## 3 Data model

### 3.1 app.model[name]

- `name` Model name

> Returns an instance of the model

### 3.2 fields()

> Returns all fields of the model

### 3.3 count(cond)

- `cond` Query condition

> Returns a `Number`
> The total number of data items that match the specified condition.

Example:

```
app.model.Block.count({ height: { $lt: 100 } })
/* output:
99
/*
```

### 3.4 exists(cond)

- `cond` Query condition

> Returns a `Boolean`
> Indicates whether the data item for the specified condition exists.

Example:

```
app.model.Transaction.exists({ id: '9a5ec0669c79b9f5a1d5a4dbb2c200bc28c9ea829dbff71f41cbb2ad5a7d9b01' })
/* output:
false
/*

app.model.Account.exists({ nickname: 'Nakamoto' })
/* output:
true
*/
```

### 3.5 findOne(options)

`options` Is an object that has the following properties:

- `condition` Query conditions
- `fields` The field that should be returned

> Query data items for a specified condition.

Example:

```
app.model.Account.findOne({ nickname: 'Nakamoto' })
/* output:
{
  address: 'AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85',
  nickname: 'Nakamoto',
  ...other values
}
*/
```

### 3.6 findAll(options)

`options` Is an object that has the following properties:

- `condition` Query condition
- `fields` Fields to return
- `sort` Fields to sort after
- `limit` The maximum number to return
- `offset` Offset

> Query all data items for the specified condition

Example:

```
app.model.Transfer.findAll({ senderId: 'AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85'})
/* output:
[
  {
    tid: "50e062f25946d220b924cb5ec6e52e260e44c9417d9f3c8ea041b704e06895f7",
    senderId: "AFnwUuET2XddPtqpFb2ns78CQEqc7KZ6vD",
    recipientId: "asdasdasd",
    currency: "CCTime.XCT",
    amount: "100000000",
    t_timestamp: 38660145,
    t_type: 3,
    t_height: 93953
  },
  {
    tid: "f15ce92add809b4a132936d514dce7fa7bdc15e850e7c026a001625b48595af3",
    senderId: "AFnwUuET2XddPtqpFb2ns78CQEqc7KZ6vD",
    recipientId: "asdasd",
    currency: "CCTime.XCT",
    amount: "100000000",
    t_timestamp: 38660096,
    t_type: 3,
    t_height: 93948
  }
]
*/
```

## 4. Routing

- `path` Path
- `handler` Http Request Handler (async)

### 4.1 app.route.get(path, handler)

> Register a `get` type `http` request handler

### 4.2 app.route.post(path, handler)

> Register a `post` type  `http` request handler

### 4.3 app.route.put(path, handler)

> Register a `put` type `http` request handler

## 5. Cost pool

### 5.1 app.feePool.add(currency, amount)

- `currency` Currency
- `amount` Amount

> No return value
> The specified asset (currency) is added to the fee pool (the amount is evenly distributed to all accountants at the end of each round).

Example:

```
app.feelPool.add('XAS', '10000000')
```

## 6. Icrement ID

### 6.1 app.autoID.get(name)

- `name` Id Type

> Returns a `String`
> Get the highest Id of a type

### 6.2 app.autoID.increment(name)

- `name` Id Type

> Returns a `String`
> Increment the Id of the specified type by 1 and return the updated value as a string. This is equivalent to the `++i` operation in javascript.

Example:

```
const AID = 'article_id'
app.autoID.get(AID) === '0'
app.autoID.increment(AID) === '1'
app.autoID.get(AID) === '1'
```

## 7. 日志

### 7.1 app.logger.setLevel(level)
### 7.2 app.logger.log()
### 7.3 app.logger.trace()
### 7.4 app.logger.debug()
### 7.5 app.logger.info()
### 7.6 app.logger.warn()
### 7.7 app.logger.error()

Example

```
app.logger.setLevel('debug')
app.logger.setLevel('info')

logger.log('hello');
logger.trace('hello', 'world');
logger.debug('hello %s',  'world', 123);
logger.info('hello %s %d',  'world', 123, {foo:'bar'});
logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'});
logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object);
```

## 8. Tools

### 8.1 app.validate(type, value)

- `type` The datatype that should be verified
- `value` Data value which will be verified

> Verify that a data is matches the specification. If not, throw an exception.

Example:

```
app.validate('amount', '10000') // pase
app.validate('amount', 10000) // throws
app.validate('amount', 'abc') // throws
app.validate('amount', '1e10') // throws
```

### 8.2 app.registerContract(type, name)

- `type` Contract Type
- `name` The name of contract

> No return value
> 为合约注册一个数字类型, 未注册的合约无法被外部调用

Example:

```
app.registerContract(1001, 'cctime.postArticle')
```

### 8.3 app.getContractName(type)

- `type` The type or the number of the contract

> Get the contract name for a specified type 

Example:

```
app.getContractName(1001) === 'cctime.postArticle'
```

### 8.4 app.registerFee(type, min, currency)

- `type` The type or the the number of the contract
- `min` Minimum cost
- `currency` Currency

> The minimum fee for a contract registration
> `Min` stands for the minimum cost. The fee to call the contract. The fee can not be less then `min`. The fee can be greater. The execess part will be send to the fee pool.

Example:

```
app.registerFee(1001, '100000', 'XAS')
```
### 8.5 app.getFee(type)

- `type` The type or number of the contract

> Get the specified fee for a contract

Example:

```
app.getFee(1001)
/* output:
{
  min: '100000',
  currency: 'XAS'
}
*/
```

### 8.6 app.setDefaultFee(min, currency)

- `min` Minimum cost
- `currency` Currency

> Set default fee for all contracts in the system.

Example:

```
app.setDefaultFee('10000', 'XAS')
```

### 8.7 app.getRealTime(epochTime)

- `epochTime` The number of seconds since the creation of the block. 

> Returns a timestamp which is the time of the block creation plus the offset in milliseconds
> Asch systems timestamp is not a real timestamp. It is timespan. You can call this function to get a real timestamp

Example:

```
app.getRealTime(4353634)
```

### 8.8 app.registerHook

// TBD

### 8.9 app.custom[]

> The application's namespace can be used to save some of the application's own custom global variables, mainly to isolate system-wide global variables





