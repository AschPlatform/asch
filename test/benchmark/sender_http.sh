#!/bin/bash
work_id=$1
ip="45.32.248.33"
sec='lounge barrel episode lock bounce power club boring slush disorder cluster client'
for sq in `seq 1 100`
do
	#echo $j
	for rev in `cat addr.txt`
	do
		curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"'"$sec"'","amount":1,"recipientId":"'"$rev"'"}' http://$ip:4096/api/transactions
    		echo "work_id:$work_id, seq:$sq, reciver:$rev"
	done
done
