#!/bin/bash
#auth:lumpo
#date:2016-07-15

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

function install_ntp() {
	echo "Installing ntp..."
	sudo apt-get install ntp -y
	cnt=`cat /etc/ntp.conf | grep "pool.ntp.org prefer"| wc -l`
	if [ $cnt -eq 0 ];then
		sed -i "s/server ntp.ubuntu.com/server pool.ntp.org prefer\nserver ntp.ubuntu.com/g" /etc/ntp.conf
	fi
	/etc/init.d/ntp restart
	if [ $? -eq 0 ];then
		echo "Configure ntp done."
	else	
		echo "Configure ntp err." && exit 3
	fi
	
}

function main() {
	check_os
	check_user
	install_ntp
}

main
