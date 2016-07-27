#!/bin/bash
# kill send_batch.sh
ps aux | grep send |grep -v 'grep'| awk '{print $2}' | xargs kill

