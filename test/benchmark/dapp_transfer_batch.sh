#!/bin/sh

if [ $# -ne 3 ]; then
	echo "$0 <threads> <ip> <secret>"
	exit 1
fi
cnt=$1
ip=$2
sec=$3
for i in `seq 1 $cnt`
do
	./dapp_transfer.sh $i $ip "$sec" &
done
wait
