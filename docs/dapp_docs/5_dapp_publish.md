# Dapp开发教程五 发布Dapp到线上

## 1 注册

注册到testnet

```
asch-cli -H <testnet host> -P <testnet port> registerdapp -e "<your secret>" -f path/to/dapp.json
```

注册到mainnet

```
asch-cli -H <mainnet host> -P <mainnet port> -M registerdapp -e "<your secret>" -f path/to/dapp.json
```

其中```dapp.json```是创建dapp的时候生成的元信息文件

这两个命令可以在任意一台机器执行，只需要提供host和port参数即可通过远程节点注册，默认的host是```localhost```, 默认的port是```4096```
主要，如果是注册到mainnet，需要加上额外的```-M```参数

## 2 修改创世块

有时候你可能需要修改创世块，比如，在本地开发的时候使用了一个创世主密码，发布到线上时希望使用另一个密码或者使用不同的侧链受托人，这时除了重新创建dapp以外，你可以选择修改创世块

```
# cd <asch dir>
asch-cli dapps -c
```

执行这个命令之后，会提示一系列问题，与创建dapp的时候差不多，可以重新输入创世账户密码、受托人公钥列表、内置资产信息等。

## 3 安装和卸载

安装

```
asch-cli dapps -i
```

卸载

```
asch-cli dapps -u
```

这两个命令会提示你输入3个参数，分别是dapp id、节点地址、节点密码， 其中节点密码是配置在```config.json```中的```masterpassword```