#!/bin/bash

# Include sfpanel.conf
source /usr/local/sfpanel/conf/sfpanel.conf

# Check if old scheme is in use
check_oldip=$(grep "^Listen" /etc/$WEB_SYSTEM/conf.d/sfpanel.conf)
if [ -z "$check_oldip" ]; then
    exit
fi

# Remove old ip definitions from sfpanel.conf
sed -i "/^Listen/d" /etc/$WEB_SYSTEM/conf.d/sfpanel.conf
sed -i "/^NameVirtualHost/d" /etc/$WEB_SYSTEM/conf.d/sfpanel.conf
sed -i "/^$/d" /etc/$WEB_SYSTEM/conf.d/sfpanel.conf

# Create new ip configs
for ip in $(ls /usr/local/sfpanel/data/ips); do
    web_conf="/etc/$WEB_SYSTEM/conf.d/$ip.conf"

    if [ "$WEB_SYSTEM" = 'httpd' ] || [ "$WEB_SYSTEM" = 'apache2' ]; then
        echo "NameVirtualHost $ip:$WEB_PORT" >  $web_conf
        echo "Listen $ip:$WEB_PORT" >> $web_conf
    fi

    if [ "$WEB_SSL" = 'mod_ssl' ]; then
        echo "NameVirtualHost $ip:$WEB_SSL_PORT" >> $web_conf
        echo "Listen $ip:$WEB_SSL_PORT" >> $web_conf
    fi
done

# Restart web server
/usr/local/sfpanel/bin/v-restart-web

exit
