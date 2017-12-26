# Asch节点安装文档

## 1 系统要求

- 必须是linux系统
- 必须有公网ip
- 建议使用ubuntu 16.04 64位操作系统
- 建议CPU 2C以上
- 建议内存2G以上
- 建议带宽2Mb以上
- 建议硬盘空间10GB以上

## 2 安装

测试版(testnet)与正式版(mainnet)是同时存在但无法互通的两套系统<br>
除了安装包、默认配置文件(包括默认端口等)不一样外，安装流程是一样的<br>
只要端口不冲突，可以同时在一台机器安装，但是不推荐这样做，除非机器配置足够好，比如4核、4G内存、4M带宽...

### 2.1 下载和解压缩

测试版testnet

```
wget https://www.asch.io/downloads/asch-linux-latest-testnet.tar.gz
tar zxvf asch-linux-latest-testnet.tar.gz
```

正式版mainnet

```
wget https://www.asch.io/downloads/asch-linux-latest-mainnet.tar.gz
tar zxvf asch-linux-latest-mainnet.tar.gz
```

一般情况下，testnet的版本号大于等于mainnet的版本号

### 2.2 初始化

这一步会自动帮您做以下几件事情

1. 安装sqlite3等依赖软件
2. 安装和配置ntp服务，保证您的时间与其他节点同步

这一步只需要运行一次即可，重复运行也无妨

```
# 进入你的安装目录
# ubuntu执行下面的命令
chmod u+x init/*.sh && ./aschd configure
# 其他linux系统
请自行利用apt-get/yum/zypper等包管理器工具安装sqlite3/ntp2个依赖包
```

## 3 运行

```
# 进入你的安装目录

# 启动
./aschd start

# 停止
./aschd stop

# 查看运行状态
./aschd status

# 重启
./aschd restart

# 升级
./aschd upgrade

# 重新同步区块
./aschd rebuild

# 查看版本
./aschd version

# 开启区块生产
./aschd enable "your sercret"

# 查看log
tail -f logs/debug.log
```

## 4 受托人配置

### 4.1 受托人密码

使用文本编辑工具打开config.json, 找到secret字段，将你的受托人密钥填进去即可，该字段为json字符串数组，一台机器可以配置多个，但不能重复

![forging secret](./assets/forging-secret.png)

**注意** 不管是一台机器还是多台机器，不要配置重复的受托人密钥

### 4.2 公网IP

默认情况下，系统会自动检测公网ip，但在某些云主机中，公网ip无法检测到，这时需要手动在config.json修改或添加如下字段

```
"publicIp": "此处填写你的公网ip",
```

配置完之后需要重启程序

```
./aschd restart
```

## 5 升级

```
./aschd upgrade
./aschd start
```

## 6 错误诊断

### 6.1 在线钱包无法访问

【情况一】

查看是否改了config.json里的port字段， testnet的端口默认为4096，mainnet的端口默认为8192<br>
官方的种子节点将端口改成了80
检查防火墙配置，需要打开Asch的端口入站和出站。

【情况二】

查看服务是否启动，可以使用如下命令

```
./aschd status

# 如果没有启动则显示
Asch server is not running

# 如果出现这种情况，重启即可
./aschd restart
```

### 6.2 无法生产区块 

【情况一】

查看受托人排名是否进入前101

【情况二】

使用下面的命令搜索错误日志

```
grep Failed logs/debug.log
```

如果出现了如下字样

```
Failed to get public ip, block forging MAY not work!
```

说明公网ip没有自动获取到，需要你手动配置，具体可以参考[4.2 公网IP]一节

【情况三】

使用下面的命令搜索错误日志

```
grep error logs/debug.log
```

如果出现了如下字样

```
Failed to load delegates: Account xxxxxxxxx not found
```

说明你配置的账户密钥还没有注册成为受托人，或者注册成为受托人之前就启动了服务，这时重启服务即可<br>
**注意** 如果你的节点正在同步区块，不要立即重启，等同步完成了再重启

```
./aschd restart
```

正常情况下应该会出现如下log

```
grep Forging logs/debug.log

Forging enabled on account: xxxxxxxxxxxxxx
```

### 6.3 无法同步区块(卡块)

(可以通过对比自己钱包的区块高度与官方节点的最新区块高度来确认这一现象)<br>

优先使用restart命令

```
./aschd restart
```

如果无法解决，使用rebuild命令

```
./aschd rebuild
```