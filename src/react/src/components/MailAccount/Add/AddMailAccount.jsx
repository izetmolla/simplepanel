import React, { useEffect, useState } from 'react';

import TextInputWithExtraButton from 'src/components/ControlPanel/AddItemLayout/Form/TextInputWithExtraButton/TextInputWithExtraButton';
import { addActiveElement, removeFocusedElement } from "../../../actions/MainNavigation/mainNavigationActions";
import TextInput from 'src/components/ControlPanel/AddItemLayout/Form/TextInput/TextInput';
import Password from 'src/components/ControlPanel/AddItemLayout/Form/Password/Password';
import TextArea from 'src/components/ControlPanel/AddItemLayout/Form/TextArea/TextArea';
import Checkbox from 'src/components/ControlPanel/AddItemLayout/Form/Checkbox/Checkbox';
import AddItemLayout from '../../ControlPanel/AddItemLayout/AddItemLayout';
import { addMailAccount, getMailList } from '../../../ControlPanelService/Mail';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MailInfoBlock from '../MailInfoBlock/MailInfoBlock';
import Toolbar from '../../MainNav/Toolbar/Toolbar';
import { useHistory } from 'react-router-dom';
import Spinner from '../../Spinner/Spinner';
import { useDispatch, useSelector } from 'react-redux';

import './AddMailAccount.scss';
import { Helmet } from 'react-helmet';
import { refreshCounters } from 'src/actions/MenuCounters/menuCounterActions';
import HtmlParser from 'react-html-parser';

export default function AddMailAccount(props) {
  const { i18n } = useSelector(state => state.session);
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const history = useHistory();
  const [state, setState] = useState({
    data: {},
    advancedOptions: false,
    autoreplyChecked: false,
    quotaValue: '',
    loading: false,
    password: '',
    userName: '',
    okMessage: '',
    errorMessage: '',
  });

  useEffect(() => {
    dispatch(addActiveElement(`/list/mail/`));
    dispatch(removeFocusedElement());

    fetchData();
  }, []);

  const submitFormHandler = event => {
    event.preventDefault();
    let newMailDomain = {};

    for (var [name, value] of (new FormData(event.target)).entries()) {      
      newMailDomain[name] = value;
    }

    newMailDomain['ok_acc'] = 'add';
    newMailDomain['token'] = token;
    newMailDomain['v_domain'] = props.domain;
    newMailDomain['v_password'] = state.password;

    if (!newMailDomain['v_quota']) newMailDomain['v_quota'] = '';
    if (!newMailDomain['v_aliases']) newMailDomain['v_aliases'] = '';
    if (!newMailDomain['v_fwd']) newMailDomain['v_fwd'] = '';

    if (Object.keys(newMailDomain).length !== 0 && newMailDomain.constructor === Object) {
      setState({ ...state, loading: true });
      addMailAccount(newMailDomain, props.domain)
        .then(result => {
          if (result.status === 200) {
            const { error_msg: errorMessage, ok_msg: okMessage } = result.data;

            if (errorMessage) {
              setState({ ...state, errorMessage, okMessage, loading: false });
            } else {
              dispatch(refreshCounters()).then(() => {
                setState({ ...state, okMessage, errorMessage: '', loading: false });
              });
            }
          }
        })
        .catch(err => console.error(err));
    }
  }

  const fetchData = () => {
    setState({ ...state, loading: true });

    getMailList()
      .then(response => {
        setState({
          ...state,
          data: response.data,
          errorMessage: response.data['error_msg'],
          okMessage: response.data['ok_msg'],
          loading: false
        });
      })
      .catch(err => console.error(err));
  }

  const toggleOptions = () => {
    setState({ ...state, advancedOptions: !state.advancedOptions });
  }

  const toggleQuotaValue = () => {
    if (state.quotaValue !== 'unlimited') {
      setState({ ...state, quotaValue: 'unlimited' });
    } else {
      setState({ ...state, quotaValue: '' });
    }
  }

  return (
    <div className="edit-template add-mail-account">
      <Helmet>
        <title>{`Sfpanel - ${i18n.MAIL}`}</title>
      </Helmet>
      <Toolbar mobile={false}>
        <div></div>
        <div className="search-toolbar-name">{i18n['Adding Mail Account']}</div>
        <div className="error">
          <span className="error-message">
            {state.errorMessage ? <FontAwesomeIcon icon="long-arrow-alt-right" /> : ''}
            {state.errorMessage}</span>
        </div>
        <div className="success">
          <span className="ok-message">
            {state.okMessage ? <FontAwesomeIcon icon="long-arrow-alt-right" /> : ''}
            <span>{HtmlParser(state.okMessage)}</span>
          </span>
        </div>
      </Toolbar>
      <AddItemLayout>
        {state.loading ? <Spinner /> : (
          <form onSubmit={event => submitFormHandler(event)}>
            <div className="r-1">
              <div className="c-1">
                <TextInput
                  title={i18n['Domain']}
                  value={props.domain}
                  name="v_domain"
                  id="domain"
                  disabled />

                <TextInput
                  title={i18n['Account']}
                  onChange={e => setState({ ...state, userName: e.target.value })}
                  name="v_account"
                  id="account" />

                <Password name="v_password" onChange={password => setState({ ...state, password })} />
              </div>

              <div className="c-2">
                <MailInfoBlock
                  webMail={state.data.webmail}
                  hostName={state.data.hostname}
                  userName={state.userName}
                  password={state.password}
                  domain={props.domain} />
              </div>
            </div>

            <div className="r-2">
              <button type="button" onClick={toggleOptions}>
                {i18n['Advanced options']}
                {state.advancedOptions ? <FontAwesomeIcon icon="caret-up" /> : <FontAwesomeIcon icon="caret-down" />}
              </button>

              {
                state.advancedOptions && (
                  <>
                    <TextInputWithExtraButton title={i18n['Quota']} optionalTitle={i18n['in megabytes']} id="quota" name="v_quota" value={state.quotaValue}>
                      <button type="button" onClick={toggleQuotaValue}>
                        <FontAwesomeIcon icon="infinity" />
                      </button>
                    </TextInputWithExtraButton>

                    <TextArea
                      optionalTitle={`${i18n['use local-part']}`}
                      defaultValue={state.data.v_aliases}
                      title={i18n['Aliases']}
                      name="v_aliases"
                      id="aliases" />

                    <TextArea
                      optionalTitle={`${i18n['one or more email addresses']}`}
                      defaultValue={state.data.forward}
                      title={i18n['Forward to']}
                      name="v_fwd"
                      id="fwd" />

                    <Checkbox
                      title={i18n['Do not store forwarded mail']}
                      name="v_fwd_only"
                      id="fwd_only" />
                  </>
                )
              }

              <TextInput
                title={i18n['Send login credentials to email address']}
                name="v_send_email"
                id="send_email" />
            </div>

            <div className="buttons-wrapper">
              <button type="submit" className="add">{i18n.Add}</button>
              <button type="button" className="back" onClick={() => history.push(`/list/mail/?domain=${props.domain}`)}>{i18n.Back}</button>
            </div>
          </form>
        )}
      </AddItemLayout>
    </div>
  );
}