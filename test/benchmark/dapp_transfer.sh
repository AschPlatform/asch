#!/bin/bash
if [ $# -ne 3 ]; then
	echo "$0 <worker_id> <ip> <secret>"
	exit 1
fi
work_id=$1
ip=$2
sec=$3
for sq in `seq 1 100`
do
	rev=${work_id}${sq}
	curl -k -H "Content-Type: application/json" -X PUT -d '{"secret":"'"$sec"'","fee":"0","func":"core.transfer", "args": ["CNY", "10", "'"$rev"'"]}' http://$ip:4096/api/dapps/default/api/transactions/unsigned
  echo "work_id:$work_id, seq:$sq, reciver:$rev"
done
