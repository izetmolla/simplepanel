import React, { useEffect, useState } from 'react';
import { addActiveElement, removeFocusedElement } from "../../../actions/MainNavigation/mainNavigationActions";
import SelectInput from '../../ControlPanel/AddItemLayout/Form/SelectInput/SelectInput';
import TextInput from '../../ControlPanel/AddItemLayout/Form/TextInput/TextInput';
import AddItemLayout from '../../ControlPanel/AddItemLayout/AddItemLayout';
import { getDNSInfo, updateDNS } from '../../../ControlPanelService/Dns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from '../../../components/Spinner/Spinner';
import Toolbar from '../../MainNav/Toolbar/Toolbar';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import QS from 'qs';

import './EditDomainNameSystem.scss';
import { Helmet } from 'react-helmet';
import { refreshCounters } from 'src/actions/MenuCounters/menuCounterActions';
import HtmlParser from 'react-html-parser';

const EditDomainNameSystem = props => {
  const token = localStorage.getItem("token");
  const { i18n } = useSelector(state => state.session);
  const history = useHistory();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState('');
  const [okMessage, setOkMessage] = useState('');
  const [state, setState] = useState({
    data: {},
    loading: false
  });

  useEffect(() => {
    let queryParams = QS.parse(history.location.search, { ignoreQueryPrefix: true });
    const { domain } = queryParams;

    dispatch(addActiveElement('/list/dns/'));
    dispatch(removeFocusedElement());

    if (domain) {
      setState({ ...state, loading: true });
      fetchData(domain);
    }
  }, []);

  const fetchData = domain => {
    getDNSInfo(domain)
      .then(response => {
        setState({
          ...state,
          data: response.data,
          loading: false
        });
      })
      .catch(err => {
        setState({ ...state, loading: false });
        console.error(err)
      });
  }

  const submitFormHandler = event => {
    event.preventDefault();
    let updatedDomain = {};

    for (var [name, value] of (new FormData(event.target)).entries()) {
      updatedDomain[name] = value;
    }

    updatedDomain['v_domain'] = state.data.domain;

    if (Object.keys(updatedDomain).length !== 0 && updatedDomain.constructor === Object) {
      setState({ ...state, loading: true });

      updateDNS(updatedDomain, state.data.domain)
        .then(result => {
          if (result.status === 200) {
            const { error_msg, ok_msg } = result.data;

            if (error_msg) {
              setErrorMessage(error_msg);
              setOkMessage('');
            } else {
              dispatch(refreshCounters()).then(() => {
                setErrorMessage('');
                setOkMessage(ok_msg);
              });
            }
          }
        })
        .then(() => fetchData(state.data.domain))
        .catch(err => console.error(err));
    }
  }

  return (
    <div className="edit-template edit-dns">
      <Helmet>
        <title>{`Sfpanel - ${i18n.DNS}`}</title>
      </Helmet>
      <Toolbar mobile={false}>
        <div></div>
        <div className="search-toolbar-name">{i18n['Editing DNS Domain']}</div>
        <div className="error">
          <span className="error-message">
            {errorMessage ? <FontAwesomeIcon icon="long-arrow-alt-right" /> : ''} {errorMessage}
          </span>
        </div>
        <div className="success">
          <span className="ok-message">
            {okMessage ? <FontAwesomeIcon icon="long-arrow-alt-right" /> : ''} <span>{HtmlParser(okMessage)}</span>
          </span>
        </div>
      </Toolbar>
      <AddItemLayout date={state.data.date} time={state.data.time} status={state.data.status}>
        {state.loading ? <Spinner /> :
          <form onSubmit={event => submitFormHandler(event)} id="edit-dns">
            <input type="hidden" name="save" value="save" />
            <input type="hidden" name="token" value={token} />

            <TextInput id="domain" name="v_domain" title={i18n['Domain']} value={state.data.domain} disabled />

            <TextInput id="ip" name="v_ip" title={i18n['IP Address']} value={state.data.ip} />

            <SelectInput
              optionalTitle={state.data.dns_system}
              options={state.data.templates}
              selected={state.data.template}
              title={i18n['Template']}
              name="v_template"
              id="templates" />

            <TextInput
              optionalTitle={state.data['YYYY-MM-DD']}
              title={i18n['Expiration Date']}
              value={state.data.exp}
              name="v_exp"
              id="exp" />

            <TextInput id="soa" name="v_soa" title="SOA" value={state.data.soa} />

            <TextInput id="ttl" name="v_ttl" title="TTL" value={state.data.ttl} />

            <div className="buttons-wrapper">
              <button type="submit" className="add">{i18n.Save}</button>
              <button type="button" className="back" onClick={() => history.push('/list/dns/')}>{i18n.Back}</button>
            </div>

          </form>
        }
      </AddItemLayout>
    </div>
  );
}

export default EditDomainNameSystem;