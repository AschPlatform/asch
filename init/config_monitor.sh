#!/bin/bash
#auth:lumpo
#date:2016-07-15

readonly INIT_DIR=$(readlink -m $(dirname $0))

add_cron() {
	cnt=$(grep 'asch_monitor' /etc/crontab | grep -v '#' | wc -l)
	if [ $cnt -eq 0 ];then
		echo "*/1 * * * * root $INIT_DIR/asch_monitor.sh" >> /etc/crontab
		if [ $? -ne 0 ];then
			echo "Add asch_monitor crontab err, please add it manually!" && exit 2
		fi
	fi
}

main() {
	add_cron
	echo "Configure asch_monitor crontab done."
}

main
