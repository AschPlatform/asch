#!/bin/bash

function main() {
  echo "Updating apt-get ..."
  apt-get update -yqq

  # echo "Installing nodejs,npm ..."
  # apt-get install nodejs -yqq && test -f /usr/bin/node || ln -s /usr/bin/nodejs /usr/bin/node

  echo "Installing wget ..."
  apt-get install wget -yqq

  echo "Installing sqlite3 ..." 
  apt-get install sqlite3 -yqq

  echo "Install dependent package done."
}

main
