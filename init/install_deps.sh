#!/bin/bash

function main() {
  echo "Updating apt-get ..."
  apt-get update -yqq

  echo "Installing nodejs,npm ..."
  apt-get install npm,nodejs -yqq && test -f /usr/bin/node || ln -s /usr/bin/nodejs /usr/bin/node

  echo "Installing sqlite3 ..." 
  apt-get install sqlite3 -yqq

  echo "Installing asch-cli ..."
  npm install -g asch-cli

  echo "Install dependent package done."
}

main
