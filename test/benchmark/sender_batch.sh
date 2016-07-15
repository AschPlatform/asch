#!/bin/sh
cnt=$1
for i in `seq 1 $cnt`
do
	/data/tools/asch-git/asch/test/benchmark/sender.sh &
done
