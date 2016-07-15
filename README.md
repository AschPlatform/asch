Intro for new developers
------------------------

This is a quick introduction to get new developers up to speed on Asch.

Starting Asch
-----------------
Install running environment:
	sudo apt-get install nodejs
	sudo ln -s /usr/bin/nodejs /usr/bin/node
	sudo apt-get install sqlite3

and then proceed with:

	wget https://www.asch.so/downloads/asch-linux-0.9.1-testnet.tar.gz
	tar zxvf asch-linux-0.9.1-testnet.tar.gz
	cd asch-linux-0.9.1-testnet
	./aschd start

This will launch the asch server. If you would like to launch the command-line wallet you can do as follows:

	npm install -g asch-cli

Then, start the command-line wallet `asch-cli` and find the help doc:

   asch-cli -h
