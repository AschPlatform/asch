#!/bin/bash
work_id=$1
for j in `seq 1 100`
do
	#echo $j
	for i in `cat addr.txt`
	do
		asch-cli -H 45.32.248.33 sendmoney -e "lounge barrel episode lock bounce power club boring slush disorder cluster client" -t $i -a 1
    echo "$work_id, $j, $i"
	done
done
