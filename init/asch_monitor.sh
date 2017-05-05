#!/bin/bash
readonly PROG_DIR=$(readlink -m $(dirname $0))
aschd=$PROG_DIR/../aschd
log=$PROG_DIR/../logs/asch_monitor.log

function auto_restart(){
	status=`$aschd status`
	if [ "$status" == "Asch server is not running" ];then
		$aschd restart
		echo "`date +%F' '%H:%M:%S`[error]	Asch server is not running and restarted" >> $log
	else
		echo "`date +%F' '%H:%M:%S`[info]	Asch server is running" >> $log
	fi	
	/etc/init.d/ntp stop
	sleep 2
	ntpdate pool.ntp.org >> $log
	/etc/init.d/ntp start
}

auto_restart
