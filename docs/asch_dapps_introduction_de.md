# Einführung in die Asch Dapp Entwicklung
Wie bereits im Whitepaper geäußert verwendet Asch, nicht wie Bitcoin oder Etherium ein Sidechain-Framework als Plattform für dezentrale Applikation (Dapp). Normalerweise läuf jede Dapp in ihrer eigenen Sidechain.

## Die Unabhängigkeit einer Sidechain

Die Vorteile eines Sidechain-Frameworks ist, dass der Programmcode und die Daten unabhängig von der Hauptchain sind. So bleiben die Daten an einem Ort und sind nicht über die ganze Blockchain verteilt. Dies könnte man als natürlichen Partitionsmechanismus erkennen. 
Eine Sidechain hat ihre eigene Blockchain, ihre eigenen Delegate und ihre eigenen Knoten. Dies bedeutet, dass ein auf der Sidechain erzeugter Block zu allen Knoten der Sidechain gesendet werden kann.

Jede Münze hat zwei Seiten, so auch die Unabhängigkeit der Sidechain. Wenn eine Dapp fertig entwickelt ist, dann muss auch die Wartung als Kriterium herangezogen werden. Um die Sicherheit der Dapp zu gewährleisten müssen genug Knoten zum Ausführen der Dapp zur Verfügung stehen.

Von dieser Perspektive ist die Sidechain-Mechanismus nicht so gut wie bei Etherium. Ist eine Dapp ersteinmal auf Etherium deployed, so ist können alle Knoten für diese arbeiten als auch die Sicherheit garantieren.


## Die Flexibilität der Sidechain

Der Sidechain-Mechanismus hat seine Stärken, dann nicht jede Applikation benötigt das größte Maß an Sicherheit. Asch, welches auf den Sidechain-Mechanismus basiert, kann seinen Nutzern eine größere Flexibilität anbieten.

Dies soll anhand eines Beispiels gzeigt werden: Angenommen es gibt 1000 Knoten im System. Eine kritische Dapp benötigt 500 dieser Knoten. Eine andere, nicht so kritische Dapp benötigt nur 100 Knoten. Dies liegt ganz im Ermessen der Benutzer und Entwickler.

Im Vergleich dazu bietet Etherium nur eine Möglichkeit: Eine Applikation läuft auf allen Knoten. Es wird jedoch gesagt, dass in Zukunft Etherium auch eine Möglichkeit zur Partitionierung von Dapps bekommt. Eine Möglichkeit die Asch bereits hat.

