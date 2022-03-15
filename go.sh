
curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt-get install -y nodejs gcc g++ make 
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
apt install yarn -y

cp /usr/local/sfpanel/install/ubuntu/20.04/services/sfpanel.service /etc/systemd/system
./install/vst-install-ubuntu.sh -f --nginx yes --phpfpm yes --apache no --named yes --remi no --vsftpd yes --proftpd no --iptables yes --fail2ban yes --quota yes --exim yes --dovecot yes --spamassassin yes --clamav yes --softaculous no --mysql yes --postgresql no