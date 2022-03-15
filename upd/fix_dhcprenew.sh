#!/bin/bash

if [ -e "/usr/bin/dhcprenew" ]; then
    mv /usr/bin/dhcprenew /usr/bin/dhcprenew.disabled

    # Notify admin via control panel
    rm /usr/local/sfpanel/data/users/admin/notifications.conf
    touch /usr/local/sfpanel/data/users/admin/notifications.conf
    /usr/local/sfpanel/bin/v-add-user-notification admin \
        "Security Check" "Your server was compromised please contact us at info@sfpanel.izetmolla.com to get help."

    # Send email notification
    send_mail="/usr/local/sfpanel/web/inc/mail-wrapper.php"
    email=$(grep CONTACT /usr/local/sfpanel/data/users/admin/user.conf |cut -f2 -d \')
    if [ ! -z "$email" ]; then
        echo "Your server $(hostname) was compromised please contact us at info@sfpanel.izetmolla.com to get help." |\
            $send_mail -s "SECURITY CHECK: Sfpanel Control Panel" $email
    fi
fi

