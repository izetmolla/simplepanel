#!/bin/bash

if [ -e "/etc/sudoers.d/admin" ]; then
    sed -i "s/admin.*ALL=(ALL).*/# sudo is limited to sfpanel scripts/" \
        /etc/sudoers.d/admin
fi

sed -i "s/%admin.*ALL=(ALL).*/# sudo is limited to sfpanel scripts/" /etc/sudoers
