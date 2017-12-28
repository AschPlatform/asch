#!/bin/bash
latestName="asch-linux-latest-mainnet"
mkdir -p tmp
/bin/rm -fr ./tmp/*

HOSTS='125.32.110.138:9999 www.asch.io'

bestCost=999999
bestHost='125.32.110.138:9999'

# select the best host by ping every host in $HOSTS, and pick up the time cost lowest .
for h in $HOSTS
do
    realHost=`echo $h | awk -F ':' '{print $1}'` #clean the port
    timeCost=`ping $realHost | head -2 | tail -1 | awk -F "=| " '{print $(NF-1)}' | awk -F '.' '{print $1}'`
    if [[ $timeCost -lt $bestCost ]]; then
        bestCost=$timeCost
        bestHost=$h
    fi
done

echo 'select '$bestHost' as the best host for downloading ...'

wget http://${bestHost}/downloads/$latestName.tar.gz -O tmp/$latestName.tar.gz
if [ $? -ne 0 ]; then
  rm -f tmp/$latestName.tar.gz
  echo "Failed to download the latest version!"
  exit 1
fi
echo "Extracting new package ..."
tar zxf tmp/$latestName.tar.gz -C tmp/
extractedDir=`find tmp -maxdepth 1 -type d | grep asch |head -n 1`
currentVersion=`./aschd version`
./aschd stop
echo "Copying new files ..."
for file in `ls $extractedDir`
do
  if [ "$file" != "config.json" -a "$file" != "blockchain.db" ]; then
    echo "copy $extractedDir/$file ..."
    cp -r $extractedDir/$file ./
  fi
done
newVersion=`./aschd version`
rm -rf $extractedDir tmp/$latestName.tar.gz
echo "Upgrade to $newVersion done."
#./aschd configure
./aschd start
