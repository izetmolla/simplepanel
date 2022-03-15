Name:           sfpanel-softaculous
Version:        1.0.0
Release:        1
Summary:        Sfpanel Control Panel
Group:          System Environment/Base
License:        Softaculous License
URL:            https://www.softaculous.com
Vendor:         sfpanel.izetmolla.com
Source0:        %{name}-%{version}.tar.gz
BuildRoot:      %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
Requires:       sfpanel-ioncube
Provides:       sfpanel-softaculous

%define         _sfpaneldir  /usr/local/sfpanel/softaculous

%description
This package contains Softaculous apps for Sfpanel Control Panel web interface.

%global debug_package %{nil}

%prep
%setup -q -n %{name}-%{version}

%build

%install
install -d  %{buildroot}%{_sfpaneldir}
%{__cp} -ad ./* %{buildroot}%{_sfpaneldir}

%clean
rm -rf %{buildroot}


%files
%defattr(-,root,root)
%attr(755,root,root) %{_sfpaneldir}
%config(noreplace) %{_sfpaneldir}/conf

%changelog
* Tue Nov 27 2018 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.8-24
- New version 5.1.2

* Mon Jul 21 2017 Serghey Rodin <builder@sfpanel.izetmolla.com> - 0.9.8-18
- Initial build for Softaculous 4.9.2
