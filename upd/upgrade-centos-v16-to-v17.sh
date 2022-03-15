#!/bin/bash

RHOST='r.sfpanel.izetmolla.com'
CHOST='c.sfpanel.izetmolla.com'
REPO='cmmnt'
VERSION='rhel'
SFPANEL='/usr/local/sfpanel'
os=$(cut -f 1 -d ' ' /etc/redhat-release)
release=$(grep -o "[0-9]" /etc/redhat-release |head -n1)
codename="${os}_$release"
sfpanelcp="http://$CHOST/$VERSION/$release"
servername=$(hostname -f)


# PATH fix
if [ ! -f "/etc/profile.d/sfpanel.sh" ]; then
    echo "export SFPANEL='$SFPANEL'" > /etc/profile.d/sfpanel.sh
fi
if [ $( grep -ic "sfpanel" /root/.bash_profile ) -eq 0 ]; then
    echo 'PATH=$PATH:'$SFPANEL'/bin' >> /root/.bash_profile
fi


# Linking /var/log/sfpanel
if [ ! -L "/var/log/sfpanel" ]; then
    ln -s $SFPANEL/log /var/log/sfpanel
fi


# Added default install "expect" to work for backup sftp
yum -y install expect > /dev/null 2>&1


# Roundcube Sfpanel password driver - changing password_sfpanel_host (in config) to server hostname 
if [ -f "/usr/share/roundcubemail/plugins/password/config.inc.php" ]; then
    sed -i "s/localhost/$servername/g" /usr/share/roundcubemail/plugins/password/config.inc.php
fi


# Workaround for OpenVZ/Virtuozzo
if [ "$release" -eq '7' ] && [ -e "/proc/vz/veinfo" ]; then
    if [ $( grep -ic "Sfpanel: workraround for networkmanager" /etc/rc.local ) -eq 0 ]; then
        if [ -f "/etc/nginx/nginx.conf" ] ; then
            echo "#Sfpanel: workraround for networkmanager" >> /etc/rc.local
            echo "sleep 3 && service nginx restart" >> /etc/rc.local
        fi
        if [ -f "/etc/httpd/conf/httpd.conf" ] ; then
            echo "#Sfpanel: workraround for networkmanager" >> /etc/rc.local
            echo "sleep 2 && service httpd restart" >> /etc/rc.local
        fi
    fi
fi


# Fix for Spamassassin user_prefs
if [ -f "/etc/mail/spamassassin/local.cf" ] ; then
    if [ ! -d "/var/lib/spamassassin" ] ; then
        if [ "$release" -eq '7' ]; then
            groupadd -g 1001 spamd
            useradd -u 1001 -g spamd -s /sbin/nologin -d \
                /var/lib/spamassassin spamd
            mkdir /var/lib/spamassassin
            chown spamd:spamd /var/lib/spamassassin
        fi
    fi
fi


# Fix for clamav: /var/run ownership and foreground option
if [ -f "/etc/clamd.conf" ] ; then
    if [ ! -d "/var/run/clamav" ]; then
        mkdir /var/run/clamav
    fi
    chown -R clam:clam /var/run/clamav
    chown -R clam:clam /var/log/clamav
    if [ "$release" -eq '7' ]; then
        sed -i "s/nofork/foreground/" /usr/lib/systemd/system/clamd.service
        file="/usr/lib/systemd/system/clamd.service"
        if [ $( grep -ic "mkdir" $file ) -eq 0 ]; then
            sed -i "s/Type = simple/Type = simple\nExecStartPre = \/usr\/bin\/mkdir -p \/var\/run\/clamav\nExecStartPre = \/usr\/bin\/chown -R clam:clam \/var\/run\/clamav/g" $file
        fi
        systemctl daemon-reload
        /bin/systemctl restart clamd.service
    fi
fi


# Fixing empty NAT ip
ip=$(ip addr|grep 'inet '|grep global|head -n1|awk '{print $2}'|cut -f1 -d/)
pub_ip=$(curl -s sfpanel.izetmolla.com/what-is-my-ip/)
file="$SFPANEL/data/ips/$ip"
if [ -f "$file" ] && [ $( grep -ic "NAT=''" $file ) -eq 1 ]; then
    if [ ! -z "$pub_ip" ] && [ "$pub_ip" != "$ip" ]; then
        v-change-sys-ip-nat $ip $pub_ip
    fi
fi

# Dovecot logrorate script
wget $sfpanelcp/logrotate/dovecot -O /etc/logrotate.d/dovecot
