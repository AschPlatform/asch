# Einführung in die Asch Dapp Entwicklung
Wie bereits im Whitepaper erwähnt, verwendet Asche eine Sidechain-Architektur, welche sich von Währungen wie Ethereum oder Bitcoin dadurch entscheidet, dass die dezentralen Applikationen (Dapp) auf Sidechains laufen. Eine Sidechain für jede Dapp.

## Die Unabhängigkeit einer Sidechain

Die Vorteile eines Sidechain-Frameworks ist, dass der Programmcode und die Daten unabhängig von der Hauptchain sind. So bleiben die Daten an einem Ort und nicht über die ganze Blockchain verteilt sind. Dies könnte man als natürlichen Partitionsmechanismus bezeichnen. 
Eine Sidechain hat ihre eigene Blockchain, ihre eigenen Delegate und ihre eigenen Knoten. Dies bedeutet, dass ein auf der Sidechain erzeugter Block zu allen Knoten der Sidechain gesendet werden kann.

Jede Münze hat zwei Seiten, so auch die Unabhängigkeit der Sidechain. Wenn eine Dapp fertig entwickelt ist, dann muss auch die Wartung als Kriterium herangezogen werden. Um die Sicherheit der Dapp zu gewährleisten müssen genug Knoten zur Ausführen der Dapp zur Verfügung stehen.

Von dieser Perspektive ist der Sidechain-Mechanismus nicht so gut wie bei Ethereum. Ist eine Dapp erst einmal auf Ethereum deployed, so können alle Knoten für diese arbeiten als auch die Sicherheit garantieren.


## Die Flexibilität der Sidechain

Der Sidechain-Mechanismus hat seine Stärken, denn nicht jede Applikation benötigt das größte Maß an Sicherheit. Asch, welches auf dem Sidechain-Mechanismus basiert, kann seinen Nutzern eine größere Flexibilität bieten.

Dies soll anhand eines Beispiels gzeigt werden: Angenommen es gibt 1000 Knoten im System. Eine kritische Dapp benötigt 500 dieser Knoten. Eine andere, nicht so kritische Dapp benötigt nur 100 Knoten. Dies liegt ganz im Ermessen der Benutzer und Entwickler.

Im Vergleich dazu bietet Ethereum nur eine Möglichkeit: Eine Applikation läuft auf allen Knoten. Es wird jedoch gesagt, dass in Zukunft Ethereum auch eine Möglichkeit zur Partitionierung von Dapps bekommt. Eine Funktion welche Asch bereits besitzt.

