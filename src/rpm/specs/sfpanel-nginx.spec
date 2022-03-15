Name:           sfpanel-nginx
Version:        1.0.0
Release:        1
Summary:        Sfpanel Control Panel
Group:          System Environment/Base
License:        BSD-like
URL:            http://sfpanel.izetmolla.com/
Vendor:         sfpanel.izetmolla.com
Source0:        %{name}-%{version}.tar.gz
Source1:        nginx.conf
Source2:        sfpanel.init
Requires:       redhat-release >= 5
Provides:       sfpanel-nginx
BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)

%description
This package contains nginx webserver for Sfpanel Control Panel web interface.

%prep
%setup -q -n %{name}-%{version}

%build
./configure --prefix=/usr/local/sfpanel/nginx --with-http_ssl_module
make

%install
make install DESTDIR=%{buildroot} INSTALLDIRS=vendor
%{__install} -p -D -m 0755 %{SOURCE1} %{buildroot}/usr/local/sfpanel/nginx/conf/nginx.conf
%{__install} -p -D -m 0755 %{SOURCE2} %{buildroot}%{_initrddir}/sfpanel
%{__install} -p -D -m 0755  %{buildroot}/usr/local/sfpanel/nginx/sbin/nginx %{buildroot}/usr/local/sfpanel/nginx/sbin/sfpanel-nginx
%clean
rm -rf %{buildroot}

%post
/sbin/chkconfig --add sfpanel

%preun
if [ $1 = 0 ]; then
    /sbin/service sfpanel stop >/dev/null 2>&1
    /sbin/chkconfig --del sfpanel
fi

%postun
if [ $1 -ge 1 ]; then
    if [ -e "/var/run/sfpanel-nginx.pid" ]; then
        /sbin/service sfpanel restart > /dev/null 2>&1 || :
    fi
fi

%files
%defattr(-,root,root)
%attr(755,root,root) /usr/local/sfpanel/nginx
%{_initrddir}/sfpanel
%config(noreplace) /usr/local/sfpanel/nginx/conf/nginx.conf


%changelog
* Tue Jul 30 2013 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.8-1
- upgraded to nginx-1.4.2

* Sat Apr 06 2013 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.7-2
- new init script

* Wed Jun 27 2012 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.7-1
- initial build
