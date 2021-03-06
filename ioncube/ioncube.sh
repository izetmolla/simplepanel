#!/bin/bash

action=${1-add}
SFPANEL='/usr/local/sfpanel'
ioncube="ioncube_loader_lin_5.6.so"
php='/usr/local/sfpanel/php/lib/php.ini'

if [ ! -e "$php" ]; then
    exit
fi

if [ ! -e "$SFPANEL/ioncube/$ioncube" ]; then
    exit
fi

if [ "$action" = 'add' ]; then
    if [ -z "$(grep $ioncube $php |grep -v ';')" ]; then
        echo "zend_extension = '$SFPANEL/ioncube/$ioncube'" >> $php
        /etc/init.d/sfpanel restart
    fi
else
    if [ ! -z "$(grep $ioncube $php |grep -v ';')" ]; then
        sed -i "/$ioncube/d"  $php
        /etc/init.d/sfpanel restart
    fi
fi

exit