Für Anwendungen welche ein Höchstmaß an Sicherheit benötigen, bietet Asch die Möglichkeit, dass diese Dapps auf der Mainchain ausgeführt werden. Dieses Privileg kann jedoch nicht allen Entwicklern zugänglich gemacht werden. Dies liegt einerseits daran, dass dann eine Applikation beliebig groß wachsen kann, andererseits wäre die Unsicherheit zu groß (siehe [DAO Problem](https://en.wikipedia.org/wiki/The_DAO_(organization)#Risks)).

Die Flexibilität einer Sidechain lässt sich auch daran zeigen, dass alle Parameter ihrer Blockchain konfigurierbar sind. Es können z.B.: Block-Interval, Block-Belohnung, Transaktionsgebühr oder sogar der Konsensus-Algorithmus geändert werden.


Das Wichtigste ist die Business-Logik, welche sich leicht auf der Sidechain entwickeln lässt, egal ob es sich um eine Business-Transaktion handelt oder um einen smart contract. 

Beachte, dass Asch sich von [Blockstream](https://en.wikipedia.org/wiki/Blockstream) unterscheidet. Blockstream hat die Sidechaintechnologie entwickelt, ist aber auch zugleich der Betreiber ihrer eigenen Sidechain auf der es aber schwierig ist ein neues Transaktionssystem und neue intelligente Verträge zu entwickeln.

Schauen wir uns den folgendne Absatz an:

Jeder Kreis repräsentiert einen Knoten im System. Alle 64 Knoten bilden das Netzwerk der Mainchain. Im roten Rahmen ist die Sidechain Nr.1, welche aus 12 Knoten besteht. Sidechain Nr.2 wird durch den blauen Rahmen repräsentiert und besteht aus 36 Knoten.

![sidechain deploy architecture](./assets/sidechain-deploy.png)

## Die Wechselwirkung zwischen Mainchain und Sidechain

Es existiert eine wechselseitige Beziehung zwischen der Asch Mainchain und den Sidechains. Asch bietet jeder Sidechain den Zugriff auf verschiedene APIs: Datenbank, Netzwerkkommunikation als auch Verschlüsselung. Ein positiver Nebeneffekt der Sidechain ist, dass diese zusätzliche Knoten zum Netzwerk hinzufügt werden und somit das ganze Asch System verstärken.

Zwangsläufig muss ein Entwickler nicht alle Knoten die er für eine Sidechain benötigt zur Verfügung stellen. Es besteht auch die Möglichkeit, dass Besitzer von bestehenden Knoten die neue entwickelte Applikation auf ihrem Knoten ausführen.

XAS, die Währung der Asch Mainchain, kann zu jeder Sidechain transferiert werden. XAS wird auf Crypto-Marktplätzen gehandelt. Die Währung einer Sidechain muss nicht zwangsläufig auf einem Crypto-Marktplatz gehandelt werden, sie kann einfach gegen XAS getauscht werden. So hat man als neue Sidechain nicht mit dem "wie bekomme ich meine Währung auf den Marktplatz?" Problem zu kämpfen. Die neue Währung kann direkt in XAS gewechselt werden.

## Produktivität

Wir bieten eine Fülle von Vorlagen (oder besser gesagt ein Gerüst zum Entwickeln) für die Entwicklung von Sidechains. Die größten Entwicklungsaufgaben an den Sidechains wurden bereits bewältig. Als Entwickler reicht es, dass man sich nur auf die Business-Logik konzentriert. Zu diesem Zeitpunkt ist das Entwickeln auf Asch gleich schwer wie auf Ethereum.

Zum Entwickeln von Sidechain wird die Sprache Node.js verwendet. Darauf basierend stellen wir weitere Bibliotheken für Entwickler zur Verfügung. Entwickler können alle Module hinzufügen die sie brauchen, da die Javascript-Community genug Hilfestellung bietet.


Die folgenden Module sind von vorhinein in Asch integriert:

![inbuilt modules](./assets/inbuilt-modules.png)

## Sicherheitslösung

Anders als die oben angesprochenen Probleme, geht es im folgenden nicht um den Mangel an Knoten, sondern um das Problem des Ausführens von schädlichem Programm-Code welcher Benutzer von Asch-Dapps angreift.

Das Ziel ist es, dass jeder Asch-Knoten unterschiedliche Sidechain-Dapps installieren kann, ohne dass er dem Code bedingungslos vertrauen muss. Deshalb bedarf es eines Sicherheitsmechanismuses, welcher den Knoten vor dem Auslesen des Dateisystems oder dem Manipulieren des Netzwerktverkehrs bewahrt.

Um dieses Problem zu lösen, wird im Asch-System jeder Sidechain-Programm-Code als ein Kindprozess geladen. Dieser Kindprozess ladet eine virtuelle Javascript-Sandbox welche komplett vom restlichen System isoliert ist. Diese Javascript-Sandbox besitzt keine `require` Funktionalität und bekommt keine unnötigen Module mitgeliefert.

Danach wird eine individuell angepasste `require` Funktion geladen inklusive häufig benutzter und sicherer Javascript-Module. Als letzter Schritt wird der Sidechain-Code geladen. Weiters bieten wir eine API für IPC (inter-process communication) an. Alle diese Schritte gewährleisten, dass der Sidechain-Code genügend APIs zur Verfügung hat, aber auch, dass der Knoten welcher den Sidechain-Code installiert kein Sicherheitsrisiko eingehen muss.

![process structure](./assets/process-structure.png)

## Tutorials

Hier folgen einige Tutorials welche einen schnellen Start für Entwickler ermöglichen sollen.

- [Dapp Entwicklungs Tutorial 1: Asch Dapp Hello World](./dapp_docs/1_hello_en.md)
	Dieses Tutorial zeigt wie man eine einfache Sidechain-Applikation erstellt und veröffentlicht. Desweiteren wird die Code-Struktur des Sidechain-Frameworks beleuchtet.

- [Dapp Entwicklungs Tutorial 2: Asch Dapp Asset](./dapp_docs/2_asset_en.md)
	Dieses Tutorial zeigt wie man ein Asset auf der Sidechain erstellt. Weiters wird die Kommunikation zwischen Front- und Backend analysiert.

- [Dapp Entwicklungs Tutorial 3: Asch Dapp Mini DAO](./dapp_docs/3_mini_dao_en.md)
	Dieses Tutorial zeigt wie man eine Typtransaktion oder einen intelligenten Vertrag erstellt. Dies wird anhand eines kleinen DAO-Projekts (DAO=Dezentrale Autonome Organisation) mit Projekt Management und Voting Funktion erläutert.

- [Dapp Entwicklungs Tutorial 4: Asch Dapp Dice Game](./dapp_docs/4_dice_game_en.md)
	Dieses Tutorial zeigt wie man kompliziertere Transaktionen und intelligente Verträge erstellt, als auch wie man solch einen Vertrag auf Basis von historischen Daten ausführt. Desweiteren wird die Realisierung eine Würfelspiels demonstriert.

- [Dapp Entwicklungs Tutorial 5: Eine Dapp veröffentlichen](./dapp_docs/5_dapp_publish_en.md)
	Dieses Tutorial zeigt wie man eine Applikation online registriert (Testchain, Hauptchain) und wie man diese installiert / deinstalliert.
