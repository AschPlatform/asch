# Asch Node Installation Guide

## 1. Sytem requirement
- Linux system required
- Public IP address required
- Ubuntu 16.04 64bit OS recommended
- Above 2Gb RAM recommended
- Above 2Mb broadwidth recommended
- Above 10GB GB harddisk recommended

## 2. Installation
There are two seperated system: test version (testnet) and main official version (mainnet). Both of them are co-existed but unable to communicate with each other. 

The installation procedures of these two system are the same except the installation package and configuration file (including default port setting).

As long as there is no conflict of ports, you can install the test version and official version into the same compouter, but please note, the power of the machine is highly required, such as 4core CPU, 4Gb RAM above or at least 4Mb broadwidth...

### 2.1 Download and unpack

test version (testnet)  

```
wget https://www.asch.io/downloads/asch-linux-latest-testnet.tar.gz
tar zxvf asch-linux-latest-testnet.tar.gz
```

official version (mainnet)
```
wget https://www.asch.io/downloads/asch-linux-latest-mainnet.tar.gz
tar zxvf asch-linux-latest-mainnet.tar.gz
```

Usually, the version number of testnet will larger than that of mainnet.

### 2.2 Initialize
In this step, something will be done for you automatically:  
- Install some dependency modules like **sqlite3**
- Install and configure the ntp service by which your time can be synchronized with that of other nodes.

There is no need to run this step once although there is no harm to execute it more than one time.

	# locate to your installation folder
	# for ubuntu
	chmod u+x init/*.sh && ./aschd configure
	# for other linux
	please install sqlite3/ntp using apt-get/yum/zypper or other package manager.
	...

## 3. Run
```
# Enter the installation folder

# start the service
./aschd start

# stop the service
./aschd stop

# check the running status
./aschd status

# restart the service
./aschd restart

# upgrade the system
./aschd upgrade

# re-synchronize the blockchain
./aschd rebuild

# check the system version
./aschd version

# start producing block
./aschd enable "your sercret"

# check the log
tail -f logs/debug.log
```

## 4. Delegate configuration
### 4.1 Delegate's password

Use your favorite editor to open `config.json` and locate the `[secret]` field. Fill this field with your delegate's password. This field is an array of JSON format string, which means you can set several passwords in one particular computer, but be careful not to duplicate them.

![forging secret](./assets/forging-secret.png)

**NOTICE:** DO NOT configure the same password, no matter in a single machine or in multiple machines.

### 4.2 Public IP
By default, the system will automatically detect the public IP you assigned. But in some host built on cloud, the public IP may not be able to identified. Under such circumstance, the following field needs to be appended in `config.json`:
```
"publicIp": "Here is your public IP",
```
And don't forget restarting your system after configuration by:
```
./aschd restart
```

## 5. Upgrade the system
```
./aschd upgrade
./aschd start
```
## 6. Troubleshooting
### 6.1 I cannot access my online wallet
#### Solution 1
Check the `[port]` field in `config.json`, the default port numbers of **testnet** and **mainnet** are `4096` and `8192`, respectively.
The official seed nodes changed the port to 80.
Check the firewall configuration, and you need to open the Asch port inbound and outbound.

#### Solution 2
Check whether service is started by typing commands as follows:
```
./aschd status

# if service is not started, then following message will be shown
Asch server is not running

# then restart the service
./aschd restart
```

### 6.2 Unable to generate the block
#### Solution 1
Make sure the rank of delegate is in top 101

#### Solution 2
Check the error log with following commands:
```
grep Failed logs/debug.log
```
If there is an error message like this:
```
Failed to get public ip, block forging MAY not work!
```
it means system cannot get the public IP, and it will need you to configure it manually, see **[4.2 Public IP]**

#### Solution 3
Check the error log with following commands:
```
grep error logs/debug.log
```
If there is an error message like this:
```
Failed to load delegates: Account xxxxxxxxx not found
```
It means that the passphrase of your account has not been registed as delegates yet, or you started the service before it registered as a delegate. Simply restarting the servie will solve the problem.

**NOTICE:** If your node is synchronizing the blocks, restart the system after the synchronization is finished.
```
./aschd restart
```
If the system has been restarted successfully, the following log will be found:
```
grep Forging logs/debug.log

Forging enabled on account: xxxxxxxxxxxxxx
```
### 6.3 Unable to synchronize the block （blockchain growth suspend）
*This issue can be confirmed by comparing the block height of your wallet and official node*

First, try `restart` the system:
```
./aschd restart
```
If problem is still unsolved, try `rebuild`
```
./aschd rebuild
```