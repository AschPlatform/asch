# Introducing Asch Dapp Development
As we mentioned in whitepaper, not like Etherum or Bitcoin, Asch is using a sidechain framework as a platform for decentralised applications (DApp). Usually, each DApp runs on its own sidechain. 

## The Independency of Sidechain

The advantage of sidechain framework is that both the code and data are independent from main blockchain, hence data over-dilation can be avoided. In fact this is a nature partition mechanism.
A sidechain has its own blockchain, delegates and nodes network, which means a block generated from a sidechain will be able to broadcast among the nodes belong to this sidechain.

Every coin has to sides, so does independency of sidechain. After finishing the developement of DApp, developers still need to consider the operating and maintenance. In detail, it is necessary for developers to guarntee enough nodes to maintain acceptable security.

From this perspective, the sidechain mechanism is not as good as Ethereum. Once a DApp is deployed on Ethereum, all the nodes in Ethereum can work for it, as well as promise the security.


## The Flexibility of Sidechain

Sidechain mechanism, however, has its own value of existence since not every application needs such a high level security. Based on sidechain mechanism, Asch can provide a more flexible choice to users.

For example, let's say Asch system has 1000 nodes. And under this circumstance some DApps are important so that they need 500 nodes to run. But some others may not be such crucial and only 100 nodes can meet their requirements. The point is that all of these choices are totally up to users and developers.

Comparily, only one option is available in Ethereum, which is all nodes are occupied to run this application. It is said that Ethereum is also about to provide a partition mechanism, which is a solution that Asch system has already had.

And obviously for those crucial applications that require high level security, Asch system still allows to develop on main blockchain. But this priority cannot be granted to all the developers because of unlimited dilations of main blockchain and potential risk of uncertainty (such as DAO issue)

The flexibility of sidechain is also reflected in that all paramaters of its blockchain can be customized. You can configure some common ones like block interval, block reward, or transaction fee's destination, or if you are an advanced user, you can even revise the consensus algorithm.

But the most important thing is business logic, which can be easily developed on sidechain platform, no matter whether it is the business related transactions or smart contracts. Note that Asch is different with blockstreams, the inventor of sidechain, because the blockstreams' sidechain is just another cryptocurrency system on which it is difficult to develop new generation transaction system and smart contracts.

Let's see the following graph

Each black circus presents a node, and all 64 nodes constitute the network of main blockchain. In the red frame is sidechain No.1, whose sidechain network is composed by 12 nodes. Sidechain No.2 is represented by the blue frame, which contains 36 nodes.

![sidechain deploy architecture](./assets/sidechain-deploy.png)

## The Reciprocity of Main Chain and Sidechain

There is a reciprocity relationship between the Asch main chain and the sidechains. Asch provides the essential foundation to sidechain as all kinds of API such as database writing , network communication or encrytion. Meanwhile, sidechain brings more nodes to supply hence strengthen the whole Asch system.

It is unnecessary for sidechain developers to provides all required machines. Oppositely, they can utilized existed nodes as long as the owners of those nodes allow to install the applications on them.

In addition, XAS, the currency of Asch main chain, can be transferred to sidechain. Because of the characteristic of XAS that is able to trade in exchanges, it can be a reliable media of value that is suitable for the assets existed in sidechain. Developers do not need to concern the trading platform problems when they issue an asset in sidechain because they can exchange it with XAS directly.


## Solution of Productivity

We provide a set of templates, (or we can say scaffold or development framework) for sidechain in the SDK. Most of the fundamental functionalities of sidechain have been already completed, and all DApp developers needs to concern is just real business logic. At this point, DApp development on Asch platform has the same difficulty as on the Ethereum framework. 

The development language used in Asch sidechain framework is nodejs, upon which we built many common libraries that can be directly used by developers. Also developers can install anything they need since there is a large Javascript community providing enough supports.

The following is modules built in Asch platform.

![inbuilt modules](./assets/inbuilt-modules.png)

## Solution of Security

Different with those nodes deficiency issues we mentioned above, the security problems here we discuss are those sidechain codes intrude on DApp users of Asch platform.

We hope each Asch node has its own sidechain installed, and the owner of this node does not have to trust the sidechain developer. It means that a security mechanism is required to provide some protection measures such as preventing sidechain from reading file system or manipulating network.

To sovle this problem, sidechain code within Asch system is launched as a child-process,  which firstly loads a Javascript virtual machine isolated by sandbox mechanism that is a purely clean virtual machine without `require` function and any unnecessary modules.

Then we inplant a customized `require` and some common and secure modules, and then load the sidechain code. We also provide a set of API via IPC (inter-process communication). All of these measures ensure that the sidechain framework has enough API to use, as well as application users of sidechain will not need to suffer any risk.


![process structure](./assets/process-structure.png)

## Tutorials

Here are some tutorials from the begining which will be helpful to the developers to rapidly develop applications.

- [Dapp Development Tutorial 1: Asch Dapp Hello World](./dapp_docs/1_hello_en.md)
	This tutorial shows how to create and publish a basic sidechain application, as well as introduces the source code structure of sidechain framework.

- [Dapp Development Tutorial 2: Asch Dapp Asset](./dapp_docs/2_asset_en.md)
	This tutorial shows how to designate a built-in asset to sidechain and then analyse communication interface between the front end and back end. 


- [Dapp Development Tutorial 3: Asch Dapp Mini DAO](./dapp_docs/3_mini_dao_en.md)
	This tutorial shows how to create a new type transaction or smart contract, and demostrates a mini dao project with project management and voting function.

- [Dapp Development Tutorial 4: Asch Dapp Dice Game](./dapp_docs/4_dice_game_en.md)
	This tutorial shows how to crate more complicate transaction or smart contract, how to establish the connection among contracts, and how to carry out the contract based on historic data. The tutorial also demostrates a dice game.

- [Dapp Development Tutorial 5: Publish Dapp online](./dapp_docs/5_dapp_publish_en.md)
	This tutorial shows how to register the application to online system (testnet, mainnet0 and how to install/uninstall it.
