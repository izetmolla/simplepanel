Name:           sfpanel-php
Version:        1.0.0
Release:        1
Summary:        Sfpanel Control Panel
Group:          System Environment/Base
License:        GPL
URL:            http://sfpanel.izetmolla.com/
Vendor:         sfpanel.izetmolla.com
Source0:        %{name}-%{version}.tar.gz
Source1:        php.ini
Source2:        php-fpm.conf
Requires:       redhat-release >= 5
Provides:       sfpanel-php
BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

%description
This package contains php-cgi for Sfpanel Control Panel web interface.

%prep
%setup -q -n %{name}-%{version}

%build
./configure --prefix=/usr/local/sfpanel/php --with-zlib --enable-zip --enable-fpm --with-fpm-user=admin --with-fpm-group=admin --with-mysql --with-mysqli --with-curl --enable-mbstring

make ZEND_EXTRA_LIBS='-lresolv'

%install
make install INSTALL_ROOT=%{buildroot} INSTALLDIRS=vendor
install -p -D -m 0755 %{SOURCE1} %{buildroot}/usr/local/sfpanel/php/lib/
%{__install} -p -D -m 0755 %{SOURCE2} %{buildroot}/usr/local/sfpanel/php/etc/
%{__install} -p -D -m 0755  %{buildroot}/usr/local/sfpanel/php/sbin/php-fpm %{buildroot}/usr/local/sfpanel/php/sbin/sfpanel-php


rm -rf $RPM_BUILD_ROOT/.channels
rm -rf $RPM_BUILD_ROOT/.depdb
rm -rf $RPM_BUILD_ROOT/.depdblock
rm -rf $RPM_BUILD_ROOT/.filemap
rm -rf $RPM_BUILD_ROOT/.lock

%clean
rm -rf %{buildroot}

%post
if [ $1 -eq 1 ]; then
    if [ -e /usr/local/sfpanel/ioncube/ioncube.sh ]; then
        /usr/local/sfpanel/ioncube/ioncube.sh add
    fi
fi

%postun
if [ $1 -ge 1 ]; then
    if [ -e "/var/run/sfpanel-php.pid" ]; then
        /sbin/service sfpanel restart > /dev/null 2>&1 || :
    fi
fi

%files
%defattr(-,root,root)
%attr(755,root,root) /usr/local/sfpanel/php

%changelog
* Wed Jul 31 2013 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.8-16
- New session save path

* Wed Jul 31 2013 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.8-1
- Upgraded to 5.4.17

* Fri Mar 05 2013 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.7-3
- Added LANG variable to evn in php-fpm.conf

* Wed Jun 27 2012 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.7-2
- Added LANG variable to evn in php-fpm.conf

* Wed Jun 27 2012 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.7-1
- initial php build
