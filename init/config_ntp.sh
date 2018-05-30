#!/bin/bash
#auth:lumpo
#date:2016-07-15

install_ntp() {
	echo "Installing ntp..."
	apt-get install ntp -yqq
	apt-get install ntpdate -yqq
	cnt=$(grep -v '#' /etc/ntp.conf | grep "pool.ntp.org prefer" | wc -l)
	if [ $cnt -eq 0 ];then
		echo "server pool.ntp.org prefer" >> /etc/ntp.conf
	fi
	/etc/init.d/ntp stop
	sleep 2
	ntpdate pool.ntp.org
	/etc/init.d/ntp start
	if [ $? -eq 0 ];then
		echo "Configure ntp done."
	else
		echo "Configure ntp err." && exit 3
	fi
}

main() {
	install_ntp
}

main
