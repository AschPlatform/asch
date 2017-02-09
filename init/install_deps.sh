#!/bin/bash

function main() {
  echo "Updating apt-get ..."
  apt-get update -yqq

  # echo "Installing nodejs,npm ..."
  # apt-get install nodejs -yqq && test -f /usr/bin/node || ln -s /usr/bin/nodejs /usr/bin/node

  echo "Installing wget/curl/sqlite3 ..."
  apt-get install wget curl sqlite3 -yqq

  echo "Install dependent package done."
}

main
