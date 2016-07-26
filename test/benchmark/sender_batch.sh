#!/bin/sh
cnt=$1
for i in `seq 1 $cnt`
do
	#./sender_asch_cli.sh $i&
	./sender_http.sh $i&
done
wait
