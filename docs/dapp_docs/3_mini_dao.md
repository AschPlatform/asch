# Dapp开发教程三 Asch Dapp Mini DAO

如果说前面两篇文章是热身的话，那么从这里开始，我们要进入正题了。
这一次，我们要正式创建新的交易类型或者智能合约了。

## 1 创建合约

首先要进入dapp所在目录

```
cd dapps/<dapp id>/
```

然后执行```asch-cli```的```contract```子命令

```
asch-cli contract -a
```

接下来会提示我们输入合约的名字，这里我们输入的是"Project"

```
? Contract file name (without .js) Project
New contract created: ./contracts/Project.js
Updating contracts list
Done
```

这个命令会帮我们做三件事

1. 新增了合约模板文件```modules/contracts/Project.js```
2. 在```modules/helper/transaction-types.js```注册了交易类型
3. 在```modules.full.json```中注册了新的模块


## 2 定义实体字段

在实现一个智能合约之前，我们需要定义好合约执行后生成的交易数据实体，即最终存储到区块链上的是哪些数据，也就是相当于创建关系数据的表格
一个合约类型对应一张表格
表格的schema在```blockchain.json```中进行配置

我们的project类型比较简单，只包含```name```和```description```字段
另外```transactionId```字段是每个实体表格都需要的，是作为基础交易```transactions```的外键。

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

然后我们需要在```join```字段种加入新的配置，还是为了联合查询以及序列化和反序列化时使用

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

将来，我们会把这些配置通过自动化的方式生成，开发者只需要输入实体字段的名称和类型即可。


## 3 实现合约接口

一个合约包含如下接口，有的必须要实现，有个则使用默认生成的代码即可

```
create              # 创建一个交易的数据对象，主要是赋值操作
calculateFee        # 设置交易费，即生成一次交易需要消耗的XAS数量
verify              # 验证交易数据，比如字段是否合法，依赖条件是否满足等
getBytes            # 返回交易的二进制数据，类型为Buffer
apply               # 合约的执行逻辑，在区块打包时调用，主要是分配和转移交易涉及到的各个账户的资产，以及账户其他字段的设置等
undo                # apply的相反操作，在区块回滚时会调用
applyUnconfirmed    # 合约的预执行逻辑，与apply类似，但是这个会实时的调用，就是说区块打包前就会调用，因此涉及到的账户操作都是临时、未确认的
undoUnconfirmed     # applyUnconfirmed的相反操作，回滚时使用
ready               # 交易是否准备完毕，是否满足打包的条件，这是个高级功能，大部分情况都不需要，以后会单独讲解
save                # 交易数据的序列化操作，就是将json字段映射到数据库表格字段
dbRead              # 交易的反序列化操作，将数据库表格字段映射到json字段
normalize           # 交易数据的格式化，把不相关的对象字段删除，相关的对象统一类型，一般情况不需要
```

上面的接口大部分情况下使用默认的就可以了
开发者需要注意的主要是```apply```和```applyUnconfirmed```两个接口，这是业务逻辑的主体部分。

## 4 实现Project合约

**实现create**

```
	trs.recipientId = null;
  // 创建项目只需要发起者，不需要接收者，所以设为null

	trs.amount = 0;
  // 也不需要金额，只需要手续费

	trs.asset.project = {
		name: data.name,
		description: data.description
	}
  // project对象的两个数据字段

	return trs;
```

**设置交易费**

这个项目我们不希望与XAS对接，那么就把交易费设置为0就行了

```
Project.prototype.calculateFee = function (trs) {
	return 0;
}
```

**数据检验**

这个没啥可解释的

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

**获取二进制数据**

二进制数据主要是为了生成签名数据，所以只需要把交易的实体数据组合起来打包成```Buffer```就可以了。
组合的方式可以随便，比如，可以通过```bytebuffer```，也可以通过简单的字符串连接。

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

**合约执行逻辑**

我们先看未确认合约的执行

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

在这一步，我们检查用户的余额是否足够，否则拒绝执行，
接着判断是否已经存在相同的项目名称，
最后我们会看到一个dapp开发中最重要的api，即```modules.blockchain.accounts.mergeAccountAndGet```。

这个api的功能是对账户进行操作，这个操作包括对数字的加减法、数组的增删、字符串的设置等。
这里我们对账户余额执行了减法操作，即把```u_balance```中的```POINTS```资产，减去```BURN_POINTS```。
这里我们取名```BURN_POINTS```主要是为了表达这个合约的执行需要燃烧一定数量的资产，因为我们没有指定被消耗掉的资产的去向，那么这些被消耗的资产就只有消失了，也就是被燃烧了。
这里我们只是为了简单起见，如果你的业务逻辑不希望燃烧，可以把这些资产作为手续费，转给应用的开发者或者节点运营者，或者转移到一个基金账户中，用作将来的开发经费，完全由你自己决定。

接下来再看看确认合约的执行代码

```
Project.prototype.apply = function (trs, sender, cb, scope) {
	modules.blockchain.accounts.mergeAccountAndGet({
		address: sender.address,
		balance: {"POINTS": -BURN_POINTS}
	}, cb, scope);
}
```

非常简单，只有一个操作，仅仅是对账户资产进行一个减法操作。
大部分情况下， ```applyUnconfirmed```是比```apply```要复杂的，特别是涉及到资产的减法操作时，因为前者要比后者执行的更早，后者就没必要做多余的条件检查了。
我们要注意到，```apply```修改的是```balance```字段，```applyUnconfirmed```修改的是```u_balance```字段，

所以如果```u_balance```满足条件(即有足够的剩余资产)，那么```balance```一定也会满足条件，所以就没必要进行进一步检查了。

接下来的```save```, ```dbRead```我想就没必要解释了，开发者可以自己发现其中的规律，直接套用即可。

## 5 实现http接口

在上一个步骤，我们已经定义了一个project合约的所有逻辑了。
在这一步，我们需要增加两个接口，都是为客户端或前端服务的，一个是用于创建交易，一个是用于查询交易历史。

几乎所有的交易创建都是类似的，一般可以分解成一下几步

1. 使用客户端传过来的```secret```生成密钥对```keypair```
2. 使用公钥查询或新建账户数据，通过api ```modules.blockchain.accounts.getAccount```
3. 然后使用客户端传过来的交易实体数据和账户数据以及密钥对，创建一个交易对象，通过api ```modules.logic.transaction.create```
4. 最后是调用api ```modules.blockchain.transactions.processUnconfirmedTransaction```来处理这个交易

有一点需要注意的是```library.sequence.add```接口的使用，这个接口可以保证多个交易按先后顺序严格执行，如果你的合约逻辑中涉及到异步操作，应该要使用这个api。

我们再来看一下```list```这个查询接口，熟悉sql的同学一眼就看出，这只不过是个联表查询操作。

为什么要联表查询呢？

因为```transactions```和```asset_xxx```表示的是一个交易的不同部分，前者是数据的基础数据，所有交易都通用，比如交易的发起者，交易数据的签名，金额等等，
后者则属于交易数据的扩展部分，是用户自定义的数据，与具体的业务逻辑相关。


## 6 实现投票合约

这个就不逐行解释了，开发者可以自己研究[asch-mini-dao的源码](https://github.com/sqfasd/asch-mini-dao)，有了上面的基础后，相信不难理解。

