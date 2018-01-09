Inhaltsverzeichnis
=================

- [Asch-HTTP Interface Spezifikation](#asch-http-interface-spezifikation)
  - [1 Verwendung der API](#1-verwendung-der-api)
    - [1.1 Übersicht über Netzwerkrequests](#11-übersicht-über-netzwerkrequests)
  - [2 Interface](#2-interface)
    - [2.1 Konten](#21-konten)
      - [2.1.1 Login](#211-login)
        - [2.1.1.1 Einloggen nachdem lokal verschlüsselt wurde (wird ausdrücklich empfohlen)](#2111-einloggen-nachdem-lokal-verschlüsselt-wurde-wird-ausdrücklich-empfohlen)
        - [2.1.1.2 Einloggen ohne vorheriges lokales Verschlüssel (wird ausdrücklich nicht empfohlen)](#2112-einloggen-ohne-vorheriges-lokales-verschlüssel-wird-ausdrücklich-nicht-empfohlen)
      - [2.1.2 Zeige Kontoinformationen](#212-zeige-kontoinformationen)
      - [2.1.3 Zeige Saldo eines Kontos](#213-zeige-saldo-eines-kontos)
      - [2.1.4 Zeigen öffentlichen Schlüssel eines Kontos](#214-zeigen-öffentlichen-schlüssel-eines-kontos)
      - [2.1.5 Erzeuge öffentlichen Schlüssel](#215-erzeuge-öffentlichen-schlüssel)
      - [2.1.6 Zeige eine Liste von Stimmabgaben von einer Adresse](#216-zeige-eine-liste-von-stimmabgaben-von-einer-adresse)
      - [2.1.7 Zeige die Gebühren eines bestimmten Delegats](#217-zeige-die-gebühren-eines-bestimmten-delegats)
      - [2.1.8 Abstimmung](#218-abstimmung)
    - [2.2 Transaktionen](#22-transaktionen)
      - [2.2.1 Zeige die Transaktionsdetails](#221-zeige-die-transaktionsdetails)
      - [2.2.2 Zeige Details zu einer Transaktion](#222-zeige-details-zu-einer-transaktion)
      - [2.2.3 Zeige Transaktionsdetails anhand von der ID einer unbestätigten Transaktion](#223-zeige-transaktionsdetails-anhand-von-der-id-einer-unbestätigten-transaktion)
      - [2.2.4 Zeige unbestätigte Transaktionen [im ganzen Netzwerk]](#224-zeige-unbestätigte-transaktionen-im-ganzen-netzwerk)
      - [2.2.5 Erstelle eine Transaktion](#225-erstelle-eine-transaktion)
    - [2.3 Blocks](#23-blocks)
      - [2.3.1 Zeige Blockinformationen anhand von ID, Blockhöhe oder Hash](#231-zeige-blockinformationen-anhand-von-id-blockhöhe-oder-hash)
      - [2.3. Zeige den letzten Block an](#23-zeige-den-letzten-block-an)
      - [2.3.3 Zeige die Blockhöhe](#233-zeige-die-blockhöhe)
      - [2.3.4 Zeige die Transaktionsgebühr](#234-zeige-die-transaktionsgebühr)
      - [2.3.5 Zeige den Milestone](#235-zeige-den-milestone)
      - [2.3.6 Zeige die Belohnung für einen Block](#236-zeige-die-belohnung-für-einen-block)
      - [2.3.7 Zeige die maximalen Anzahl an XAS im Umlauf](#237-zeige-die-maximalen-anzahl-an-xas-im-umlauf)
      - [2.3.8 Zeige den momentanen Status der Blockchain](#238-zeige-den-momentanen-status-der-blockchain)
    - [2.4 Delegate](#24-delegate)
      - [2.4.1 Zeige die Anzahl aller Delegate](#241-zeige-die-anzahl-aller-delegate)
      - [2.4.2 Zeige die Konten die für ein Delegat abgestimmt haben anhand des öffentlichen Schlüssels des Delegats](#242-zeige-die-konten-die-für-ein-delegat-abgestimmt-haben-anhand-des-öffentlichen-schlüssels-des-delegats)
      - [2.4.3 Zeige die Details zu einem Delegat mittels öffentlichem Schlüssel oder Namen](#243-zeige-die-details-zu-einem-delegat-mittels-öffentlichem-schlüssel-oder-namen)
      - [2.4.4 Zeige eine Liste aller Delegate](#244-zeige-eine-liste-aller-delegate)
      - [2.4.5 Zeige die Transaktionsgebühr eines Delegats](#245-zeige-die-transaktionsgebühr-eines-delegats)
      - [2.4.6 Zeige die Schmiede-Informationen (Forging) anhand eines öffentlichen Schlüssels](#246-zeige-die-schmiede-informationen-forging-anhand-eines-öffentlichen-schlüssels)
      - [2.4.7 Registriere eine Delegat](#247-registriere-eine-delegat)
    - [2.5 Andere Knoten](#25-andere-knoten)
      - [2.5.1 Zeige die Information zu allen Knoten in einem Netzwerk](#251-zeige-die-information-zu-allen-knoten-in-einem-netzwerk)
      - [2.5.2 Zeige die Asch-Versionsnummer eines Knotens](#252-zeige-die-asch-versionsnummer-eines-knotens)
      - [2.5.3 Zeige die Information zu einem Knoten mittels seiner IP-Adresse](#253-zeige-die-information-zu-einem-knoten-mittels-seiner-ip-adresse)
    - [2.6 Die Synchronisierung und der Lademechanismus](#26-die-synchronisierung-und-der-lademechanismus)
      - [2.6.1 Zeige den lokalen Blockchain Ladestatus](#261-zeige-den-lokalen-blockchain-ladestatus)
      - [2.6.2 Zeige den Status der Block-Synchronisierung](#262-zeige-den-status-der-block-synchronisierung)
    - [2.7 Zweites Passwort](#27-zweites-passwort)
      - [2.7.1 Setze ein zweites Passwort](#271-setze-ein-zweites-passwort)
      - [2.7.2 Zeige die Gebühr für das Setzen eines zweiten Passworts](#272-zeige-die-gebühr-für-das-setzen-eines-zweiten-passworts)
    - [2.8 Multi-Signatur](#28-multi-signatur)
      - [2.8.1 Ein normales Konto in ein Multi-Signatur-Konto verwandeln](#281-ein-normales-konto-in-ein-multi-signatur-konto-verwandeln)
      - [2.8.2 Zeige Informationen zu ausstehenden Multi-Signatur-Transaktionen](#282-zeige-informationen-zu-ausstehenden-multi-signatur-transaktionen)
      - [2.8.3 Unterschriebe eine Multi-Signatur-Transaktion (als nicht Initiator)](#283-unterschriebe-eine-multi-signatur-transaktion-als-nicht-initiator)
      - [2.8.4 Zeige Details zu einem Multi-Signatur Konto](#284-zeige-details-zu-einem-multi-signatur-konto)
    - [2.9 Peer2Peer Transport[sichere API]](#29-peer2peer-transportsichere-api)
      - [2.9.1 Übersicht](#291-übersicht)
      - [2.9.2 Transaktion](#292-transaktion)
        - [2.9.2.1 Setze ein zweites Bezahl-Passwort](#2921-setze-ein-zweites-bezahl-passwort)
        - [2.9.2.2 Geld überweisen](#2922-geld-überweisen)
        - [2.9.2.3 Ein Delegat registrieren](#2923-ein-delegat-registrieren)
        - [2.9.2.4 Wahl abgeben und Stimmabgabe zurückziehen](#2924-wahl-abgeben-und-stimmabgabe-zurückziehen)
  - [Appendix 1：Installiere das 'asch-js' Modul](#appendix-1installiere-das-asch-js-modul)


Inhaltsverzeichnis erstellt mittels [markdown-toc](https://github.com/AlanWalk/markdown-toc)


# Asch-HTTP Interface Spezifikation

---
## 1 Verwendung der API
### 1.1 Übersicht über Netzwerkrequests
- **Erstelle die Daten zum verschicken:** Laut der Asch-Interface Dokumentation müssen die Daten als JSON-Objekt versedet werden. (Um eine sichere Peer-to-Peer Verbindung herzustellen kann es hilfreich sein eine Signatur mittels asch-js zu erstellen. Siehe mehr in Abschnitt [2.9 Peer-to-Peer Transport](#29-Peer2Peer-Transport%5Bsichere-API%5D).
- **Sende Daten:** Sende das erstellte Objekt zur Asch-Plattform mittels HTTP POST/GET
- **Das Asch System überprüft die gesendeten Daten:** Nachdem der Asch-Server die Daten empfangen hat, wird er diese validieren und dann weiter verarbeiten.
- **Daten werden zurückgesandt:** Das Asch-System retouniert die Daten als JSON-Objekt. Weiterführende API-Informationen findest du weiter unten.
- **Der Client verarbeitet die empfangen Daten**

## 2 Interface
### 2.1 Konten

#### 2.1.1 Login
##### 2.1.1.1 Einloggen nachdem lokal verschlüsselt wurde (wird ausdrücklich empfohlen)   
API Endpunkt: /api/accounts/open2/   
HTTP Verb: POST   
Unterstützes Datenformat: JSON   
Hinweis: Der öffentliche Schlüssel muss lokal mit Hilfe des Passwortes generiert werden (siehe Beispiel)

Beschreibung der Parameter:

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |
|publicKey |string |Ja|Öffentlicher Schlüssel|
   
Beschreibung der Antwort-Parameter:

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Ob der Login erfolreich war      |    
|account|json   |Kontoinformationen|    
|latestBlock|json  |Informationen zum letzten Block|    
|version|json  |Asch-Versionsnummer|
Beispiel:   
  
```js
var AschJS = require('asch-js');  //Mehr Informationen zu asch-js findest du im Appendix ganz unten
var publicKey = AschJS.crypto.getKeys(secret).publicKey;  //zeige die Adresse anhand des Geheimnisses 
// var address = AschJS.crypto.getAddress(publicKey);   //zeige die Adresse anhand des öffentlichen Schlüssels

// Schicke die gerade gesammelten Daten an den Asch-Server mit Hilfe der HTTP POST Methode   
curl -X POST -H "Content-Datentyp: application/json" -k -d '{"publicKey":"bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"}' http://45.32.248.33:4096/api/accounts/open2/   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"account": {   
		"address": "16723473400748954103",   
		"unconfirmedBalance": 19480000000,   
		"balance": 19480000000,   
		"unconfirmedSignature": false,   
		"secondSignature": true,   
		"secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",   
		"multisignatures": [],   
		"u_multisignatures": []   
	},   
	"latestBlock": {   
		"height": 111923,   
		"timestamp": 4446270   
	},   
	"version": {   
		"version": "1.0.0",   
		"build": "12:11:11 16/08/2016",   
		"net": "testnet"   
	}   
```   
   
##### 2.1.1.2 Einloggen ohne vorheriges lokales Verschlüsseln (wird ausdrücklich nicht empfohlen)
API Endpunkt: /api/accounts/open/   
HTTP Verb: POST   
Unterstützes Datenformat: JSON
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Passwort des Asch-Kontos|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Ob der Login erfolgreich war|    
|account|json   |Kontoinformationen |    
   
Beispiel:   
```bash   
curl -X POST -H "Content-Datentyp: application/json" -k -d '{"secret":"fault still attack alley expand music basket purse later educate follow ride"}' http://45.32.248.33:4096/api/accounts/open/   
```   
   
Mögliche JSON Antwort:   
```js   
{   
    "success": true,    
    "account": {   
        "address": "16723473400748954103",    
        "unconfirmedBalance": 19480000000,    
        "balance": 19480000000,    
        "publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",    
        "unconfirmedSignature": false,    
        "secondSignature": true,    
        "secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",    
        "multisignatures": [ ],    
        "u_multisignatures": [ ]   
    }   
}   
```   
#### 2.1.2 Zeige Kontoinformationen   
API Endpunkt: /api/accounts   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|address |string |Ja|Client Adresse, Minimum:1|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert|    
|account|json  |Kontoinformationen|
|latestBlock|json  |Informationen zum letzten Block|    
|version|json  |Asch-Versionsnummer|    
   
Beispiel:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/accounts?address=16723473400748954103   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"account": {   
		"address": "16723473400748954103",  //Asch Adresse   
		"unconfirmedBalance": 19480000000,  //Die Summe des unbestätigten und des bereits bestätigten Saldos. Dieses sollte größer als das Saldo weiter unten sein.   
		"balance": 19480000000, //Saldo   
		"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",    //Öffentlicher Schlüssel   
		"unconfirmedSignature": false,   
		"secondSignature": true,    //zweite Signatur   
		"secondPublicKey": "edf30942beb74de5ed6368c792af8665e9636f32a5f1c9377bcdc3b252d3f277",  //zweiter öffentlicher Schlüssel
		"multisignatures": [],    
		"u_multisignatures": []   
	},   
	"latestBlock": {   
		"height": 114480,   //Blockhöhe
		"timestamp": 4471890   
	},   
	"version": {   
		"version": "1.0.0",   
		"build": "12:11:11 16/08/2016", //Datum des Builds   
		"net": "testnet"    //Blockchain-Typ: Mainnet oder Testnet
	}   
}   
```   
#### 2.1.3 Zeige Saldo eines Kontos   
API Endpunkt: /api/accounts/getBalance   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|address |string |Ja|Kontoadresse, Minimum:1      |   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert   |
|balance|integer  |Saldo      |    
|unconfirmedBalance|integer|Die Summe des unbestätigten und des bereits bestätigten Saldos. Dieses sollte größer als das Saldo sein.|   
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/getBalance?address=14636456069025293113'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"balance": 5281328514990,   
	"unconfirmedBalance": 5281328514990   
}   
```   
   
#### 2.1.4 Zeige öffentlichen Schlüssel eines Kontos 
API Endpunkt: /api/accounts/getPublickey   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|address |string |Ja|Adresse, Minimum:1     |   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert   
|publicKey|string  |Öffentlicher Schlüssel|    
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/getPublickey?address=14636456069025293113'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7"   
}   
```   
   
#### 2.1.5 Erzeuge öffentlichen Schlüssel
API Endpunkt: /api/accounts/generatePublickey   
HTTP Verb: POST   
Unterstützes Datenformat: JSON
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Passwort des Asch-Kontos|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|publicKey|string  |Öffentlicher Schlüssel|    
   
Beispiel:   
```bash   
curl -k -H "Content-Datentyp: application/json" -X POST -d '{"secret":"fault still attack alley expand music basket purse later educate follow ride"}' 'http://45.32.248.33:4096/api/accounts/generatePublickey'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"   
}   
```   
   
#### 2.1.6 Zeige eine Liste von Stimmabgaben von einer Adresse   
API Endpunkt: /api/accounts/delegates   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|address |string |Ja|Die Adresse welche die Stimme abgegeben hat|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|delegates|Array  |Eine Liste mit Kontos für welche diese Adresse bereits gestimmt hat|    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/delegates?address=14636456069025293113'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"delegates": [{   
		"username": "wgl_002",   
		"address": "14636456069025293113",   
		"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",   
		"vote": 9901985415600500,   
		"producedblocks": 1373,   
		"missedblocks": 6,   
		"rate": 1,   
		"approval": "98.54",   
		"productivity": "99.56"   
	},   
	{   
		"username": "wgl_003",   
		"address": "9961157415582672274",   
		"publicKey": "c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2",   
		"vote": 9891995435600500,   
		"producedblocks": 1371,   
		"missedblocks": 8,   
		"rate": 2,   
		"approval": "98.44",   
		"productivity": "99.41"   
	},   
	{   
		"username": "wgl_001",   
		"address": "1869971419039689816",   
		"publicKey": "c547df2dde6cbb4508aabcb5970d8f9132e5a1d1c422632da6bc20bf1df165b8",   
		"vote": 32401577128413,   
		"producedblocks": 969,   
		"missedblocks": 8,   
		"rate": 102,   
		"approval": "0.32",   
		"productivity": 0   
	}]   
}   
```   
   
#### 2.1.7 Zeige die Gebühren eines bestimmten Delegats   
API Endpunkt: /api/accounts/delegates/fee   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine  

Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|fee|integer  |Gebühren-Einstellungen      |    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/accounts/delegates/fee  
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"fee": 100000000   
}   
```   
   
   
#### 2.1.8 Abstimmung   
API Endpunkt: /api/accounts/delegates   
HTTP Verb: PUT   
Unterstützes Datenformat: JSON   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Passwort des Asch-Kontos|   
|publicKey|string  |Nein|Öffentlicher Schlüssel|    
|secondSecret|string|Nein|Zweites Asch-Konto Passwort. Länge zwischen 1 und 100|   
|delegates|Array||Eine Liste mit öffentlichen Schlüssel von Delegaten. Setze ein Plus (+) oder ein Minus (-) vor den öffentlichen Schlüssel um zu signalisieren, dass es sich um eine Stimmabgabe bzw. um die Rückziehung einer Stimme handelt.   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transaction|json  |Informationen zur Stimmabgabe      |    
   
   
Beispiel:   
```bash   
curl -k -H "Content-Datentyp: application/json" -X PUT -d '{"secret":"call scissors pupil water friend timber spend brand vote obey corn size","publicKey":"3ec1c9ec08c0512641deba37c0e95a0fe5fc3bdf58424009f594d7d6a4e28a2a","delegates":["+fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575"]}' 'http://45.32.248.33:4096/api/accounts/delegates'     
```   
   
Mögliche JSON Antwort:   
```js   
 {
	"success": true,
	"transaction": {
		"type": 3,  //Der Datentyp der Stimmabgabe ist '3'
		"amount": 0,
		"senderPublicKey": "3ec1c9ec08c0512641deba37c0e95a0fe5fc3bdf58424009f594d7d6a4e28a2a",
		"requesterPublicKey": null,
		"timestamp": 5056064,
		"asset": {
			"vote": {
				"votes": ["+fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575"]
			}
		},
		"recipientId": null,
		"signature": "0bff58c7311fc59b3c8b3ffc236bbfece9850c334fb0c292ab087f78cf9a6c0f4d3e541c501887a2c2ec46294c777e8f7bf7dea9cb7c9a175fdec641bb684f08",
		"id": "5630629337798595849",
		"fee": 10000000,
		"senderId": "15238461869262180695"
	}
}  
```   
   
### 2.2 Transaktionen   
#### 2.2.1 Zeige die Transaktionsdetails
API Endpunkt: /api/transactions   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Hinweis: Falls kein Parameter angegeben wird, dann werden alle Transaktionen retourniert 

Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|blockId |string |Nein|BlockID|   
|limit |integer |Nein|Rückgabe der Datensätze limitieren，Minimum：0, Maximum：100   |   
|type|integer  |Nein|Die Transaktions-Datentypen: 0:Normaler Transfer，1:Setzen eines zweiten Passworts，2:Delegat registrieren，3:Stimmabgabe，4:Multi-Signatur，5:DAPP，6:IN_TRANSFER，7:OUT_TRANSFER|   
|orderBy|string  |Nein|Sortiere nach einem Feld in der Tabelle，senderPublicKey:desc (asc=aufsteigend, desc=absteigend)|   
|offset|integer  |Nein|Paging-Abstand, Minimum 0|   
|senderPublicKey|string|Nein|Öffentlicher Schlüssel des Senders|   
|ownerPublicKey|string|Nein||
|ownerAddress|string|Nein||
|senderId|string|Nein|Adresse des Senders|
|recipientId|string|Nein|Adresse des Empfängers, Minimum:1|   
|amount|integer|Nein|Betrag|   
|fee|integer|Nein|Gebühr|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert  
|transactions|Array  |Eine Liste mit Transaktionsdetails|
|count|int|Anzahl der aufgelisteten Transaktionen|   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions?recipientId=16723473400748954103&orderBy=t_timestamp:desc&limit=3'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transactions": [{   
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
		"confirmations": "31802",   
		"asset": {   
			   
		}   
	},   
	{   
		"id": "7000452951235123088",   
		"height": "105473",   
		"blockId": "11877628176330539727",   
		"type": 0,   
		"timestamp": 4380147,   
		"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575",   
		"senderId": "16358246403719868041",   
		"recipientId": "16723473400748954103",   
		"amount": 10000000000,   
		"fee": 10000000,   
		"signature": "dc84044d4f6b4779eecc3a986b6507e458cc5964f601ebeb4d3b68a96129813f4940e14de950526dd685ca1328b6e477e6c57e95aeac45859a2ea62a587d0204",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "32280",   
		"asset": {   
			   
		}   
	},   
	{   
		"id": "14093929199102906687",   
		"height": "105460",   
		"blockId": "2237504897174225512",   
		"type": 0,   
		"timestamp": 4380024,   
		"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575",   
		"senderId": "16358246403719868041",   
		"recipientId": "16723473400748954103",   
		"amount": 10000000000,   
		"fee": 10000000,   
		"signature": "73ceddc3cbe5103fbdd9eee12f7e4d9a125a3bcf2e7cd04282b7329719735aeb36936762f17d842fb14813fa8f857b8144040e5117dffcfc7e2ae88e36440a0f",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "32293",   
		"asset": {   
			   
		}   
	}],   
	"count": 3   
}   
```   
#### 2.2.2 Zeige Details zu einer Transaktion
API Endpunkt: /api/transactions/GET   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|Id |string |Ja|TransaktionsId|   
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transactions|json  |Transaktionsdetails|    
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions/get?id=14093929199102906687'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transaction": {   
		"id": "14093929199102906687",   
		"height": "105460",   
		"blockId": "2237504897174225512",   
		"type": 0,   
		"timestamp": 4380024,   
		"senderPublicKey": "fafcd01f6b813fdeb3c086e60bc7fa9bfc8ef70ae7be47ce0ac5d06e7b1a8575",   
		"senderId": "16358246403719868041",   
		"recipientId": "16723473400748954103",   
		"amount": 10000000000,   
		"fee": 10000000,   
		"signature": "73ceddc3cbe5103fbdd9eee12f7e4d9a125a3bcf2e7cd04282b7329719735aeb36936762f17d842fb14813fa8f857b8144040e5117dffcfc7e2ae88e36440a0f",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "34268",   
		"asset": {   
		}   
	}   
}   
```   
   
#### 2.2.3 Zeige Transaktionsdetails anhand von der ID einer unbestätigten Transaktion
API Endpunkt: /api/transactions/unconfirmed/GET   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|id|string |Ja|Id einer unbestätigten Transaktion|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transaction|json  |Die Informationen zu der unbestätigten Transaktion|   
   
  
Beispiel:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/transactions/unconfirmed/get?id=7557072430673853692  //Normalerweise existiert eine unbestätigte Transaktion nur für wenige Sekunden (0-10 Sekunden). 
```   
   
Mögliche JSON Antwort:   
```js   
{
	"success": true,
	"transaction": {
		"type": 0,
		"amount": 10000,
		"senderPublicKey": "3ec1c9ec08c0512641deba37c0e95a0fe5fc3bdf58424009f594d7d6a4e28a2a",
		"requesterPublicKey": null,
		"timestamp": 5082322,
		"asset": {
			
		},
		"recipientId": "16723473400748954103",
		"signature": "3a97f8d63509ef964bda3d816366b8e9e2d9b5d4604a660e7cbeefe210cb910f5de9a51bece06c32d010f55502c62f0f59b8224e1c141731ddfee27206a88d02",
		"id": "7557072430673853692",
		"fee": 10000000,
		"senderId": "15238461869262180695"
	}
}
```   
   
   
#### 2.2.4 Zeige unbestätigte Transaktionen (im ganzen Netzwerk)
API Endpunkt: /api/transactions/unconfirmed   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Hinweis: Falls kein Parameter angegeben wurde, werden alle unbestätigten Transaktionen retourniert
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|senderPublicKey |string |Nein|Der öffentliche Schlüssel des Senders|   
|address |string |Nein|Adresse|   
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert|
|transactions|Array  |Eine Liste mit allen unbestätigten Transaktionen|    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/transactions/unconfirmed'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transactions": []      //Zur Zeit existieren keine unbestätigten Transaktionen im Netzwerk
}   
```   
   
#### 2.2.5 Erstelle eine Transaktion   
API Endpunkt: /api/transactions   
HTTP Verb: PUT   
Unterstützes Datenformat: JSON   
Hinweis: Der Empfänger muss (vor der Transaktion) bereits sich einmal in die Web-Wallet eingeloggt haben.
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Passwort des Asch-Kontos|   
|amount|integer|Ja|Betrag，muss zwischen 1 und 10000000000000000 (10^16^) sein|   
|recipientId|string|Ja|Addresse des Empfängers, Minimum:1|   
|publicKey|string|Nein|Öffentlicher Schlüssel des Senders|
|secondSecret|string|Nein|Zweites Passwort des Sender (dieses muss dem [BIP39 Standard](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) entsprechen), die Länge muss zwischen 1 und 100 sein|   
|multisigAccountPublicKey|string|Nein|Der öffentliche Schlüssel eines Multi-Signatur-Kontos|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transactionId|string  |Transaktions-ID|    
   
   
Beispiel:   
```bash   
curl -k -H "Content-Datentyp: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","amount":1000000,"recipientId":"16723473400748954103"}' 'http://45.32.248.33:4096/api/transactions'    
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transactionId": "16670272591943275531"   
}   
```   
   
### 2.3 Blocks
#### 2.3.1 Zeige Blockinformationen anhand von ID, Blockhöhe oder Hash
API Endpunkt: /api/blocks/   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung|
|------ |-----  |---  |----              |   
|id |string |only choose one of these three parameters    |BlockID|   
|height|string|ditto|Blockhöhe|   
|hash|string|ditto|Der Hash des blocks|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|block|json  |Die Blockdetails|    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/get?id=6076474715648888747'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"block": {   
		"id": "6076474715648888747",   
		"version": 0,   
		"timestamp": 4734070,   
		"height": 140538,   
		"previousBlock": "16033230167082515105",    //vorherige block ID   
		"numberOfTransactions": 0,  //Anzahl der Transaktionen   
		"totalAmount": 0,   //Summe der Transaktionen   
		"totalFee": 0,   
		"reward": 350000000,    //Belohnung   
		"payloadLength": 0,   
		"payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",   
		"generatorPublicKey": "1d352950c8141e1b35daba4a974a604519d7a2ef3a1ec0a503ce2653646aa052",   
		"generatorId": "6656029629904254066",   
		"blockSignature": "a53de66922cdc2f431acd0a474beec7cf7c420a8460b7b7caf84999be7caebb59fb7fbb7166c2c7013dbb431585ea7294722166cb08bf9663abf50b6bd81cd05",   
		"confirmations": "2",   
		"totalForged": 350000000   
	}   
}   
```   
   
#### 2.3. Zeige den letzten Block an
API Endpunkt: /api/blocks   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Hinweis: Falls kein Parameter spezifiziert wird, dann werden die Details zu allen Blöcken im Netzwerk zurückgegeben.
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|limit |integer |Nein|Maximal zu retounierende Anzahl an Datensätzen, muss zwischen 0 und 100 sein|   
|orderBy|string  |Nein|Sortiere anhand eines Feldes in der Tabelle z.B.: height:desc (asc=aufsteigend, desc=absteigend) |   
|offset|integer  |Nein|Paging-Abstand, minimum 0  |   
|generatorPublicKey|string  |Nein|Öffentlicher Schlüssels des Blockgenerators|   
|totalAmount|integer  |Nein|Anzahl aller Transaktionen, muss zwischen 0 und 10000000000000000 (10^16^) sein |   
|totalFee|integer  |Nein|Summe der Transaktionsgebühr, muss zwischen 0 und 10000000000000000 (10^16^) sein|
|reward|integer  |Nein|Belohnung, Minimum: 0  |   
|previousBlock|string  |Nein|Vorhergehender Block  |   
|height|integer  |Nein|Blockhöhe|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|blocks|Array  |Eine Liste von Blockdetails|    
|count|integer|Blockhöhe|


Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks?limit=2&offset=0&orderBy=height:desc'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"blocks": [{   
		"id": "12634047624004615059",   
		"version": 0,   
		"timestamp": 4708080,   
		"height": 137986,   
		"previousBlock": "3498191422350401106",   
		"numberOfTransactions": 0,  // die Anzahl der Transaktionen   
		"totalAmount": 0,   // Summe der Transaktionen   
		"totalFee": 0,  // Transaktionsgebühr
		"reward": 350000000,    // Belohnung
		"payloadLength": 0,   
		"payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",   
		"generatorPublicKey": "44db7bec89ef289d0def257285675ca14f2a947dfd2b70e6b1cff4392ce42ada",   
		"generatorId": "4925169939071346193",   
		"blockSignature": "83a2124e3e8201c1a6099b2ac8ab1c117ad34867978add3a90d41a64df9d2ad8fabc9ec14d27a77cd34c08a6479ef684f247c11b1cbbcb0e9767dffc85838600",   
		"confirmations": "1",   
		"totalForged": 350000000   
	},   
	{   
		"id": "3498191422350401106",   
		"version": 0,   
		"timestamp": 4708070,   
		"height": 137985,   
		"previousBlock": "14078155423801039323",   
		"numberOfTransactions": 0,   
		"totalAmount": 0,   
		"totalFee": 0,   
		"reward": 350000000,   
		"payloadLength": 0,   
		"payloadHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",   
		"generatorPublicKey": "500b1ec025cd64d36008341ed8d2508473ecf559be213ca5f9580620a21a592c",   
		"generatorId": "16006295608945777169",   
		"blockSignature": "a0b5ed6c94b1f33c4d0f017f21a08357061493392b19e34eeedf274b77c751e3f86c92443280de09ea1754d62fe7ef00e02acbdc3bc0c1063cef344bacaa4f07",   
		"confirmations": "2",   
		"totalForged": 350000000   
	}],   
	"count": 137986   
}   
```   
   
#### 2.3.3 Zeige die Blockhöhe   
API Endpunkt: /api/blocks/getHeight   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|height|integer  |Blockhöhe|    
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getheight'    
```   
   
Mögliche JSON Antwort:   
```js   
{"success":true,"height":140569}   
```   
   
#### 2.3.4 Zeige die Transaktionsgebühr   
API Endpunkt: /api/blocks/getFee   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|fee|integer  |Transaktionsgebühr|    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getfee'   
```   
   
Mögliche JSON Antwort:   
```js   
{"success":true,"fee":10000000}     //die Transaktionsgebühr ist 0.1 XAS   
```   
   
#### 2.3.5 Zeige den Milestone  
API Endpunkt: /api/blocks/getMilestone   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|milestone|integer  |      |    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getMilestone'    
```   
   
Mögliche JSON Antwort:   
```js   
{"success":true,"milestone":0}   
```   
   
#### 2.3.6 Zeige die Belohnung für einen Block
API Endpunkt: /api/blocks/getReward
HTTP Verb: GET
Unterstütztes Format: keine
Beschreibung der Parameter: keine 
Beschreibung der Antwort-Parameter:

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|reward|integer  |Die Belohnung für den Block|    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getReward'   
```   
   
Mögliche JSON Antwort:   
```js   
{"success":true,"reward":350000000} //jeder von dir erzeugte Block wird mit 3.5 XAS belohnt
```   
   
#### 2.3.7 Zeige die maximalen Anzahl an XAS im Umlauf
API Endpunkt: /api/blocks/getSupply   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|supply|integer  |XAS Summe im ganzen Netzwerk|    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getSupply'   
```   
   
Mögliche JSON Antwort:   
```js   
{"success":true,"supply":10049222600000000} //Zur Zeit existieren 100492226 XAS im Testnet   
```   
   
#### 2.3.8 Zeige den momentanen Status der Blockchain
API Endpunkt: /api/blocks/getStatus   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert|
|height|integer  |Höhe der Blockchain|
|fee|integer  |Transaktionsgebühr|
|milestone|integer  |      |
|reward|integer  |Belohnung des Blocks|    
|supply|integer  |XAS Summe im ganzen Netzwerk|
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/blocks/getStatus'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"height": 140649,   
	"fee": 10000000,   
	"milestone": 0,   
	"reward": 350000000,   
	"supply": 10049227150000000   
}   
```   
   
   
   
### 2.4 Delegate 
   
#### 2.4.1 Zeige die Anzahl aller Delegate 
API Endpunkt: /api/delegates/count   
HTTP Verb: GET   
Unterstütztes Format: keine
Beschreibung der Parameter: keine   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|count|integer   |Die Summe aller Delegate|
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/count'   
```   
   
Mögliche JSON Antwort:   
```js   
{"success":true,"count":234}   
```   
   
#### 2.4.2 Zeige die Konten die für ein Delegat abgestimmt haben anhand des öffentlichen Schlüssels des Delegats
API Endpunkt: /api/delegates/voters   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|publicKey |string |Ja|Der öffentliche Schülssel des Delegats|

Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|accounts|Array  |Eine Kontenliste|    
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/voters?publicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"accounts": [{   
		"address": "2918354313445278349",   
		"publicKey": "4fde4c49f1297d5d3a24b1494204543c4281aff17917ff7ff8ff32da3b4b222f",   
		"balance": 1338227722727,   
		"weight": 0.013316660647014596   
	},   
	{   
		"address": "1523444724068322527",   
		"publicKey": "8a6a61c28dc47541aadf1eecec2175c8f768f2331eea3472b1593bf1aa4e1fb4",   
		"balance": 2109297623765,   
		"weight": 0.020989552213127274   
	},   
	{   
		"address": "14483826354741911727",   
		"publicKey": "5dacb7983095466b9b037690150c3edec0f073815326e33a4744b6d1d50953e2",   
		"balance": 5135815841470,   
		"weight": 0.051106336795243436   
	}   
	}]   
}   
```   
   
#### 2.4.3 Zeige die Details zu einem Delegat mittels öffentlichem Schlüssel oder Namen
API Endpunkt:  /api/delegates/get/   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Hinweis: Greife auf die Details des Delegats über seinen öffentlichen Schlüssel oder seinen Benutzernamen zu.
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|publickey |string |choose only one parameter of these two    |Der öffentliche Schlüssel des Delegats|
|username  |string |ditto    |Der Benutzername des Delegats|

Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|delegate|json  |the detail information of this delegate      |    
   
   
Beispiel:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/delegates/get?publicKey=bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9   
curl -k -X GET http://45.32.248.33:4096/api/delegates/get?username=delegate_register   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"delegate": {   
		"username": "delegate_register",   
		"address": "16723473400748954103",   
		"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9",   
		"vote": 0,   
		"producedblocks": 0,   
		"missedblocks": 0,   
		"fees": 0,   
		"rewards": 0,   
		"rate": 191,   
		"approval": 0,   
		"productivity": 0,   
		"forged": "0"   
	}   
}   
```   
   
#### 2.4.4 Zeige eine Liste aller Delegate   
API Endpunkt: /api/delegates   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Hinweis: if there is no parameter, all delegates in the whole network will be returned. 
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|address |string |Nein|delegate's address      |   
|limit|int  |Nein|maximum return records       |   
|offset|integer  |Nein|offset, minimum: 0      |   
|orderBy|string  |Nein|[field used to sort]:[sort Datentyp] e.g., address:desc      |   
   
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|delegates|Array  |a list containing delegates' detail information      |    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates?orderby=approval:desc&limit=2' //the first two delegates order by approval vote, descendingly  
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"delegates": [{   
		"username": "wgl_002",  //delegate's user name   
		"address": "14636456069025293113",  //delegate's address   
		"publicKey": "ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7",    //delegate's public key   
		"vote": 9901984015600500,   //the number of vote   
		"producedblocks": 1371, //the number of generated blocks   
		"missedblocks": 6,  //the number of missed blocks   
		"fees": 12588514990,       
		"rewards": 276850000000,    //the gained reward   
		"rate": 1,   
		"approval": 98.54,  //the rate of approval votes   
		"productivity": 99.56,  //the productivity   
		"forged": "289438514990"    //All reward from forge   
	},   
	{   
		"username": "wgl_003",   
		"address": "9961157415582672274",   
		"publicKey": "c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2",   
		"vote": 9891994035600500,   
		"producedblocks": 1370,   
		"missedblocks": 8,   
		"fees": 12355148480,   
		"rewards": 275100000000,   
		"rate": 2,   
		"approval": 98.44,   
		"productivity": 99.42,   
		"forged": "287455148480"   
	}],   
	"totalCount": 233   
}   
```   
   
   
   
   
   
   
#### 2.4.5 Zeige die Transaktionsgebühr eines Delegats
API Endpunkt: /api/delegates/fee   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|publicKey |string |Ja|Der öffentliche Schlüssel des Delegats||   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|fee|integer  |Transaktionsgebühr|    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/fee?publicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
Mögliche JSON Antwort:   
```js   
{"success":true,"fee":10000000000}  //0.1 XAS   
```   
   
#### 2.4.6 Zeige die Schmiede-Informationen (Forging) anhand eines öffentlichen Schlüssels
API Endpunkt: /api/delegates/forging/getForgedByAccount   
HTTP Verb: GET
Unterstütztes Format: urlencoded
Beschreibung der Parameter:

|Name|Datentyp|Obligatorisch|Beschreibung              |   
|------ |-----  |---  |----              |   
|generatorPublicKey |string |Ja|Der öffentliche Schlüssel des Block-Generators|
   
Beschreibung der Antwort-Parameter:

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert|
|fees|integer  |Die Summe der Transaktionsgebühren|
|rewards|integer|Errungene Belohnungen|   
|forged|integer|Summe der Belohnungen von der Schmiede-Aktivität (Forging)|
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/delegates/forging/getForgedByAccount?generatorPublicKey=ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"fees": 12589307065,   
	"rewards": 285600000000,   
	"forged": 298189307065   
}   
```   
   
#### 2.4.7 Registriere eine Delegat
API Endpunkt: /api/delegates   
HTTP Verb: PUT   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Passwort des Asch-Kontos|   
|publicKey|string  |Nein|Öffentlicher Schlüssel|    
|secondSecret|string|Nein|Zweites Asch-Konto Passwort, Minimale Länge: 1 Maximale Länge: 100|   
|username|string|Nein|Der Benutzername des Delegats|   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transaction|json  |Die Details zum Registrierungsprozess|
   
   
Beispiel:   
```bash   
curl -k -H "Content-Datentyp: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","username":"delegate_0821"}' 'http://45.32.248.33:4096/api/delegates'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transaction": {   
		"type": 2,  //der Transaktions-Typ einer Delegat-Registrierung ist 2   
		"amount": 0,   
		"senderPublicKey": "3b64f1833e6328043e1f2fee31e638bdaa6dfff5c7eb9c8577a5cefcf11261f2",   
		"requesterPublicKey": null,   
		"timestamp": 4737615,   
		"asset": {   
			"delegate": {   
				"username": "delegate_0821",   
				"publicKey": "3b64f1833e6328043e1f2fee31e638bdaa6dfff5c7eb9c8577a5cefcf11261f2"   
			}   
		},   
		"recipientId": null,   
		"signature": "7f8417e8db5f58ddff887c86c789c26b32fd3f01083ef1e3c8d4e18ed16622bf766492d78518c6c7a07aada1c98b1efc36d40c8e09394989dbde229d8e3f8103",   
		"id": "16351320834453011577",   
		"fee": 10000000000,   
		"senderId": "250438937633388106"   
	}   
}   
```   
   
### 2.5 Andere Knoten
   
#### 2.5.1 Zeige die Information zu allen Knoten in einem Netzwerk
API Endpunkt: /api/peers   
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|state |integer |Nein|Stati der Peers: 0:,1:,2:,3:     |
|os|string|Nein|Linux Kernel Version|   
|version|string|Nein|Asch-System Version|   
|limit |integer |Nein|Anzahl der maximal zu retournierenden Datensätze, Minimum: 0, Maximum: 100|
|orderBy|string|Nein||   
|offset|integer  |Nein|Abstand, Minimum: 0|   
|port|integer|Nein|Port-Nummer，1~65535|   

   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|peers|Array  |Eine Liste von Knoteninformationen|    
|totalCount|integer|Die Anzahl an gerade laufenden Knoten|
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/peers?limit=1'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"peers": [{   
		"ip": "45.32.19.241",   
		"port": 4096,   
		"state": 2,   
		"os": "linux3.13.0-87-generic",   
		"version": "1.0.0"   
	}],   
	"totalCount": ["54"]   
}   
```   
   
#### 2.5.2 Zeige die Asch-Versionsnummer eines Knotens
API Endpunkt: /api/peers/version   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|version|string  |Versionsnummer|    
|build  |timestamp |Zeitpunkt des Builds|    
|net    |string  |Läuft der Knoten auf dem Mainnet oder auf dem Testnet|
   
   
Beispiel:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/peers/version   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"version": "1.0.0",   
	"build": "12:11:11 16/08/2016",   
	"net": "testnet"   
}   
```   
   
#### 2.5.3 Zeige die Information zu einem Knoten mittels seiner IP-Adresse
API Endpunkt: /api/peers/GET
HTTP Verb: GET
Unterstütztes Format: urlencoded
Beschreibung der Parameter:

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|ip |string |Ja|peer's IP      |   
|port|integer|Ja|peer's port，1~65535|   
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|peer|json  |Die Information zu dem Knoten     |    
   
   
Beispiel:   
```bash   
curl -k -X GET 'http://45.32.248.33:4096/api/peers/get?ip=45.32.248.33&port=4096'   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"peer": {   
	}   
}   
```   
   
### 2.6 Die Synchronisierung und der Lademechanismus
#### 2.6.1 Zeige den lokalen Blockchain Ladestatus
API Endpunkt: /api/loader/status   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool|Die Daten wurden erfolgreich retouniert|
|loaded |bool|          |   
|blocksCount|integer|Anzahl der Blocks|   
   
Beispiel:   
```bash   
curl -k http://45.32.248.33:4096/api/loader/status -X GET   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"loaded": true,   
	"blocksCount": 0   
}   
```   
   
#### 2.6.2 Zeige den Status der Block-Synchronisierung
API Endpunkt: /api/loader/status/sync   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool|Die Daten wurden erfolgreich retouniert|
|height |int|Blockhöhe|

   
Beispiel:   
```bash   
curl -k http://45.32.248.33:4096/api/loader/status/sync -X GET   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"syncing": false,  // zeigt ob gerade sychronisiert wird. Wenn Ja, dann ist der Wert "true". Wenn keine Daten synchronisiert werden, dann ist der Wert "false".
	"blocks": 0,   
	"height": 111987   
}   
```   
   
### 2.7 Zweites Passwort   
#### 2.7.1 Setze ein zweites Passwort
API Endpunkt: /api/signatures   
HTTP Verb: PUT   
Unterstützes Datenformat: JSON   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Asch account's password       |   
|publicKey|string  |Nein|Öffentlicher Schlüssel|    
|secondSecret|string|Ja|Das zweite Passwort eines Asch-Kontos. Minimale Länge：1，Maximale Länge：100|   
|multisigAccountPublicKey|string|Nein|Der öffentliche Schlüssel eines Multi-Signatur-Kontos|
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert|
|transaction|json|the detail information of setting transaction|    
   
   
Beispiel:   
```bash   
curl -k -H "Content-Datentyp: application/json" -X PUT -d '{"secret":"unaware label emerge fancy concert long fiction report affair appear decide twenty","secondSecret":"fault still attack alley expand music basket purse later educate follow ride"}' 'http://45.32.248.33:4096/api/signatures'    
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transaction": {   
		"type": 1,  //Der Transaktions-Typ für das Setzen eines zweiten Passworts ist 1
		"amount": 0,   
		"senderPublicKey": "3b64f1833e6328043e1f2fee31e638bdaa6dfff5c7eb9c8577a5cefcf11261f2",   
		"requesterPublicKey": null,   
		"timestamp": 4872315,   
		"asset": {   
			"signature": {   
				"publicKey": "bd1e78c5a10fbf1eca36b28bbb8ea85f320967659cbf1f7ff1603d0a368867b9"   
			}   
		},   
		"recipientId": null,   
		"signature": "e76d9b25ec0fdaa88b19d59c5a222b7efdc04f738ee05896f55f4e6959229d9b1600ca25aa92fbea176668f3be7c12c506f2091e2b38c52ef0ece7a5d35e240a",   
		"id": "1614688380530105232",   
		"fee": 500000000,       //Die Gebühr für das Setzen eines zweiten Passworts sind 5 XAS   
		"senderId": "250438937633388106"   
	}   
}   
```   
   
#### 2.7.2 Zeige die Gebühr für das Setzen eines zweiten Passworts
API Endpunkt: /api/signatures/fee   
HTTP Verb: GET   
Unterstütztes Format: keine   
Beschreibung der Parameter: keine   
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|fee|integer  |Transaktionsgebühr|    
   
   
Beispiel:   
```bash   
curl -k http://45.32.248.33:4096/api/signatures/fee -X GET   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"fee": 500000000         //5 XAS   
}     
```   
   
### 2.8 Multi-Signatur 
#### 2.8.1 Ein normales Konto in ein Multi-Signatur-Konto verwandeln
API Endpunkt: /api/multisignatures   
HTTP Verb: PUT   
Unterstützes Datenformat: JSON   
Hinweis: Die Return-Wert ist ausschließlich die Transaktions-Id. Um erfolgreich ein Multi-Signatur-Konto zu eröffnen bedarf es weiterer Signaturen. Jede Transaktion nach dem Erstellen eines Multi-Signatur-Kontos benötigt mehrere Signaturen. Die kleinste Anzahl an Signaturen welche mit übertragen werden müssen wird festgehalten im Parameter "min" (schließt den Sender mit ein).
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Das Passwort des Asch-Kontos|   
|publicKey|string  |Nein|Öffentlicher Schlüssel|    
|secondSecret|string|Nein|Das zweite Passwort des Asch-Kontos. Minimale Länge: 1, Maximale Länge: 100|   
|min|integer|Ja|Die minimale Anzahl an Signaturen welche für eine Transaktion eines Multi-Signatur-Kontos verwendet werden muss. (Bei der Registrierung eines Multi-Signatur-Kontos hat dieser Parameter keine Bedeutung da jedes teilnehmende Konto die Transaktion unterzeichnen muss.) Minumum: 2, Maximum: 16. Diese Zahl darf nicht größer sein als "keysgroup.length + 1". |   
|lifetime|integer|Ja|Die maximale Lebensdauer einer Multi-Signatur-Transaktion. Minimum:1, Maximum:24. HINWEIS: Dieser Parameter kann zur Zeit nicht verwendet werden.|   
|keysgroup|array|Ja|Eine Liste mit allen öffentlichen Schlüssel der anderen Unterzeichner. Die Symbole Plus/Minus (+/-) vor einem öffentlichen Schlüssel bedeuten, dass ein Multi-Signatur-Konto hinzugefügt wird (+), oder ein Multi-Signatur-Konto entfernt wird (-). Minimale Anzahl an Konten:1, Maximum Anzahl an Konten Konten:10.|   
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transactionId|string  |die Multi-Signatur-TransaktionsId|    
   
   
Beispiel:   
```bash   
curl -k -H "Content-Datentyp: application/json" -X PUT -d '{"secret":"vanish deliver message evil canyon night extend unusual tell prosper issue antenna","min":2,"lifetime":1,"keysgroup":["+eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97","+d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"]}' 'http://45.32.248.33:4096/api/multisignatures'  //der öffentliche Schlüssel ist 2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
```   
   
Mögliche JSON Antwort:   
```js
{   
	"success": true,   
	"transactionId": "17620378998277022323"     //Ausschließlich die TransaktionsId wird retouniert. Um erfolgreich ein Multi-Signatur-Konto zu eröffnen benötigt es mehrere Konto-Signaturen.
}   
```   
   
#### 2.8.2 Zeige Informationen zu ausstehenden Multi-Signatur-Transaktionen
API Endpunkt: /api/multisignatures/pending 
HTTP Verb: GET   
Unterstütztes Format: urlencoded   
Beschreibung der Parameter:    

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|publicKey|string  |Ja|Öffentlicher Schlüssel|    
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transactions|Array  |Eine Liste der ausstehenden transaktionen|    
   
   
Beispiel:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transactions": [{      //die Informationen zu der Multi-Signatur-Transaktion (siehe 2.8.1, TransaktionsId: 17620378998277022323) 
		"min": 2,   
		"lifetime": 1,   
		"signed": true,   
		"transaction": {   
			"type": 4,      //4 bedeutet, dass ein Multi-Signatur-Konto registriert wird
			"amount": 0,   
			"senderPublicKey": "2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd",   
			"requesterPublicKey": null,   
			"timestamp": 4879978,   
			"asset": {   
				"multisignature": {   
					"min": 2,   
					"keysgroup": ["+eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
					"+d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"],   
					"lifetime": 1   
				}   
			},   
			"recipientId": null,   
			"signature": "a42feaccd9f2a4940fc0be1a1580e786b360f189db3154328f307988e75484293eae391f2f9eee489913cc6d15984eb1f5f5a0aa1bf78ea745d5c725f161af08",   
			"id": "17620378998277022323",   
			"fee": 1500000000,   
			"senderId": "3855903394839129841"   
		}   
	}]   
}   
   
```   
   
#### 2.8.3 Unterschriebe eine Multi-Signatur-Transaktion (als nicht Initiator)
API Endpunkt: /api/multisignatures/sign
HTTP Verb: POST
Unterstützes Datenformat: JSON
Beschreibung der Parameter:

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|secret |string |Ja|Password des Asch-Kontos|   
|secondSecret|string|Nein|Zweites Passwort des Asch-Kontos. Minimale Länge: 1, Maximale Länge: 100| 
|publicKey|string  |Nein|Öffentlicher Schlüssel|    
|transactionId|string|Ja|TransaktionsId|
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert    
|transactionId|string  |Multi-Signatur-Transaktions-Id|    
   
   
Beispiel:   
```bash   
curl -k -H "Content-Datentyp: application/json" -X POST -d '{"secret":"lemon carpet desk accuse clerk future oyster essay seminar force live dog","transactionId":"17620378998277022323"}' 'http://45.32.248.33:4096/api/multisignatures/sign'   //dies wurde unterzeichnet von einem Benutzer dessen öffentlicher Schlüssel wie folgt ist: eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"transactionId": "17620378998277022323"   
}   
// erhalte die ausstehende Transaktion
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
{   
	"success": true,   
	"transactions": [{   
		"min": 2,   
		"lifetime": 1,   
		"signed": true,   
		"transaction": {   
			"type": 4,   
			"amount": 0,   
			"senderPublicKey": "2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd",   
			"requesterPublicKey": null,   
			"timestamp": 4879978,   
			"asset": {   
				"multisignature": {   
					"min": 2,   
					"keysgroup": ["+eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
					"+d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"],   
					"lifetime": 1   
				}   
			},   
			"recipientId": null,   
			"signature": "a42feaccd9f2a4940fc0be1a1580e786b360f189db3154328f307988e75484293eae391f2f9eee489913cc6d15984eb1f5f5a0aa1bf78ea745d5c725f161af08",   
			"id": "17620378998277022323",   
			"fee": 1500000000,   
			"senderId": "3855903394839129841",   
			"signatures": ["b38a161264db2a23e353d3fbc4983562f6343d5ee693144543ca54e2bc67c0f73d1c761b7bfa38b2bb101ac2ab0797b674b1a9964ccd400aaa310746c3494d03"]      //die neue Multi-Signatur
		}   
	}]   
}   
   
// Der öffentlichen Schlüssel eines Benutzers ist "d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb". Unterzeichne folgenden Registrierungs-Vertrag
curl -k -H "Content-Datentyp: application/json" -X POST -d '{"secret":"chalk among elbow piece badge try van round quality position simple teach","transactionId":"17620378998277022323"}' 'http://45.32.248.33:4096/api/multisignatures/sign'   
{"success":true,"transactionId":"17620378998277022323"}   
// Versuch ausstehende Transaktionen herunterzuladen. Diesmal gibt es keine.
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/pending?publicKey=2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd   
{"success":true,"transactions":[]}   
// Beachte die Details dieser Transaktion. Zu diesem Zeitpunkt wurde die Transaktion an das ganze Netzwerk gesendet und wird auf die Blockchain geschrieben. Dieses Konto wurde erfolgreich als ein Multi-Signatur Konto registriert.

curl -k -X GET http://45.32.248.33:4096/api/transactions/get?id=17620378998277022323   
{   
	"success": true,   
	"transaction": {   
		"id": "17620378998277022323",   //the registering transaction ID   
		"height": "157013",   
		"blockId": "4680888982781013372",   
		"type": 4,   
		"timestamp": 4879978,   
		"senderPublicKey": "2cef5711e61bb5361c544077aa08aebc4d962a1d656571901c48d716382ad4fd",   
		"senderId": "3855903394839129841",   
		"recipientId": "",   
		"amount": 0,   
		"fee": 1500000000,   
		"signature": "a42feaccd9f2a4940fc0be1a1580e786b360f189db3154328f307988e75484293eae391f2f9eee489913cc6d15984eb1f5f5a0aa1bf78ea745d5c725f161af08",   
		"signSignature": "",   
		"signatures": null,   
		"confirmations": "26",   
		"asset": {   
			   
		}   
	}   
}   
   
```   
   
#### 2.8.4 Zeige Details zu einem Multi-Signatur Konto
API Endpunkt: /api/multisignatures/accounts   
HTTP Verb: GET
Unterstütztes Format: urlencoded
Beschreibung der Parameter:

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|publicKey |string |Ja|Der öffentliche Schlüssel eines der Teilnehmer|
   
   
Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |Die Daten wurden erfolgreich retouniert|    
|accounts|Array  |Die Details des Multi-Signatur Kontos|
   
   
Beispiel:   
```bash   
curl -k -X GET http://45.32.248.33:4096/api/multisignatures/accounts?publicKey=eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97   
```   
   
Mögliche JSON Antwort:   
```js   
{   
	"success": true,   
	"accounts": [{   
		"address": "3855903394839129841",       //die Adresse dieses Multi-Signatur-Kontos
		"balance": 18500000000,     //das Saldo des Multi-Signatur Kontos
		"multisignatures": ["eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
		"d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb"],    //der öffentliche Schlüssel des Multi-Signatur Kontos
		"multimin": 2,  //Minimum an obligatorischen Signaturen
		"multilifetime": 1,   
		"multisigaccounts": [{          //Die Kontodetails des Unterzeichners
			"address": "13542769708474548631",   
			"publicKey": "eb48b9ab7c9a34a9b7cdf860265d65b31af774355cabf1b3a387d14a1925dc97",   
			"balance": 0   
		},   
		{   
			"address": "4100816257782486230",   
			"publicKey": "d5d7aa157f866c47a2a1e09e2746286ed089fd90976b54fbfa930e87d11609cb",   
			"balance": 0   
		}]   
	}]   
}   
```   

### 2.9 Peer2Peer Transport[sichere API]  
#### 2.9.1 Übersicht
Um Informationen zu einer Knoten-API abzufragen müssen folgender Header gesetzt werden:

 - key=magic, and value=594fe0f3  
 - key=version, and value=''  

#### 2.9.2 Transaktion
Alle Schreiboperationen im Asch-System werden mit dem Erstellen einer Transaktion beendet. Die Daten für die Transaktion werden mit Hilfe des Moduls "asch-js" erstellt und dann mit einem HTTP POST an den Server geschickt. Der API-Endpunkt sieht folgendermaßen aus:

Nutzlast: Transaktionsinformationen erstellt durch asch-js
API Endpunkt: /peer/transactions  
HTTP Verb: POST   
Unterstützes Datenformat: JSON

##### 2.9.2.1 Setze ein zweites Bezahl-Passwort
Beschreibung der Parameter:  

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|transaction|JSON|Ja|Transaktionsdaten erstellt mittels [asch-js.signature.createSignature]|

Beschreibung der Antwort-Parameter:

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |ob die Stimmabgabe erfolgreich war |  
   
   
Beispiel:   
```js   
var asch = require('asch-js');    
var transaction = asch.signature.createSignature('measure bottom stock hospital calm hurdle come banner high edge foster cram','erjimimashezhi001')       
console.log(json.stringify(transaction))  
{"type":1,"amount":0,"fee":500000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5328943,"asset":{"signature":{"publicKey":"27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b"}},"signature":"71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a","id":"15605591820551652547"}

// schicke die oben erstellten Daten mittels HTTP POST an den Asch-Server um ein zweites Passwort zu hinterlegen
curl -H "Content-Datentyp: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":1,"amount":0,"fee":500000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5328943,"asset":{"signature":{"publicKey":"27116db89cb5a8c02fb559712e0eabdc298480d3c79a089b803e35bc5ef7bb7b"}},"signature":"71ef98b1600f22f3b18cfcf17599db3c40727c230db817f610e86454b62df4fb830211737ff0c03c6a61ecfd4a9fcb68a30b2874060bb33b87766acf800e820a","id":"15605591820551652547"}}' http://45.32.248.33:4096/peer/transactions   
```   
   
Mögliche JSON Antwort:   
```js  
{
    "success":true  //Aktion war erfolgreich
}	
``` 

##### 2.9.2.2 Geld überweisen
Beschreibung der Parameter:   

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|transaction|JSON|Ja|Transaktionsdaten erstellt mittels [asch-js.transaction.createTransaction]|

Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |ob die Stimmabgabe erfolgreich war |  
   
   
Beispiel:   
```js   
var asch = require('asch-js');   
var targetAddress = "16358246403719868041";  
var amount = 100*100000000;   //100 XAS
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';

// Hier ist die Eingabe eines Passworts zu sehen. In diesem Beispiel muss das zweite Passwort auch eingegeben werden.
// Ob ein zweites Passwort notwendig ist hängt davon ab, ob der Benutzer ein zweites Passwort festgelegt hat. Über die Funktion "user.secondPublicKey" kann verifiziert werden ob ein Benutzer ein zweites Passwort hinterlegt hat.

var transaction = asch.transaction.createTransaction(targetAddress, amount, password, secondPassword || undefined);       
json.stringify(transaction)
'{"type":0,"amount":10000000000,"fee":10000000,"recipientId":"16358246403719868041","timestamp":5333378,"asset":{},"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","signature":"2d47810b7d9964c5c4d330a53d1382769e5092b3a53639853f702cf4a382aafcff8ef8663c0f6856a23f41c249944f0c3cfac0744847268853a62af5dd8fc90a","signSignature":"dfa9b807fff362d581170b41c56a2b8bd723c48d1f100f2856d794408723e8973016d75aeff4705e6837dcdb745aafb41aa10a9f1ff8a77d128ba3d712e90907","id":"16348623380114619131"}'

// schicke diese Daten mittels HTTP POST an den Asch-Server
curl -H "Content-Datentyp: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":0,"amount":10000000000,"fee":10000000,"recipientId":"16358246403719868041","timestamp":5333378,"asset":{},"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","signature":"2d47810b7d9964c5c4d330a53d1382769e5092b3a53639853f702cf4a382aafcff8ef8663c0f6856a23f41c249944f0c3cfac0744847268853a62af5dd8fc90a","signSignature":"dfa9b807fff362d581170b41c56a2b8bd723c48d1f100f2856d794408723e8973016d75aeff4705e6837dcdb745aafb41aa10a9f1ff8a77d128ba3d712e90907","id":"16348623380114619131"}}' http://45.32.248.33:4096/peer/transactions
```   
   
Mögliche JSON Antwort:   
```js  
{
    "success":true  //Erfolgte Überweisung
}		
``` 

##### 2.9.2.3 Ein Delegat registrieren   
Beschreibung der Parameter:  

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|transaction|JSON|Ja|Transaktionsdaten erstellt mittels [asch-js.delegate.createDelegate]|

Beschreibung der Antwort-Parameter:   

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |ob die Transaktion erfolgreich war oder nicht |  
   
   
Beispiel:   
```js   
var asch = require('asch-js');   
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';
var userName = 'zhenxi_test';

var transaction = asch.delegate.createDelegate(password, userName, secondPassword || undefined);   
json.stringify(transaction)  
'{"type":2,"amount":0,"fee":10000000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334485,"asset":{"delegate":{"username":"zhenxi_test","publicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f"}},"signature":"a12ce415d2d21ab46e4c1b918b8717b1d351dd99abd6f2f94d9a1a7e1f32b697f843a05b1851cb857ea45a2476dce592f5ddd612c00cd44488b8b610c57d7f0a","signSignature":"35adc9f1f37d14458e8588f9b4332eedf1151c02480159f64a287a4b0cbb59bfe82040dfec96a4d9560bae99b8eaa1799a7023395db5ddc640d95447992d6e00","id":"12310465407307249905"}'

// schicke oben erstellte Daten an den Asch Server mittels HTTP Post um ein Delegat zu registrieren
curl -H "Content-Datentyp: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":2,"amount":0,"fee":10000000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334485,"asset":{"delegate":{"username":"zhenxi_test","publicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f"}},"signature":"a12ce415d2d21ab46e4c1b918b8717b1d351dd99abd6f2f94d9a1a7e1f32b697f843a05b1851cb857ea45a2476dce592f5ddd612c00cd44488b8b610c57d7f0a","signSignature":"35adc9f1f37d14458e8588f9b4332eedf1151c02480159f64a287a4b0cbb59bfe82040dfec96a4d9560bae99b8eaa1799a7023395db5ddc640d95447992d6e00","id":"12310465407307249905"}}' http://45.32.248.33:4096/peer/transactions
```   
   
Mögliche JSON Antwort:   
```js  
{
    "success":true  //Registration war erfolgreich
}		
``` 

##### 2.9.2.4 Wahl abgeben und Stimmabgabe zurückziehen

Beschreibung der Parameter:

|Name	|Datentyp   |Obligatorisch |Beschreibung              |   
|------ |-----  |---  |----              |   
|transaction|JSON|Ja|Transaktionsdaten erstellt mittels [asch-js.vote.createVote]|

Beschreibung der Antwort-Parameter:

|Name	|Datentyp   |Beschreibung              |   
|------ |-----  |----              |   
|success|bool  |ob die Stimmabgabe erfolgreich war |  
   
   
Beispiel:
```js   
var asch = require('asch-js');
var password = 'measure bottom stock hospital calm hurdle come banner high edge foster cram';
var secondPassword  = 'erjimimashezhi001';
// Jedes Element der Liste zur Stimmabgabe setzt sich aus einem Symbol (+ oder -) und des öffentlichen Schlüssels des Delegats. Plus (+) bedeutet eine Stimmabgabe, ein Minus (-) steht für eine Annullierung der Stimme.
var voteContent = [
    '-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7',
    '+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2'
];

var transaction = asch.vote.createVote(password, voteContent, secondPassword || undefined);
json.stringify(transaction)
{"type":3,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334923,"asset":{"vote":{"votes":["-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7","+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2"]}},"signature":"6036c2066a231c452a1c83aafd3bb9db3842ee05d5f17813f8264a4294cdec761faa89edf4a95f9b2e2451285807ab18aa9f989ad9a3165b95643179b8e4580f","signSignature":"a216ca739112e6f65986604b9467ccc8058138a7077faf134d6c4d673306cd1c514cc95bd54a036f7c602a56c4b4f2e4e59f6aa7c376cb1429e89054042e050b","id":"17558357483072606427"}

// sende die oben bekommenen Daten den Asch-Server mittels HTTP POST
curl -H "Content-Datentyp: application/json" -H "magic:594fe0f3" -H "version:''" -k -X POST -d '{"transaction":{"type":3,"amount":0,"fee":10000000,"recipientId":null,"senderPublicKey":"3e6e7c90571b9f7dabc0abc2e499c2fcee8e436af3a9d5c8eadd82ac7aeae85f","timestamp":5334923,"asset":{"vote":{"votes":["-ae256559d06409435c04bd62628b3e7ea3894c43298556f52b1cfb01fb3e3dc7","+c292db6ea14d518bc29e37cb227ff260be21e2e164ca575028835a1f499e4fe2"]}},"signature":"6036c2066a231c452a1c83aafd3bb9db3842ee05d5f17813f8264a4294cdec761faa89edf4a95f9b2e2451285807ab18aa9f989ad9a3165b95643179b8e4580f","signSignature":"a216ca739112e6f65986604b9467ccc8058138a7077faf134d6c4d673306cd1c514cc95bd54a036f7c602a56c4b4f2e4e59f6aa7c376cb1429e89054042e050b","id":"17558357483072606427"}}' http://45.32.248.33:4096/peer/transactions
```   
   
Mögliche JSON Antwort:   
```js  
{
    "success":true  //war Stimmabgabe oder Rückziehung erfolgreich
}		
``` 

   
## Appendix 1：Installiere das 'asch-js' Modul
Alle Operationen in Asch werden mit einer Transaktion beendet. Die Transaktionsdaten werden mittels des Moduls "asch-js" erstellt und dann mittels HTTP POST an den API Endpunkt geschickt.
  
**Installiere das Modul**   
`npm install asch-js`
