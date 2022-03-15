#!/bin/bash

source /etc/profile.d/sfpanel.sh
if [ ! -e "$SFPANEL/data/firewall" ]; then
    mkdir -p $SFPANEL/data/firewall
    chmod 770 $SFPANEL/data/firewall

    cp $SFPANEL/install/rhel/firewall/* \
        $SFPANEL/data/firewall/
    chmod 660 $SFPANEL/data/firewall/*

    source $SFPANEL/conf/sfpanel.conf
    if [ -z "$FIREWALL_SYSTEM" ]; then
        echo "FIREWALL_SYSTEM='iptables'" \
            >> $SFPANEL/conf/sfpanel.conf
    fi
fi
