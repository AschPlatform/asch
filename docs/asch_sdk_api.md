Table of Contents
=================

   * [Asch SDK API 使用说明](#asch-sdk-api-使用说明)
      * [<strong>1. 数据库</strong>](#1-数据库)
         * [1.1 aync app.sdb.load(model, fields, indices)](#11-aync-appsdbloadmodel-fields-indices)
         * [1.2 app.sdb.get(model, cond)](#12-appsdbgetmodel-cond)
         * [1.3 app.sdb.keys(model)](#13-appsdbkeysmodel)
         * [1.4 app.sdb.entries(model)](#14-appsdbentriesmodel)
         * [1.5 ap.sdb.lock(key)](#15-apsdblockkey)
         * [1.6 app.sdb.create(model, values)](#16-appsdbcreatemodel-values)
         * [1.7 app.sdb.replace(model, values)](#17-appsdbreplacemodel-values)
         * [1.8 app.sdb.update(model, modifier, cond)](#18-appsdbupdatemodel-modifier-cond)
         * [1.9 app.sdb.increment(model, modifier, cond)](#19-appsdbincrementmodel-modifier-cond)
         * [1.10 app.sdb.del(model, cond)](#110-appsdbdelmodel-cond)
      * [2. 余额](#2-余额)
         * [2.1 app.balances.get(address, currency)](#21-appbalancesgetaddress-currency)
         * [2.2 app.balances.increase(address, currency, amount)](#22-appbalancesincreaseaddress-currency-amount)
         * [2.3 app.balances.decrease(address, currency, amount)](#23-appbalancesdecreaseaddress-currency-amount)
         * [2.4 app.balances.transfer(currency, amount, from, to)](#24-appbalancestransfercurrency-amount-from-to)
      * [3 数据模型](#3-数据模型)
         * [3.1 app.model[name]](#31-appmodelname)
         * [3.2 fields()](#32-fields)
         * [3.3 count(cond)](#33-countcond)
         * [3.4 exists(cond)](#34-existscond)
         * [3.5 findOne(options)](#35-findoneoptions)
         * [3.6 findAll(options)](#36-findalloptions)
      * [4. 路由](#4-路由)
         * [4.1 app.route.get(path, handler)](#41-approutegetpath-handler)
         * [4.2 app.route.post(path, handler)](#42-approutepostpath-handler)
         * [4.3 app.route.put(path, handler)](#43-approuteputpath-handler)
      * [5. 费用池](#5-费用池)
         * [5.1 app.feePool.add(currency, amount)](#51-appfeepooladdcurrency-amount)
      * [6. 自增ID](#6-自增id)
         * [6.1 app.autoID.get(name)](#61-appautoidgetname)
         * [6.2 app.autoID.increment(name)](#62-appautoidincrementname)
      * [7. 日志](#7-日志)
         * [7.1 app.logger.setLevel(level)](#71-apploggersetlevellevel)
         * [7.2 app.logger.log()](#72-apploggerlog)
         * [7.3 app.logger.trace()](#73-apploggertrace)
         * [7.4 app.logger.debug()](#74-apploggerdebug)
         * [7.5 app.logger.info()](#75-apploggerinfo)
         * [7.6 app.logger.warn()](#76-apploggerwarn)
         * [7.7 app.logger.error()](#77-apploggererror)
      * [8. 工具类](#8-工具类)
         * [8.1 app.validate(type, value)](#81-appvalidatetype-value)
         * [8.2 app.registerContract(type, name)](#82-appregistercontracttype-name)
         * [8.3 app.getContractName(type)](#83-appgetcontractnametype)
         * [8.4 app.registerFee(type, min, currency)](#84-appregisterfeetype-min-currency)
         * [8.5 app.getFee(type)](#85-appgetfeetype)
         * [8.6 app.setDefaultFee(min, currency)](#86-appsetdefaultfeemin-currency)
         * [8.7 app.getRealTime(epochTime)](#87-appgetrealtimeepochtime)
         * [8.8 app.registerHook](#88-appregisterhook)
         * [8.9 app.custom[]](#89-appcustom)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)


# Asch SDK API 使用说明


## **1. 数据库**

### 1.1 `aync` app.sdb.load(model, fields, indices)

- `model` 模型名称
- `fields` 加载到内存中的字段
- `indices` 索引数组, 单字段索引时, 元素为字符串; 多字段索引时, 元素为字符串数组

> 无返回值, 出现错误时抛异常
> 将指定模型的数据加载到内存并建立索引, 这样可以提高查询和更新一个状态的效率
> 当一个数据模型需要频繁更新和查询时, 建议使用这个接口, 比如系统内置的账户余额、自增ID都使用了这个功能

示例:

```
await app.sdb.load('Balance', app.model.Balance.fields(), [['address', 'currency']])
await app.sdb.load('Variable', ['key', 'value'], ['key'])
```

### 1.2 app.sdb.get(model, cond)

- `model` 模型名称
- `cond` 查询条件

> 返回一个数据项, 包含的字段为`load`时指定的字段
> 按指定条件查询内存中的数据, 如果该模型没有被载入内存, 会抛出异常; 查询条件包换未建索引的字段时也会抛出异常

示例:

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

- `model` 模型名称

> 返回一个数据模型的全部索引字段

示例:

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

- `model` 模型名称

> 返回一个数据模型的所有缓存项

示例:

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

> 无返回值
> 对一个key进行加锁, 有效期为一个区块间隔, 在同一个区块生命周期内不允许对一个key二次加锁, 否则会抛异常
> 该功能主要是为了解决对未确认数据的依赖问题。比如, 一个合约中需要对某账户设置昵称, 在这个合约调用被确认之前, 我们需要防止再次调用, 这种情况下可以使用加锁功能

示例:

```
app.sdb.lock('AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85@nickname'
```

### 1.6 app.sdb.create(model, values)

- `model` 模型名称
- `values` 待创建的数据项

> 无返回值
> 创建一个数据项, 如果该模型有缓存, 会实时更新缓存. 在区块确认后, 持久化到磁盘数据库

示例:

```
app.sdb.create('Article', {
  title: 'This is an article title',
  content: 'article contents',
  author: 'qingfeng',
  tag: 'Science'
})
```

### 1.7 app.sdb.replace(model, values)

- `model` 模型名称
- `values` 待创建或更新的数据项

> 无返回值
> 创建或更新一个数据项, 如果数据库中无此项则创建, 否则更新. 模型必须包含主键, `values`必须包含主键

示例:

```
app.sdb.replace('Account', {
  address: 'AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85',
  nickname: 'Nakamoto'
})
```

### 1.8 app.sdb.update(model, modifier, cond)

- `model` 模型名称
- `modifier` 待更新的数据项
- `cond` 更新条件

> 无返回值
> 按指定条件更新一个模型的若干个数据项

示例:

```
app.sdb.update('Account', { nickname: 'Nakamoto' }, { nickname: 'Satoshi' })
```

### 1.9 app.sdb.increment(model, modifier, cond)

- `model` 模型名称
- `modifier` 待更新的数据项
- `cond` 更新条件

> 按指定条件增量更新一个模型的若干个数据项, 只能用于更新整数类型

示例:

```
app.sdb.increment('Article', { votes: -10 }, { id: '10000' })
app.sdb.increment('Article', { comments: 1 }, { id: '10000' })
```

### 1.10 app.sdb.del(model, cond)

- `model` 模型名称
- `cond` 删除条件

> 无返回值
> 按条件删除一个模型中的数据项
> 删除操作的底层实现目前是标记为deleted, 默认的查询接口都会过滤掉被标记的数据, 但非标准接口或协议仍然可以获取到这些已经被`删除`的数据

示例:

```
app.sdb.del('Article', { id: '100001' })
```

## 2. 余额

### 2.1 app.balances.get(address, currency)

- `address` 账户地址
- `currency` 币种

> 获取指定账户、指定币种的余额

示例:

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

- `address` 账户地址
- `currency` 币种
- `amount` 增加的数额

> 无返回值
> 增加指定账户、指定币种的余额

示例:

```
app.balances.increase('AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85', 'XAS', '100000')
```

### 2.3 app.balances.decrease(address, currency, amount)

- `address` 账户地址
- `currency` 币种
- `amount` 减少的数额

> 无返回值
> 减少指定账户、指定币种的余额

示例:

```
app.balances.decrease('AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85', 'XAS', '100000')
```

### 2.4 app.balances.transfer(currency, amount, from, to)

- `currency` 币种
- `amount` 转移的数额
- `from` 源地址(发款人)
- `to` 目的地址(收款人)

> 无返回值
> 两个账户之间转移资产

示例:

```
app.balances.transfer('XAS', '100000', 'AC3pinmvz9qX9cj6c7VrGigq7bpPxVJq85', 'A4MFPoF3c9vCzZ3GGf9sNQ3rDy2q8aXuVF')
```

## 3 数据模型

### 3.1 app.model[name]

- `name` 模型名称

> 返回一个模型的实例, 主要用于查询已确认的数据

### 3.2 fields()

> 返回该模型所有字段

### 3.3 count(cond)

- `cond` 查询条件

> 返回`Number`
> 表示指定条件的数据项总数

示例:

```
app.model.Block.count({ height: { $lt: 100 } })
/* output:
99
/*
```

### 3.4 exists(cond)

- `cond` 查询条件

> 返回`Boolean`
> 表示指定条件的数据项是否存在

示例:

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

`options`是一个对象, 包含以下元素

- `condition` 查询条件
- `fields` 返回的字段

> 查询一个指定条件的数据项

示例:

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

`options`是一个对象, 包含以下元素

- `condition` 查询条件
- `fields` 返回的字段
- `sort` 排序字段
- `limit` 返回的最大数量
- `offset` 偏移量

> 查询指定条件的所有数据项 

示例:

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

## 4. 路由

- `path` 路径
- `handler` http请求处理函数, async类型

### 4.1 app.route.get(path, handler)

> 注册一个`get`类型的`http`请求处理函数

### 4.2 app.route.post(path, handler)

> 注册一个`post`类型的`http`请求处理函数

### 4.3 app.route.put(path, handler)

> 注册一个`put`类型的`http`请求处理函数

## 5. 费用池

### 5.1 app.feePool.add(currency, amount)

- `currency` 币种
- `amount` 数额

> 无返回值
> 将资产加入费用池(在每一个`round`结尾平均分给记账人)

示例:

```
app.feelPool.add('XAS', '10000000')
```

## 6. 自增ID

### 6.1 app.autoID.get(name)

- `name` ID类型名称

> 返回`String`
> 获取一个类型的当前最大ID

### 6.2 app.autoID.increment(name)

- `name` ID类型名称

> 返回`String`
> 对指定类型的ID增加1并以字符串形式返回更新后的数值, 相当于原子的`++1`, 超大数也适用

示例:

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

示例:

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

## 8. 工具类

### 8.1 app.validate(type, value)

- `type` 待验证的数据类型
- `value` 待验证的数据值

> 验证一个数据是否符合规范, 不符合则抛出异常

示例:

```
app.validate('amount', '10000') // pase
app.validate('amount', 10000) // throws
app.validate('amount', 'abc') // throws
app.validate('amount', '1e10') // throws
```

### 8.2 app.registerContract(type, name)

- `type` 合约数值类型或编号
- `name` 合约的字符串名称

> 无返回值
> 为合约注册一个数字类型, 未注册的合约无法被外部调用

示例:

```
app.registerContract(1001, 'cctime.postArticle')
```

### 8.3 app.getContractName(type)

- `type` 合约的数字类型或编号

> 根据合约编号查询名称

示例:

```
app.getContractName(1001) === 'cctime.postArticle'
```

### 8.4 app.registerFee(type, min, currency)

- `type` 合约的数字类型或编号
- `min` 最小费用
- `currency` 币种

> 为一个合约注册最小费用, 不固定资产, 可通过`currency`参数指定收哪种资产作为手续费
> `min`表示最小费用, 实际调用合约的时候, 费用不能小于`min`, 但可以大于, 超过的部分自动放入费用池

示例:

```
app.registerFee(1001, '100000', 'XAS')
```
### 8.5 app.getFee(type)

- `type` 合约的数字类型或编号

> 获取指定合约的费用设定

示例:

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

- `min` 最小费用
- `currency` 币种

> 为系统的所有合约设置默认手续费

示例:

```
app.setDefaultFee('10000', 'XAS')
```

### 8.7 app.getRealTime(epochTime)

- `epochTime` 距离创世区块生成时间的秒数

> 返回完整的时间戳, 即区块创世时间加上偏移量, 单位为毫秒
> Asch系统中底层存储和上层查询的时间戳均为一个偏移量, 并非实际时间戳, 可以调用这个函数转换为真实的时间戳

示例:

```
app.getRealTime(4353634)
```

### 8.8 app.registerHook

// TBD

### 8.9 app.custom[]

> 应用的名字空间, 可用来保存应用本身自定义的一些全局变量, 主要是为了与系统级的全局变量进行隔离




