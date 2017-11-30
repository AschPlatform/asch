# DApp Development Tutorial 5: Publish DApp in the Web

## 1 Register

Register in testnet

```
asch-cli -H <testnet host> -P <testnet port> registerdapp -e "<your secret>" -f path/to/dapp.json
```

Register in mainnet

```
asch-cli -H <mainnet host> -P <mainnet port> -M registerdapp -e "<your secret>" -f path/to/dapp.json
```

Here ```dapp.json``` is the meta information file generated when DApp is created.

These two commands can be executed in any machine. As long as ```host``` and ```port``` are provided, register process can be finished from any remote node. The default values of ```host``` and ```port``` are ```localhost``` and ```4096```, respectively.

Notice: if registering to mainnet, do not forget to add ```-M``` parameter.

## 2 Modify the genesis block

Sometime you may need to modify the genesis block, for example, you have used a primary password for the genesis block when developing in local, and you do not want to use this password or another sidechain delegate when DApp needs to be published in web. Under this circumstance you can modify the genesis block instead of re-create DApp from beginning.

```
# cd <asch dir>
asch-cli dapps -c
```

There are a series of questions - similar with those when creating DApp - prompted when executing the command, such as re-input genesis account password, delegates public key list, and inbuilt asset and so on.

## 3 Install / Uninstall

Install

```
asch-cli dapps -i
```

Uninstall

```
asch-cli dapps -u
```

Three parameters are required when using these two commands: DApp ID, node's address, and node's password, in which node's password is set in ```masterpassword``` field of ```config.json```. 