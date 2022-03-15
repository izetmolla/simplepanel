import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Container from '../ControlPanel/Container/Container';
import ListItem from '../ControlPanel/ListItem/ListItem';
import { Link } from 'react-router-dom';
import './WebDomain.scss';
import { useSelector } from 'react-redux';

export default function WebDomain(props) {
  const { data } = props;
  const { i18n } = useSelector(state => state.session);

  const printStat = (stat, text) => {
    if (text === 'no' || text === '') {
      return <div className="crossed">{stat}</div>;
    }

    return <div>{stat}: <span className="stat">{text}</span></div>;
  }

  const toggleFav = (starred) => {
    if (starred) {
      props.toggleFav(data.NAME, 'add');
    } else {
      props.toggleFav(data.NAME, 'delete');
    }
  }

  const checkItem = () => {
    props.checkItem(data.NAME);
  }

  const renderProxySupport = () => {
    if (!data.PROXY_SYSTEM) return;

    if (data.PROXY_SUPPORT === 'no') {
      printStat(i18n['Proxy Support'], '');
    } else {
      printStat(i18n['Proxy Support'], data.PROXY_SUPPORT);
    }
  }

  const renderBackedSupport = () => {
    if (!data.WEB_BACKEND) return;

    if (data.BACKEND_SUPPORT === 'no') {
      printStat(i18n['Backend Support'] ?? 'Backend Support', '');
    } else {
      printStat(i18n['Backend Support'] ?? 'Backend Support', data.BACKEND_SUPPORT);
    }
  }

  const handleSuspend = () => {
    let suspendedStatus = data.SUSPENDED === 'yes' ? 'unsuspend' : 'suspend';
    props.handleModal(data.spnd_confirmation, `/api/v1/${suspendedStatus}/web/index.php?domain=${data.NAME}`);
  }

  const handleDelete = () => {
    props.handleModal(data.delete_confirmation, `/api/v1/delete/web/index.php?domain=${data.NAME}`);
  }

  return (
    <ListItem
      id={data.NAME}
      checked={data.isChecked}
      starred={data.STARRED}
      date={data.DATE}
      toggleFav={toggleFav}
      checkItem={checkItem}
      suspended={data.SUSPENDED === 'yes'}
      focused={data.FOCUSED} >
      <Container className="r-col w-85">
        <div className="name">
          <div>{data.NAME}</div>
          <div><span className="dns-name-span">{data.ALIAS.replace(/,/g, ', ')}</span></div>
        </div>
        <div>{data.IP}</div>
        <div className="stats">
          <Container className="c-1 w-25">
            <div className="bandwidth">
              {i18n.Bandwidth}
              <span><span className="stat">{data.U_BANDWIDTH_SIZE}</span>{data.U_BANDWIDTH_MEASURE}</span>
              <div className="percent" style={{ width: `${data.U_BANDWIDTH_PERCENT}%` || '0%' }}></div>
            </div>
            <div className="disk">
              {i18n.Disk}: <span><span className="stat">{data.U_DISK_SIZE}</span>{data.U_DISK_MEASURE}</span>
              <div className="percent" style={{ width: `${data.U_DISK_PERCENT}%` || '0%' }}></div>
            </div>
          </Container>
          <Container className="c-2 w-45">
            <div>{i18n['Web Template']}: <span className="stat">{data.TPL}</span></div>
            {data.SSL === 'no'
              ? printStat(i18n['SSL Support'], '')
              : printStat(i18n['SSL Support'], data.LETSENCRYPT === 'yes' ? i18n['Lets Encrypt'] : i18n[data.SSL])}
            {printStat(i18n['Web Statistics'], data.WEB_STATS)}
          </Container>
          <Container className="c-3 w-35">
            {renderProxySupport()}
            {data.PROXY_SYSTEM && printStat(i18n['Proxy Template'] ?? 'Proxy Template', data.PROXY)}
            {renderBackedSupport()}
            {data.WEB_BACKEND && printStat(i18n['Backend Template'] ?? 'Backend Template', data.BACKEND)}
            {printStat(i18n['Additional FTP Account'], data.FTP)}
          </Container>
        </div>
      </Container>
      <div className="actions">
        <div>
          <Link className="link-edit" to={`/edit/web?domain=${data.NAME}`}>
            {i18n.edit}
            {data.FOCUSED ? <span className="shortcut-button html-unicode">&#8617;</span> : <FontAwesomeIcon icon="pen" />}
          </Link>
        </div>
        <div>
          <Link className="link-gray" to={`/list/web-log?domain=${data.NAME}&type=access`}>
            {i18n['view logs']}
            {data.FOCUSED ? <span className="shortcut-button">L</span> : <FontAwesomeIcon icon="list" />}
          </Link>
        </div>
        {
          data.STATS && (
            <div>
              <a className="link-gray" href={`http://${data.NAME}/vstats/`} target="_blank" rel="noopener noreferrer">
                {i18n['open webstats']}
                {data.FOCUSED ? <span className="shortcut-button">L</span> : <FontAwesomeIcon icon="list" />}
              </a>
            </div>
          )
        }
        <div>
          <button
            className="link-gray"
            onClick={handleSuspend}>
            {i18n[data.spnd_action]}
            {data.FOCUSED ? <span className="shortcut-button">S</span> : <FontAwesomeIcon icon={data.SUSPENDED === 'yes' ? 'unlock' : 'lock'} />}
          </button>
        </div>
        <div>
          <button className="link-delete" onClick={handleDelete}>
            {i18n.Delete}
            {data.FOCUSED ? <span className="shortcut-button del">Del</span> : <FontAwesomeIcon icon="times" />}
          </button>
        </div>
      </div>
    </ListItem>
  );
}
