# Asch-CLI Dokumentation
---
Inhaltsverzeichnis
=================

- [Asch-CLI Dokumentation](#asch-cli-dokumentation)
  - [0 Asch-CLI Übersicht](#0-asch-cli-%C3%9Cbersicht)
  - [1 Asch-CLI Installation](#1-asch-cli-installation)
  - [2 Asch-CLI Zusammenfassung](#2-asch-cli-zusammenfassung)
  - [3 Asch-CLI Parameter](#3-asch-cli-parameter)
    - [3.1 Zeige die Hilfsinformationen](#31-zeige-die-hilfsinformationen)
    - [3.2 Zeige die Version der Asch-CLI](#32-zeige-die-version-der-asch-cli)
    - [3.3 Spezifiziere eine IP-Adresse oder einen Hostnamen für den Asch-Zielserver](#33-spezifiziere-eine-ip-adresse-oder-einen-hostnamen-f%C3%BCr-den-asch-zielserver)
    - [3.4 Spezifiziere eine Portnummer auf dem Asch-Zielserver](#34-spezifiziere-eine-portnummer-auf-dem-asch-zielserver)
    - [3.5 Verwende die Haupt-Blockchain](#35-verwende-die-haupt-blockchain)
  - [4 Asch-CLI unterstützte Parameter](#4-asch-cli-unterst%C3%BCtzte-parameter)
    - [4.1 Zeige die Höhe der Blockchain](#41-zeige-die-h%C3%B6he-der-blockchain)
    - [4.2 Zeige den Status der Blockchain](#42-zeige-den-status-der-blockchain)
    - [4.3 Zeige Kontoinformationen mittels Passwort](#43-zeige-kontoinformationen-mittels-passwort)
    - [4.4 Zeige Kontoinformationen anhand eines öffentlichen Schlüssels](#44-zeige-kontoinformationen-anhand-eines-%C3%B6ffentlichen-schl%C3%BCssels)
    - [4.5 Zeige ein Kontosaldo anhand einer Kontoadresse](#45-zeige-ein-kontosaldo-anhand-einer-kontoadresse)
    - [4.6 Zeige Kontoinformationen anhand einer Kontoadresse](#46-zeige-kontoinformationen-anhand-einer-kontoadresse)
    - [4.7 Zeige alle Stimmabgaben für Delegate anhand einer öffentlichen Adresse](#47-zeige-alle-stimmabgaben-f%C3%BCr-delegate-anhand-einer-%C3%B6ffentlichen-adresse)
    - [4.8 Zeige die Anzahl aller Delegate](#48-zeige-die-anzahl-aller-delegate)
    - [4.9 Zeige Informationen zu Delegaten und sortiere nach bestimmten Feldern](#49-zeige-informationen-zu-delegaten-und-sortiere-nach-bestimmten-feldern)
    - [4.10 Zeige die Knoten die für ein Delegat gestimmt haben, anhand des öffentlichen Schlüssels des Delegats](#410-zeige-die-knoten-die-f%C3%BCr-ein-delegat-gestimmt-haben-anhand-des-%C3%B6ffentlichen-schl%C3%BCssels-des-delegats)
    - [4.11 Zeige die Informationen zu einem Delegat anhand seines öffentlichen Schlüssels an](#411-zeige-die-informationen-zu-einem-delegat-anhand-seines-%C3%B6ffentlichen-schl%C3%BCssels-an)
    - [4.12 Zeige die Informationen zu einem Delegat anhand seines Namens](#412-zeige-die-informationen-zu-einem-delegat-anhand-seines-namens)
    - [4.13 Zeige die Information zu einem oder mehreren Blöcken im Netzwerk an](#413-zeige-die-information-zu-einem-oder-mehreren-bl%C3%B6cken-im-netzwerk-an)
    - [4.14 Überprüfe Blockinformationen mit einer BlockID](#414-%C3%9Cberpr%C3%BCfe-blockinformationen-mit-einer-blockid)
    - [4.15 Zeige Informationen zu einem Block anhand der Blockhöhe](#415-zeige-informationen-zu-einem-block-anhand-der-blockh%C3%B6he)
    - [4.16 Zeige den Netzwerkstatus / den Status der Peers an](#416-zeige-den-netzwerkstatus-den-status-der-peers-an)
    - [4.17 Zeige unbestätigte Transaktionen anhand einer öffentlichen Adresse](#417-zeige-unbest%C3%A4tigte-transaktionen-anhand-einer-%C3%B6ffentlichen-adresse)
    - [4.18 Zeige / analysiere Transaktionsinformationen für das gesamte Netzwerk](#418-zeige-analysiere-transaktionsinformationen-f%C3%BCr-das-gesamte-netzwerk)
    - [4.19 Zeige Transaktionsdetails anhand einer Transaktions-ID](#419-zeige-transaktionsdetails-anhand-einer-transaktions-id)
    - [4.20 Geld überweisen](#420-geld-%C3%BCberweisen)
    - [4.21 Ein Delegat registrieren](#421-ein-delegat-registrieren)
    - [4.22 Für ein Delegat abstimmen](#422-f%C3%BCr-ein-delegat-abstimmen)
    - [4.23 Die Stimmabgabe für ein Delegat zurückziehen](#423-die-stimmabgabe-f%C3%BCr-ein-delegat-zur%C3%BCckziehen)
    - [4.24 Ein zweites Passwort setzen](#424-ein-zweites-passwort-setzen)
    - [4.25 Eine Dapp registrieren (dezentrale Applikation)](#425-eine-dapp-registrieren-dezentrale-applikation)
    - [4.26 Verträge](#426-vertr%C3%A4ge)
    - [4.27 Verschlüsselung](#427-verschl%C3%BCsselung)
    - [4.28 Dapp Befehle](#428-dapp-befehle)
    - [4.29 Erstelle den ersten Block der Blockchain (Genesisblock)](#429-erstelle-den-ersten-block-der-blockchain-genesisblock)
    - [4.30 Überprüfe den Status aller Knoten / Peers im Netzwerk](#430-%C3%9Cberpr%C3%BCfe-den-status-aller-knoten-peers-im-netzwerk)
    - [4.31 Überprüfe den Status aller Delegate](#431-%C3%9Cberpr%C3%BCfe-den-status-aller-delegate)
    - [4.32 Zeige das Land aus dem ursprünglich die IP-Adresse des Knotens registriert wurde](#432-zeige-das-land-aus-dem-urspr%C3%BCnglich-die-ip-adresse-des-knotens-registriert-wurde)

Inhaltsverzeichnis mittels [markdown-toc](https://github.com/AlanWalk/markdown-toc) erstellt
---

## 0 Asch-CLI Übersicht
Aus dem [Asch Whitepaper](/asch_whitepaper_de.md)
> Asch-CLI ist eine Asch Kommandozeile (CLI steht für command-line interface). Mit Hilfe der Asch-CLI können Entwickler ohne große Mühe eine Sidechain erstellen und auf dieser entwickeln. Das System bietet eine Vielzahl an APIs welche das Erstellen von intelligenten Verträgen (Smart Contracts) ermöglicht. Diese APIs umfassen die Möglichkeit für Konsens, Zufallszahlen, Datenbank-Zugriff, Kryptographie und vieles mehr.

## 1 Asch-CLI Installation
- Installiere den node Paket-Manager **npm** `sudo apt-get install npm`

- Installiere die Asch-CLI `npm install -g asch-cli` Hinweis: Wenn dein Standort China ist, versuche den folgenden Parameter um die Installation zu beschleunigen. `--registry=http://registry.npm.taobao.org`
 

## 2 Asch-CLI Zusammenfassung
`asch-cli [option] [command]`

## 3 Asch-CLI Parameter
### 3.1 Zeige die Hilfsinformationen
**Parameter:** 	-h, --help  
**Rückgabe:**     Eine Übersicht über alle Parameter und Subparameter  
**Verwendung:**  	
 - ```asch-cli -h``` #zeige Asch-CLI Hilfsinformationen 
 - ```asch-cli [commands] -h``` #zeige Hilfsinformationen zu einem bestimmten Parameter

**Beispiel:**
```
root@asch:~# asch-cli -h #zeige die Hilfe an
  Usage: asch-cli [options] [command]
  Commands:

    getheight                              get block height
    getblockstatus                         get block status
    openaccount [secret]                   open your account and get the infomation by secret
    openaccountbypublickey [publickey]     open your account and get the infomation by publickey
    getbalance [address]                   get balance by address
    getaccount [address]                   get account by address
    getvoteddelegates [options] [address]  get delegates voted by address
    getdelegatescount                      get delegates count
    getdelegates [options]                 get delegates
    getvoters [publicKey]                  get voters of a delegate by public key
    getdelegatebypublickey [publicKey]     get delegate by public key
    getdelegatebyusername [username]       get delegate by username
    getblocks [options]                    get blocks
    getblockbyid [id]                      get block by id
    getblockbyheight [height]              get block by height
    getpeers [options]                     get peers
    getunconfirmedtransactions [options]   get unconfirmed transactions
    gettransactions [options]              get transactions
    gettransaction [id]                    get transactions
    sendmoney [options]                    send money to some address
    registerdelegate [options]             register delegate
    upvote [options]                       vote for delegates
    downvote [options]                     cancel vote for delegates
    setsecondsecret [options]              set second secret
    registerdapp [options]                 register a dapp
    contract [options]                     contract operations
    crypto [options]                       crypto operations
    dapps [options]                        manage your dapps
    creategenesis [options]                create genesis block
    peerstat                               analyze block height of all peers
    delegatestat                           analyze delegates status
    ipstat                                 analyze peer ip info

  Options:

    -h, --help         output usage information
    -V, --version      output the version number
    -H, --host <host>  Specify the hostname or ip of the node, default: 127.0.0.1
    -P, --port <port>  Specify the port of the node, default: 4096
    -M, --main         Specify the mainnet, default: false

root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getvoteddelegates -h #print Asch-CLI command help information
  Usage: getvoteddelegates [options] [address]
  get delegates voted by address
  Options:

    -h, --help        output usage information
    -o, --offset <n>  
    -l, --limit <n>   
```

### 3.2 Zeige die Version der Asch-CLI 
**Parameter:** 	-V, --version  
**Rückgabe:**  Die verwendete Version
**Verwendung:**  `asch-cli -V`	

**Beispiel:**
 
```
root@asch:~# asch-cli -V
1.0.0
```

### 3.3 Spezifiziere eine IP-Adresse oder einen Hostnamen für den Asch-Zielserver
**Parameter:** -H, --host &lt;host&gt; [command] *(Default: 127.0.0.1)* 

**Rückgabe:** keine

**Verwendung:** `asch-cli -H 45.32.248.33 [command]`

**Beispiel:**
```
root@asch:~# asch-cli -H 45.32.248.33 getheight     #zeige die Blockhöhe des Asch-Servers auf 45.32.248.33
101236
```

### 3.4 Spezifiziere eine Portnummer auf dem Asch-Zielserver
**Parameter:** -P, --port &lt;port&gt; [command] *(Default: 4096)*

**Rückgabe:** keine

**Verwendung:** ```asch-cli -P 4096```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getheight  
102313
```

### 3.5 Verwende die Haupt-Blockchain
**Parameter:** -M, --main     *(Default: testchain)*

**Rückgabe:** keine

**Verwendung:** ```asch-cli -M``` 

**Beispiel:**

```
root@asch:~# asch-cli -M -H *.*.*.105 -P 8192 getheight  #zeige die Blockhöhe der Asch-Hauptblockchain
```

## 4 Asch-CLI unterstützte Parameter 
### 4.1 Zeige die Höhe der Blockchain
**Befehl:** getheight

**Rückgabe:** Die Höhe der Blockchain (die Anzahl der Blöcke seit dem Ursprungsblock)

**Verwendung:** ```asch-cli getheight```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getheight
105387
```

### 4.2 Zeige den Status der Blockchain
**Befehl:** getblockstatus

**Rückgabe:** Ein JSON formattierter String der folgende Informationen beinhaltet: Blockchain-Höhe, die Transaktionsgebühr, den Milestone, die Belohnung für jedes Delegat und das gesamte Volumen 

**Verwendung:** ```asch-cli getblockstatus```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getblockstatus
{
  "success": true,
  "height": 105392,
  "fee": 10000000,
  "milestone": 0,
  "reward": 350000000,
  "supply": 10036887200000000
}
```

### 4.3 Zeige Kontoinformationen mittels Passwort
**Befehl:**  openaccount [secret]

**Rückgabe:** Ein JSON-String mit folgenden Konto-Informationen: Adresse, Saldo, öffentlicher Schlüssel, zweiter öffentlicher Schlüssel etc.

**Verwendung:** ```asch-cli openaccount "password"```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 openaccount "fault still attack alley expand music basket purse later educate follow ride"
{
  "address": "16723473400748954103",
  "unconfirmedBalance": 20000000000,
  "balance": 20000000000,
  "publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",
  "unconfirmedSignature": false,
  "secondSignature": false,
  "secondPublicKey": "",
  "multisignatures": [],
  "u_multisignatures": []
}
```

### 4.4 Zeige Kontoinformationen anhand eines öffentlichen Schlüssels
**Befehl:** openaccountbypublickey [publickey]

**Rückgabe:** Ein JSON-String mit folgenden Informationen: Adresse, Saldo, öffentlicher Schlüssel, zweiter öffentlicher Schlüssel etc.

**Verwendung:** ```asch-cli openaccountbypublickey "public key"```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 openaccountbypublickey "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
{
  "address": "16723473400748954103",
  "unconfirmedBalance": 20000000000,
  "balance": 20000000000,
  "unconfirmedSignature": false,
  "secondSignature": false,
  "secondPublicKey": "",
  "multisignatures": [],
  "u_multisignatures": []
}
```

### 4.5 Zeige ein Kontosaldo anhand einer Kontoadresse
**Befehl:** getbalance [address]

**Rückgabe:** Eine Ganzzahl welche durch das Dividieren von 100000000 zustande kommt.

**Verwendung:** ```asch-cli getbalance [account address]```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getbalance 16723473400748954103
20000000000
```

### 4.6 Zeige Kontoinformationen anhand einer Kontoadresse 
**Befehl:** getaccount [address]

**Rückgabe:** Ein JSON-String mit folgenden Informationen: Addresse, Saldo, öffentlicher Schlüssel, zweiter öffentlicher Schlüssel etc.

**Verwendung:** ```asch-cli getaccount [account address]```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getaccount 16723473400748954103
{
  "address": "16723473400748954103",
  "unconfirmedBalance": 20000000000,
  "balance": 20000000000,
  "publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",
  "unconfirmedSignature": false,
  "secondSignature": false,
  "secondPublicKey": "",
  "multisignatures": [],
  "u_multisignatures": []
}
```

### 4.7 Zeige alle Stimmabgaben für Delegate anhand einer öffentlichen Adresse
**Befehl:** getvoteddelegates [options] [address]

**Rückgabe:** Eine Liste von allen Stimmabgaben die eine Adresse abgegeben hat

**Verwendung:** ```asch-cli getvoteddelegates [account address] -o offset -l [an integer that indicates the maximum delegates that can be printed]```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getvoteddelegates 15745540293890213312 -o 1 -l 2
{ success: true,
  delegates: 
   [ { username: 'wgl_002',
       address: '14636456069025293113',
       publicKey: 'ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7',
       vote: 8902736443247261,
       producedblocks: 1041,
       missedblocks: 6,
       rate: 1,
       approval: '88.70',
       productivity: '99.42' },
     { username: 'wgl_003',
       address: '9961157415582672274',
       publicKey: 'c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2',
       vote: 8902736443247261,
       producedblocks: 1043,
       missedblocks: 8,
       rate: 2,
       approval: '88.70',
       productivity: '99.23' }]
```

### 4.8 Zeige die Anzahl aller Delegate
**Befehl:** getdelegatescount

**Rückgabe:** Eine Ganzzahl mit der Anzahl aller Delegate im System

**Verwendung:** ```asch-cli getdelegatescount```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getdelegatescount
232
```

### 4.9 Zeige Informationen zu Delegaten und sortiere nach bestimmten Feldern
**Befehl:** getdelegates [options]

**Rückgabe:** Eine Liste mit Informationen zu Delegaten

**Verwendung:** ```asch-cli getdelegates -o [offset number] -l [an integer that indicates the maximum delegates that can be printed] -s rate:asc```

**HINWEIS:** ```rate:asc``` bedeutet, dass man aufsteigend (asc=aufsteigend, desc=absteigend) nach Stimmabgaben sortieren kann. Um alle Sortieroptionen zu sehen tippe `asch-cli getdelegates -h`

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 getdelegates -o 1 -l 1 -s rate:asc
[
  {
    "username": "wgl_003",
    "address": "9961157415582672274",
    "publicKey": "c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2",
    "vote": 9901544836887660,
    "producedblocks": 1044,
    "missedblocks": 8,
    "fees": 12150495022,
    "rewards": 161000000000,
    "rate": 2,
    "approval": 98.65,
    "productivity": 99.24,
    "forged": "173150495022"
  }
]
```

### 4.10 Zeige die Knoten die für ein Delegat gestimmt haben, anhand des öffentlichen Schlüssels des Delegats
**Befehl:** getvoters [publicKey]

**Rückgabe:** Eine Liste mit allen Wählern

**Verwendung:** ```asch-cli getvoters "delegate's public key"```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getvoters "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7"
[
  {
    "address": "2918354313445278349",
    "publicKey": "4fde4c49f1297d5d3a24b1494204543c4281aff17917ff7ff8ff32da3b4b222f",
    "balance": 1215522376203,
    "weight": 0.012110398031994424
  },
  {
    "address": "1523444724068322527",
    "publicKey": "8a6a61c28dc47541aadf1eecec2175c8f768f2331eea3472b1593bf1aa4e1fb4",
    "balance": 2109297623765,
    "weight": 0.02101519008767971
  }]
```
  
### 4.11 Zeige die Informationen zu einem Delegat anhand seines öffentlichen Schlüssels an
**Befehl:** getdelegatebypublickey [publicKey]

**Rückgabe:** Ein JSON-String mit folgenden Informationen zu einem Delegat: Name, Adresse, Wahlstimmen, produzierter Blöcke, forging reward etc.

**Verwendung:** asch-cli getdelegatebypublickey "delegate's public key"

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getdelegatebypublickey "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7"
{
  "username": "wgl_002",
  "address": "14636456069025293113",
  "publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",
  "vote": 9901546586887660,
  "producedblocks": 1042,
  "missedblocks": 6,
  "fees": 12383762523,
  "rewards": 161700000000,
  "rate": 1,
  "approval": 98.65,
  "productivity": 99.43,
  "forged": "174083762523"
}
```
### 4.12 Zeige die Informationen zu einem Delegat anhand seines Namens
**Befehl:** getdelegatebyusername [username]

**Rückgabe:** Ein JSON-String mit allen Details zu einem Delegat

**Verwendung:** ```asch-cli getdelegatebyusername "delegate's name"```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getdelegatebyusername "wgl_002"
{
  "username": "wgl_002",
  "address": "14636456069025293113",
  "publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",
  "vote": 9901546586887660,
  "producedblocks": 1042,
  "missedblocks": 6,
  "fees": 12383762523,
  "rewards": 161700000000,
  "rate": 1,
  "approval": 98.65,
  "productivity": 99.43,
  "forged": "174083762523"
}
```

### 4.13 Zeige die Information zu einem oder mehreren Blöcken im Netzwerk an
**Befehl:** getblocks [options]

**Rückgabe:** Ein JSON-String mit den gewünschten Blöcken

**Verwendung:** ```asch-cli getblocks -o [offset number] -l [an integer that indicates the maximum return data] -r [reward amount] -f [fee] -a [total amount] -g [public key that generates blocks] -s [sort rule]```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getblocks -o 1 -l 1 -r 350000000
{
  "success": true,
  "blocks": [
    {
      "id": "5533619110613125681",
      "version": 0,
      "timestamp": 3914630,
      "height": 60481,
      "previousBlock": "11174102253820291084",
      "numberOfTransactions": 0,
      "totalAmount": 0,
      "totalFee": 0,
      "reward": 350000000,
      "payloadLength": 0,
      "payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "generatorPublicKey": "68b28341605a24f6684df81882df1b13f421ec1cbba7d9aaa68f6c079705b258",
      "generatorId": "10651956562526682705",
      "blockSignature": "77115fdaab3215039bcf2bf8b3a461b3b7cafca7adae07e271a1a953ca6531a9e93f985bbec8544d596a568595661f1da742e20797b827d5b20aa75e8d80cc0b",
      "confirmations": "45349",
      "totalForged": 350000000
    }
  ],
  "count": 45350
}
```
### 4.14 Überprüfe Blockinformationen mit einer BlockID
**Befehl:** getblockbyid [id]

**Rückgabe:** Ein JSON-String mit folgenden Feldern: BlockID, Blockhöhe, BlockID des vorhergehenden Blocks, Anzahl der Transaktionen, Gesamtbetrag, Transaktionsgebühr, Belohnungen, Hash, der öffentliche Schlüssel des Blockgenerators und dessen ID, Blocksignatur, Anzahl der Bestätigungen etc.

**Verwendung:** ```asch-cli getblockbyid [block ID]```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getblockbyid 1425942128040906871 #zeige den Genesisblock an (erster Block in der Blockchain)
{
  "id": "1425942128040906871",
  "version": 0,
  "timestamp": 0,
  "height": 1,
  "previousBlock": "",
  "numberOfTransactions": 103,
  "totalAmount": 10000000000000000,
  "totalFee": 0,
  "reward": 0,
  "payloadLength": 19417,
  "payloadHash": "dd5cd3186d32145b01f8fd0bd23e3b3d72414b59b162d2e664e759db8fe60d46",
  "generatorPublicKey": "2af8566f8555bafb25df5a50e2e22b91a8577ceabc05d47dbd921572d28330e8",
  "generatorId": "1170992220085500484",
  "blockSignature": "a8ed06bfbfd1b630b1628e97a5c7c9383337c4ce32825969fad830890e0af981312be635b775ff46eea4f739da043f668a70efd5a940429e39fe5063852f4a01",
  "confirmations": "105901",
  "totalForged": 0
}
```

### 4.15 Zeige Informationen zu einem Block anhand der Blockhöhe
**Befehl:** getblockbyheight [height]

**Rückgabe:** Ein JSON-String mit folgenden Feldern: BlockID, Blockhöhe, BlockID des vorhergehenden Blocks, Anzahl der Transaktionen, Gesamtbetrag, Transaktionsgebühren, Belohnungen, der öffentliche Schlüssel des Blockgenerators und dessen ID, Blocksignatur, Anzahl der Bestätigungen etc.

**Verwendung:** ```asch-cli getblockbyheight [block height]```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getblockbyheight 1
{
  "id": "1425942128040906871",
  "version": 0,
  "timestamp": 0,
  "height": 1,
  "previousBlock": "",
  "numberOfTransactions": 103,
  "totalAmount": 10000000000000000,
  "totalFee": 0,
  "reward": 0,
  "payloadLength": 19417,
  "payloadHash": "dd5cd3186d32145b01f8fd0bd23e3b3d72414b59b162d2e664e759db8fe60d46",
  "generatorPublicKey": "2af8566f8555bafb25df5a50e2e22b91a8577ceabc05d47dbd921572d28330e8",
  "generatorId": "1170992220085500484",
  "blockSignature": "a8ed06bfbfd1b630b1628e97a5c7c9383337c4ce32825969fad830890e0af981312be635b775ff46eea4f739da043f668a70efd5a940429e39fe5063852f4a01",
  "confirmations": "105922",
  "totalForged": 0
}
```

### 4.16 Zeige den Netzwerkstatus / den Status der Peers an
**Befehl:** getpeers [options] 

**Rückgabe:** Ein JSON-String mit folgenden Feldern: IP-Adresse des Peer-Computers, das verwendete Betriebssystem, die Asch-Version etc.

**Verwendung:** ```asch-cli getpeers -o [offset] -l [an integer that indicates the maximum return data] -t [status value] -s [sort type] -v [version] -p [port number] --os [OS version]```

**HINWEIS:** Für weitere Informationen, tippe `asch-cli getpeers -h`

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getpeers -o 1 -l 2 
[
  {
    "ip": "45.32.62.184",
    "port": 4096,
    "state": 2,
    "os": "linux3.13.0-87-generic",
    "version": "1.0.0"
  },
  {
    "ip": "45.32.22.78",
    "port": 4096,
    "state": 2,
    "os": "linux3.13.0-87-generic",
    "version": "1.0.0"
  }
]
```

### 4.17 Zeige unbestätigte Transaktionen anhand einer öffentlichen Adresse
**Befehl:** getunconfirmedtransactions [options]

**Rückgabe:** Eine Liste mit sämtlichen Details zu allen noch unbestätigten Transaktionen

**Verwendung:** ```asch-cli getunconfirmedtransactions -p "sender's public key" -a [recipient's address]```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 getunconfirmedtransactions -k "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3" 
[
  {
    "type": 0,
    "timestamp": 4385190,
    "senderPublicKey": "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3",
    "signature": "98d65df3109802c707eeed706e90a907f337bddab58cb4c1fbe6ec2179aa1c85ec2903cc0cf44bf0092926829aa5a0a6ec99458f65b6ebd11f0988772e58740e",
    "recipientId": "16723473400748954103",
    "senderId": "15745540293890213312",
    "amount": 10000000000,
    "fee": 10000000,
    "signatures": [],
    "id": "17192581936339156329",
    "height": 0,
    "asset": {}
  }
]
```

### 4.18 Zeige / analysiere Transaktionsinformationen für das gesamte Netzwerk
**Befehl:** gettransactions [options]

**Rückgabe:** Eine Liste mit allen Transaktionsdetails

**Verwendung:** ```asch-cli gettransactions -b [block ID] -o [offset] -l [an integer that indicates the maximum return data]```

**HINWEIS:** Versuche `asch-cli gettransactions -h` um Informationen zu anderen Parameteroptionen anzuzeigen.

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 gettransactions -o 1 -l 2 #zeige die Information zu den ersten zwei Transaktionen in der Blockchain an
[
  {
    "id": "10169086766604015960",
    "height": "1",
    "blockId": "1425942128040906871",
    "type": 2,
    "timestamp": 0,
    "senderPublicKey": "991e0dda00d2c33ce68dd99471de8ebea7b58711f22a2e55236b8864c6d24c84",
    "senderId": "3331250159865474723",
    "recipientId": "",
    "amount": 0,
    "fee": 0,
    "signature": "60bf38e7a3515aeaa2cac491f7737c94087f448a862099408b90c2cf96d3fe4f709e22e6471dd4e37aca111d8573beeb7b6cff4ef451633d9aaf74ab97ce8d02",
    "signSignature": "",
    "signatures": null,
    "confirmations": "105988",
    "asset": {}
  },
  {
    "id": "10375311635154792515",
    "height": "1",
    "blockId": "1425942128040906871",
    "type": 2,
    "timestamp": 0,
    "senderPublicKey": "1674ae566c633cde3e01db8f04a02ea087081a270de2dd53e0e0b97c029106fb",
    "senderId": "9948352853509008057",
    "recipientId": "",
    "amount": 0,
    "fee": 0,
    "signature": "f09c1693cc26c4028c642cb1711cf71c2dee090a50904d1590c74d865b2f5f3ba720ed792704f5379ec9c4a20b018c5e95f325ea179236777a28cddffe8c580d",
    "signSignature": "",
    "signatures": null,
    "confirmations": "105988",
    "asset": {}
  }
]
```

### 4.19 Zeige Transaktionsdetails anhand einer Transaktions-ID
**Befehl:** gettransaction [id]

**Rückgabe:** Ein JSON-String mit folgenden Feldern: Transaktions-ID, Blockhöhe, BlockID, Zeitstempel, Öffentliche Adresse des Versenders, Empfangsadresse, Gesamtbetrag, Signatur, Anzahl der Bestätigungen, Assets etc.

**Verwendung:** ```asch-cli gettransaction [transactionID]```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 gettransaction 17192581936339156329
{
  "id": "17192581936339156329",
  "height": "105951",
  "blockId": "15051364118100195665",
  "type": 0,
  "timestamp": 4385190,
  "senderPublicKey": "d39d6f26869067473d685da742339d1a9117257fe14b3cc7261e3f2ed5a339e3",
  "senderId": "15745540293890213312",
  "recipientId": "16723473400748954103",
  "amount": 10000000000,
  "fee": 10000000,
  "signature": "98d65df3109802c707eeed706e90a907f337bddab58cb4c1fbe6ec2179aa1c85ec2903cc0cf44bf0092926829aa5a0a6ec99458f65b6ebd11f0988772e58740e",
  "signSignature": "",
  "signatures": null,
  "confirmations": "17",
  "asset": {}
}
```

### 4.20 Geld überweisen
**Befehl:** sendmoney [option]

**Rückgabe:** Bei erfolgreicher Ausführung wird "True" zurückgegeben, ansonsten kommt eine Fehlermeldung.

**Verwendung:** ```asch-cli sendmoney -e "[sender's password]" -t [recipient's address] -a [transfer amount] -s "[second password]"```

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 sendmoney -e "motion group blossom coral upper warrior pattern fragile sister misery palm admin" -t 16723473400748954103 -a 100
true
```

### 4.21 Ein Delegat registrieren
**Befehl:** registerdelegate [options]

**Rückgabe:** Bei erfolgreicher Ausführung wird "True" zurückgegeben, ansonsten kommt eine Fehlermeldung

**Verwendung:** ```asch-cli registerdelegate -e "[password]" -s "[second password]" -u "[delegate's name]"```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 registerdelegate -e "fault still attack alley expand music basket purse later educate follow ride" -u "delegate_register"
true
```

### 4.22 Für ein Delegat abstimmen 
**Befehl:** upvote [options] 

**Rückgabe:** Für ein Delegat abstimmen. Bei erfolgreicher Ausführung wird "True" zurückgegeben, ansonsten kommt eine Fehlermeldung

**Verwendung:** ```asch-cli upvote -e "[password]" -s "[second password]" -p "delegate's public key"```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 upvote -e "fault still attack alley expand music basket purse later educate follow ride" -p "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
true
```

### 4.23 Die Stimmabgabe für ein Delegat zurückziehen
**Befehl:** downvote [options]

**Rückgabe:** Die Stimmabgabe für ein Delegat zurückziehen. Bei einer erfolgrechen Ausführung wird "True" zurückgegeben, ansonsten kommt eine Fehlermeldung

**Verwendung:** ```asch-cli downvote -e "[password]" -s "[second password]" -p "delegate's public key"```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 downvote -e "fault still attack alley expand music basket purse later educate follow ride" -p "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"
true
```

### 4.24 Ein zweites Passwort setzen
**Befehl:** setsecondsecret [options]

**Rückgabe:**  Wenn erfolgreich ein zweites Passwort gesetz wurde kommt eine Bestätigung. Ansonsten kommt eine Fehlermeldung

**Verwendung:** ```asch-cli setsecondsecret -e "[password]" -s "[second password]"```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 setsecondsecret -e "fault still attack alley expand music basket purse later educate follow ride" -s "ce shi er ji mi ma"
true
```

### 4.25 Eine Dapp registrieren (dezentrale Applikation)
**Befehl:** registerdapp [options]

**Rückgabe:** keine

**Verwendung:** ```asch-cli registerdapp -e "[password]" -s "[second password]" -f [Dapp meta file]```

**Beispiel:**



### 4.26 Verträge
**Befehl:** contract [options]

**Rückgabe:** keine

**Verwendung:** 
 - ```asch-cli contract -a``` 	# einen Vertrag erstellen
 - ```asch-cli contract -d``` 	# einen Vertrag löschen

**Beispiel:**


### 4.27 Verschlüsselung
**Befehl:** crypto [option]

**Rückgabe:** Eine Liste

**Verwendung:**
- ```asch-cli -p``` # Erzeuge einen öffentlichen Schlüssel anhand eines Passworts
- ```asch-cli -g``` # Erstelle ein oder mehrere Konten

**Beispiel:**

```
root@asch:~# asch-cli -H 45.32.248.33 -P 4096 crypto -g
? Enter number of accounts to generate 1
[ { address: '16723473400748954103',
    secret: 'fault still attack alley expand music basket purse later educate follow ride',
    publicKey: 'bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9' } ]
Done
```

### 4.28 Dapp Befehle
**Befehl:** dapps [options]

**Rückgabe:** keine

**Verwendung:** ```asch-cli dapps -a```

**Beispiel:**

### 4.29 Erstelle den ersten Block der Blockchain (Genesisblock)
**Befehl:** creategenesis [options]

**Rückgabe:** Dieser Befehl erzeugt eine Genesisblock-Datei (genesisBlock.json) und die zugehörige Logdatei (genGenesisBlock.log) im aktuellen Verzeichnis

**Verwendung:** ```asch-cli creategenesis```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 creategenesis 
root@asch:~# more genesisBlock.json
{
  "version": 0,
  "totalAmount": 10000000000000000,
  "totalFee": 0,
  "reward": 0,
  "payloadHash": "baebdb59d0c19a07c2440e22c0512b4efe9794565b352375195c9e7e8a3817b0",
  "timestamp": 0,
  "numberOfTransactions": 103,
...
}
```

### 4.30 Überprüfe den Status aller Knoten / Peers im Netzwerk
**Befehl:** peerstat

**Rückgabe:** Informationen zu den einzelnen Peers wie: Die IP-Adresse, Port, Asch-Version, die Block-Höhe etc.

**Verwendung:** ```asch-cli peerstat```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 peerstat
45.32.248.33:4096 1.0.0 106036
45.32.62.184:4096 1.0.0 106036
45.32.19.241:4096 1.0.0 106036
```

### 4.31 Überprüfe den Status aller Delegate
**Befehl:** delegatestat

**Rückgabe:** Eine Tabelle mit folgenden Informationen über alle Delegate: Name, Adresse, Zustimmung, Produktivität, Anzahl der generierten Blöcke, Blockhöhe, BlockID, Datum des zuletzt generierten Blocks, etc.

**Verwendung:** ```asch-cli delegatestat```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 delegatestat
name	address	rate	approval	productivity	produced	height	id	time
nayimoliuguang	3331976396377269399	93	88.36%	98.39%	1037	105618	12962348710289833740	2016/08/17 21:07:20(1 hour ago)
jack	3705405381126069457	86	88.36%	99.41%	506	105628	5876778147855073736	2016/08/17 21:09:00(1 hour ago)
node_3	12796761013870716784	81	88.36%	80.51%	814	105784	4575518649204137595	2016/08/17 21:38:10(40 mins ago)
wgl_003	9961157415582672274	2	98.65%	99.24%	1047	105852	11175724889329116017	2016/08/17 21:49:40(28 mins ago)
xihulongjing	12676662200687508271	59	88.36%	76.92%	150	105853	15273855606472618453	2016/08/17 21:49:50(28 mins ago)
liangpeili	4514546945474752928	50	88.37%	99.68%	627	105855	3771943180359756069	2016/08/17 21:50:10(28 mins ago)
asch_tea1	8812460086240160222	4	98.58%	98.79%	1059	105857	14968719538781965695	2016/08/17 21:50:30(27 mins ago)
intmaster	7321911740133937168	97	88.36%	100%	1032	105871	6757656887343300317	2016/08/17 21:52:50(25 mins ago)
mode_6	9248745407080572308	8	88.48%	100%	1060	105873	3777454410915098884	2016/08/17 21:53:10(25 mins ago)
```

### 4.32 Zeige das Land aus dem ursprünglich die IP-Adresse des Knotens registriert wurde
**Befehl:** ipstat

**Rückgabe:** Das ursprüngliche Land aus dem die IP-Adresse stammte

**Verwendung:** ```asch-cli ipstat```

**Beispiel:**

```
root@asch:~# asch-cli -H 101.200.162.236 -P 4096 ipstat
美国	US
美国	US
美国	US
日本	JP
中国	CN
中国	CN
中国	CN
中国	CN
中国	CN
中国	CN
```
