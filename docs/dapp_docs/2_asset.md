title: Dapp开发教程二 Asch Dapp Asset
---

前一篇文章我们介绍了asch dapp开发的基本流程，这一次我们打算创建一个拥有内置资产的dapp，并顺便介绍下前后端通讯的协议和常用接口。

# 1 创建一个带内置资产的dapp

其实这篇文章有些标题党，因为创建内置资产非常简单，与前一篇文章的hello world相比，只多了两次命令行的选项:)

在创建dapp的一个环节，会提示我们是否需要内置置产，上一次我们选择了默认的no，
这一次我们输入yes

```
? Do you want publish a inbuilt asset in this dapp? yes
```

然后就会触发新的剧情了

```
? Enter asset name, for example: BTC, CNY, USD, MYASSET CNY
# 这里需要输入资产的单位或者叫名称缩写，可以是任意一个长度小于16的字符串

? Enter asset total amount 1000000
# 输入资产总量，注意这里不需要乘以100000000
```

其余的流程就跟那个hello world一模一样了

最后登录dapp的前端界面，我们就可以发现账户资产里多了一项我们自定义的资产了，还可以通过链内转账将资产发送给其他账户。

我们的`asch-cli`程序目前只能创建一种内置资产，如果有创建多种资产的需求，我们可以考虑开发。
其实开发者也可以在自己在自己生成创世块的时候设置多种内置资产，具体可以研究下[asch-cli的源码](https://github.com/sqfasd/asch-cli)。

# 2 前后端通讯协议

Dapp后端提供的接口的一般格式为`/api/dapps/<dapp id>/api/method`

例如，我们在hello world项目中使用了3个接口

**登录**

```
post /api/dapps/<dapp id>/api/openAccount

# 这个接口需要提供secret字段，有安全隐患
# 如果能在前端获取到publicKey，可以使用下面这个更安全的接口

post /api/dapps/<dapp id>/api/openAccount2
```

**链内交易**

```
put /api/dapps/<dapp id>/api/transaction
```

**提现**

```
post /api/dapps/<dapp id>/api/withdrawal
```

更多接口可以去`router.json`文件里查看

例如

**获取区块列表**

```
{
		"path": "/blocks",
		"method": "get",
		"handler": "blockchain.blocks.getBlocks"
	}
```

**获取未确认交易列表**

```
{
		"path": "/transactions",
		"method": "get",
		"handler": "blockchain.transactions.getTransactions"
	}
```

**增加受托人**

```
	{
		"path": "/delegates",
		"method": "put",
		"handler": "blockchain.delegates.addDelegates"
	}
```

侧链框架中提供了更多的方法，但是没有暴露出api，开发者如果有需要，可以自行配置。