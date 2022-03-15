import React, { useEffect, useState } from 'react';

import TextInputWithExtraButton from 'src/components/ControlPanel/AddItemLayout/Form/TextInputWithExtraButton/TextInputWithExtraButton';
import { addActiveElement, removeFocusedElement } from "../../../actions/MainNavigation/mainNavigationActions";
import TextInput from 'src/components/ControlPanel/AddItemLayout/Form/TextInput/TextInput';
import Password from 'src/components/ControlPanel/AddItemLayout/Form/Password/Password';
import TextArea from 'src/components/ControlPanel/AddItemLayout/Form/TextArea/TextArea';
import Checkbox from 'src/components/ControlPanel/AddItemLayout/Form/Checkbox/Checkbox';
import { editMailAccount, getMailAccountInfo } from '../../../ControlPanelService/Mail';
import AddItemLayout from '../../ControlPanel/AddItemLayout/AddItemLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MailInfoBlock from '../MailInfoBlock/MailInfoBlock';
import Toolbar from '../../MainNav/Toolbar/Toolbar';
import { useHistory } from 'react-router-dom';
import Spinner from '../../Spinner/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { refreshCounters } from 'src/actions/MenuCounters/menuCounterActions';
import HtmlParser from 'react-html-parser';

export default function EditMailAccount(props) {
  const [autoreplyChecked, setAutoreplyChecked] = useState(false);
  const token = localStorage.getItem("token");
  const { i18n } = useSelector(state => state.session);
  const dispatch = useDispatch();
  const history = useHistory();
  const [errorMessage, setErrorMessage] = useState('');
  const [okMessage, setOkMessage] = useState('');
  const [state, setState] = useState({
    data: {},
    quotaValue: '',
    loading: false,
    password: ''
  });

  useEffect(() => {
    dispatch(addActiveElement(`/list/mail/`));
    dispatch(removeFocusedElement());
    setState({ ...state, loading: true });

    fetchData();
  }, []);

  const submitFormHandler = event => {
    event.preventDefault();
    let newMailDomain = {};

    for (var [name, value] of (new FormData(event.target)).entries()) {
      newMailDomain[name] = value;
    }

    newMailDomain['v_domain'] = props.domain;
    newMailDomain['v_account'] = props.account;
    newMailDomain['Password'] = newMailDomain['v_password'];

    if (Object.keys(newMailDomain).length !== 0 && newMailDomain.constructor === Object) {
      setState({ ...state, loading: true });
      editMailAccount(newMailDomain, props.domain, props.account)
        .then(result => {
          if (result.status === 200) {
            const { error_msg, ok_msg } = result.data;

            if (error_msg) {
              setErrorMessage(error_msg);
              setOkMessage('');
              setState({ ...state, loading: false });
            } else {
              dispatch(refreshCounters()).then(() => {
                setErrorMessage('');
                setOkMessage(ok_msg);
                setState({ ...state, loading: false });
              });
            }
          }
        })
        .catch(err => console.error(err));
    }
  }

  const fetchData = () => {
    setState({ ...state, loading: true });

    getMailAccountInfo(props.domain, props.account)
      .then(response => {
        setState({
          ...state,
          data: response.data,
          loading: false
        });

        setAutoreplyChecked(response.data.autoreply === 'yes');
      })
      .catch(err => console.error(err));
  }

  const toggleQuota = () => {
    const value = state.data.quota === 'unlimited' ? '1000' : 'unlimited';
    setState({ ...state, data: { ...state.data, quota: value } });
  }

  const goBack = () => {
    history.push(`/list/mail/?domain=${props.domain}`);
  }

  return (
    <div className="edit-template add-mail-account">
      <Helmet>
        <title>{`Sfpanel - ${i18n.MAIL}`}</title>
      </Helmet>
      <Toolbar mobile={false}>
        <div></div>
        <div className="search-toolbar-name">{i18n['Editing Mail Account']}</div>
        <div className="error">
          <span className="error-message">
            {errorMessage ? <FontAwesomeIcon icon="long-arrow-alt-right" /> : ''}
            {errorMessage}</span>
        </div>
        <div className="success">
          <span className="ok-message">
            {okMessage ? <FontAwesomeIcon icon="long-arrow-alt-right" /> : ''}
            <span>{HtmlParser(okMessage)}</span>
          </span>
        </div>
      </Toolbar>
      <AddItemLayout>
        {state.loading ? <Spinner /> : (
          <form onSubmit={event => submitFormHandler(event)}>
            <input type="hidden" name="save" value="save" />
            <input type="hidden" name="token" value={token} />

            <div className="r-1">
              <div className="c-1">
                <TextInput
                  title={i18n['Domain']}
                  value={props.domain}
                  name="v_domain"
                  id="domain"
                  disabled />

                <Password name="v_password" onChange={password => setState({ ...state, password })} />

                <TextInputWithExtraButton title={i18n['Quota']} optionalTitle={i18n['in megabytes']} id="quota" name="v_quota" value={state.data.quota}>
                  <button type="button" onClick={toggleQuota}>
                    <FontAwesomeIcon icon="infinity" />
                  </button>
                </TextInputWithExtraButton>

                <TextArea
                  optionalTitle={`${i18n['use local-part']}`}
                  defaultValue={state.data.aliases}
                  title={i18n['Aliases']}
                  name="v_aliases"
                  id="aliases" />

                <TextArea
                  optionalTitle={`${i18n['one or more email addresses']}`}
                  defaultValue={state.data.fwd}
                  title={i18n['Forward to']}
                  name="v_fwd"
                  id="fwd" />

                <Checkbox
                  title={i18n['Do not store forwarded mail']}
                  defaultChecked={state.data.fwd_only === 'yes'}
                  name="v_fwd_only"
                  id="fwd_only" />

                <Checkbox
                  title={i18n['Autoreply']}
                  checked={autoreplyChecked}
                  onChange={checked => setAutoreplyChecked(checked)}
                  name="v_autoreply"
                  id="autoreply" />

                {
                  autoreplyChecked && (
                    <div style={{ transform: 'translateX(3rem)' }}>
                      <TextArea
                        defaultValue={state.data.autoreply_message}
                        title={i18n['Message']}
                        name="v_autoreply_message"
                        id="autoreply_message" />
                    </div>
                  )
                }

                <TextInput
                  title={i18n['Send login credentials to email address']}
                  value={state.data.send_email}
                  name="v_credentials"
                  id="credentials" />
              </div>

              <div className="c-2">
                <MailInfoBlock
                  webMail={state.data.webmail}
                  hostName={state.data.hostname}
                  userName={props.account}
                  password={state.password}
                  domain={props.domain} />
              </div>
            </div>

            <div className="buttons-wrapper">
              <button type="submit" className="add">{i18n.Save}</button>
              <button type="button" className="back" onClick={goBack}>{i18n.Back}</button>
            </div>
          </form>
        )}
      </AddItemLayout>
    </div>
  );
}