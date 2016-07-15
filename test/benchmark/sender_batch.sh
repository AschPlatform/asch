#!/bin/sh
cnt=$1
for i in `seq 1 $cnt`
do
	./sender.sh $i&
done
wait
