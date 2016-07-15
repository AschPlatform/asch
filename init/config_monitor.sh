#!/bin/bash
#auth:lumpo
#date:2016-07-15

readonly INIT_DIR=$(readlink -m $(dirname $0))


function check_os() {
	os_num=`cat /etc/os-release | grep '\"Ubuntu\"'  | wc -l`
	if [ $os_num -ne 1 ];then
		echo "Linux is not Ubuntu,please configure the ntp manually!" && exit 1
	else
		echo "Linux is Ubuntu"
	fi
}

function check_user() {
	uid=`id -u` 
	if [ $uid -ne 0 ];then
		echo "Current user is not root,please run this script as root!" && exit 2
	else
		echo "user is root"
	fi
}

function add_cron() {
	cnt=`cat /var/spool/cron/crontabs/root | grep 'asch_monitor' | grep -v '#' | wc -l`
	if [ $cnt -eq 0 ];then
		echo "*/1 * * * * $INIT_DIR/asch_monitor.sh" >> /var/spool/cron/crontabs/root 
		if [ $? -eq 0 ];then
			echo "Add asch_monitor crontab sucessfull!"
		else
			echo "Add asch_monitor crontab err,please add it manually!"
		fi
	else
		echo "Already have asch_monitor crontab."
	fi	
}

function main() {
	check_os
	check_user
	add_cron
}

main