Für Anwendungen welche ein Höchstmaß an Sicherheit benötigen, bietet Asch die Möglichkeit, dass diese Dapps auf der Mainchain ausgeführt werden. Dieses Privileg kann jedoch nicht allen Entwicklern zugänglich gemacht werden. Dies liegt einerseits daran, dass dann eine Applikation beliebig groß wachsen kann, andererseits wäre die Unsicherheit zu groß (siehe [DAO Problem](https://en.wikipedia.org/wiki/The_DAO_(organization)#Risks)).

Die Flexibilität einer Sidechain lässt sich auch daran zeigen, dass alle Parameter ihrer Blockchain konfigurierbar sind. Es können z.B.: Block-Interval, Block-Belohnung, Transaktionsgebühr oder sogar der Konsensus-Algorithmus geändert werden.


Das Wichtigste ist die Business-Logik welche sich leicht auf der Sidechain entwickeln lässt, egal ob es sich um eine Business-Transaktion handelt oder um einen intelligenten Vertrag. 

Beachte, dass Asch sich von [Blockstream](https://en.wikipedia.org/wiki/Blockstream) unterscheidet. Blockstream hat die Sidechaintechnologie entwickelt, ist aber auch zugleich der Betreiber ihrer eigenen Sidechain auf der es aber schwierig ist eine neues Transaktionssystem und neue intelligente Verträge zu entwickeln.

Schauen wir uns den folgendne Absatz an:

Jeder Kreis repräsentiert einen Knoten im System. Alle 64 Knoten bilden das Netzwerk der Mainchain. Im roten Rahmen ist die Siechain Nr.1, welche aus 12 Knoten besteht. Sidechain Nr.2 wird durch den blauen Rahmen gezeigt und besteht aus 36 Knoten.

![sidechain deploy architecture](./assets/sidechain-deploy.png)

## Die Wechselwirkung zwischen Mainchain und Sidechain

Es existiert eine wechselseitige Beziehung zwischen der Asch Mainchain und ihren Sidechains. Asch bietet jeder Sidechain den Zugriff auf eine ausgewählte API: Datenbank, Netzwerk wie auch Verschlüselung. Ein positiver Nebeneffekt der Sidechain ist, dass diese zusätzliche Knoten zum Netzwerk hinzufügt und somit das ganze Asch System verstärkt.

Zwangsläufig muss ein Entwickler nicht alle Knoten für eine Sidechain zur Verfügung stellen. Es besteht auch die Möglichkeit, dass Besitzer von bestehenden Knoten die neue entwickelte Applikation auf ihtrem Knoten ausführt.

XAS die Währung der Asch Mainchain kann zu jeder Sidechain transferiert werden. XAS wird auf Crypto-Marktplätzen gehandelt. Die Währung einer Sidechain muss nicht zwangsläufig auf einem Crypto-Marktplatz gehandelt werden, sie kann einfach gegen XAS getauscht werden. So hat man als neue Sidechain nicht mit dem "wie bekomme ich meine Währung auf den Marktplatz" Problem zu kämpfen. Die neue Währung kann direkt in XAS gewechselt werden.

## Produktivität

Wir bieten eine Fülle von Vorlagen (oder besser gesagt ein Gerüst zum Entwickeln) für die Entwicklung von Sidechains. Die größten Entwicklungsaufgaben an den Sidechains wurden bereits bewältig. Als Entwickler reicht es, dass man sich nur auf die Business-Logik konzentriert. Zu diesem Zeitpunkt ist das Entwickeln auf Asch gleich schwer wie auf Etherium.

Zum Entwickeln von Sidechain wird die Sprache Node.js verwendet. Darauf basierend stellen wir weitere Bibliotheken für die Entwickler zur Verfügung. Entwickler können alle Module hinzufügen die sie brauchen, da die Javascript-Community genug Hilfestellung bietet.


Die folgenden Module kommen in Asch vom Werk aus.

![inbuilt modules](./assets/inbuilt-modules.png)

## Sicherheitslösung

Anders als wie oben angesprochen geht es im folgenden nicht um den Mangen an Knoten, sondern um das Problem des Ausführens von schädlichem Programm-Code einer Dapp auf einem anderen Knoten.

Das Ziel ist, dass jeder Asch-Knoten unterschiedliche Sidechain-Dapps installieren kann ohne, dass er dem Code bedingungslos vertraut. Deshalb bedarf es eines Sicherheitsmechanismus welcher den Knoten vor dem Auslesen des Dateisystems oder dem Manipulieren des Netzwerktverkehrs bewahrt.

Um dieses Problem zu lösen wird im Asch-System jeder Sidechain-Programm-Code als ein Kindprozess geladen. Dieser Kindprozess ladet eine virtuelle Javascript-Sandbox welche komplett vom restlichen System isoliert ist. Diese Javascript-Sandbox besitzt keine `require` Funktionalität und bekommt keine unnötigen Module mitgeliefert.

Danach wird eine individuell angepasste `require` Funktion geladen inklusive häufig benutzer und sicherer Javascript-Module. Als letzter Schritt wird der Sidechain-Code geladen. Weiters bieten wir einen API für IPC (inter-process communication) an. Alle diese Schritte gewährleisten, dass der Sidechain-Code genügend APIs zur Verfügung hat aber auch, dass der Knoten welcher den Sidechain-Code installiert kein Sicherheitsrisiko eingehen muss.

![process structure](./assets/process-structure.png)

## Tutorials

Hier folgene einige Tutorials welche einen schnellen Start für Entwickler ermöglichen sollen.

- [Dapp Entwicklungs Tutorial 1: Asch Dapp Hello World](./dapp_docs/1_hello_en.md)
	Dieses Tutorial zeigt wie man eine einfache Sidechain-Applikation erstellt und veröffentlicht. Desweiteren wird die Code-Struktur des Sidechain-Frameworks beleuchtet.

- [Dapp Entwicklungs Tutorial 2: Asch Dapp Asset](./dapp_docs/2_asset_en.md)
	Dieses Tutorial zeigt wie man ein Asset auf der Sidechain erstellt. Weiters wird die Kommunikation zwischen Front- und Backend analysiert.

- [Dapp Entwicklungs Tutorial 3: Asch Dapp Mini DAO](./dapp_docs/3_mini_dao_en.md)
	Dieses Tutorial zeigt wie man eine Typtransaktion oder einen intelligenten Vertrag erstellt. Dies wird anhand eines kleinen DAO-Projekts (DAO=Dezentrale Autonome Organisation) mit Projekt Management und Voting Funktion erläutert.

- [Dapp Entwicklungs Tutorial 4: Asch Dapp Dice Game](./dapp_docs/4_dice_game_en.md)
	Dieses Tutorial 

	This tutorial shows how to crate more complicate transaction or smart contract, how to establish the connection among contracts, and how to carry out the contract based on historic data. The tutorial also demostrates a dice game.

- [Dapp Entwicklungs Tutorial 5: Eine Dapp veröffentlichen](./dapp_docs/5_dapp_publish_en.md)
	Dieses Tutorial zeigt wie meine Applikation online registriert (Testchain, Hauptchain) und wie man diese installiert/deinstalliert.
