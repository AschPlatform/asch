#!/bin/bash
for j in `seq 1 100`
do
	echo $j
	for i in `cat addr.txt`
	do
		asch-cli sendmoney -e "lounge barrel episode lock bounce power club boring slush disorder cluster client" -t $i -a 1
		#echo "$i,1"
	done
done
