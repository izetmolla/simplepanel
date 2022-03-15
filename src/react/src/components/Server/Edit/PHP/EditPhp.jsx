import React, { useEffect, useState } from 'react';
import { addActiveElement, removeFocusedElement } from "../../../../actions/MainNavigation/mainNavigationActions";
import TextInput from '../../../ControlPanel/AddItemLayout/Form/TextInput/TextInput';
import Checkbox from '../../../ControlPanel/AddItemLayout/Form/Checkbox/Checkbox';
import TextArea from '../../../ControlPanel/AddItemLayout/Form/TextArea/TextArea';
import { getServiceInfo, updateService } from 'src/ControlPanelService/Server';
import AddItemLayout from '../../../ControlPanel/AddItemLayout/AddItemLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from '../../../../components/Spinner/Spinner';
import Toolbar from '../../../MainNav/Toolbar/Toolbar';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './EditPhp.scss';
import { Helmet } from 'react-helmet';
import HtmlParser from 'react-html-parser';

const EditPhp = ({ serviceName = '' }) => {
  const token = localStorage.getItem("token");
  const { i18n } = useSelector(state => state.session);
  const history = useHistory();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState('');
  const [okMessage, setOkMessage] = useState('');
  const [restart, setRestart] = useState(true);
  const [state, setState] = useState({
    data: {},
    loading: false,
    basicOptions: true,
    advancedOptions: false
  });

  useEffect(() => {
    dispatch(addActiveElement('/list/server/'));
    dispatch(removeFocusedElement());

    if (!serviceName) {
      history.push('/list/server');
    }

    setState({ ...state, loading: true });
    fetchData();
  }, []);

  const fetchData = () => {
    getServiceInfo(serviceName)
      .then(response => {
        setState({
          ...state,
          data: response.data,
          loading: false
        });
      })
      .catch(err => {
        setState({ ...state, loading: false });
        console.error(err);
      });
  }

  const submitFormHandler = event => {
    event.preventDefault();
    let updatedService = {};

    for (var [name, value] of (new FormData(event.target)).entries()) {
      updatedService[name] = value;
    }

    if (Object.keys(updatedService).length !== 0 && updatedService.constructor === Object) {
      setState({ ...state, loading: true });

      updatedService['v_config'] = state.data.config;
      updatedService['v_restart'] = restart ? 'yes' : 'no';

      updateService(updatedService, `/${serviceName}`)
        .then(result => {
          if (result.status === 200) {
            const { error_msg, ok_msg } = result.data;

            setErrorMessage(error_msg || '');
            setOkMessage(ok_msg || '');
          }
        })
        .then(() => fetchData())
        .catch(err => console.error(err));
    }
  }

  const toggleOptions = () => {
    setState({
      ...state,
      advancedOptions: !state.advancedOptions,
      basicOptions: !state.basicOptions
    });
  }

  const onUpdateConfig = ({ id, value }) => {
    if (!value) return;

    var regexp = new RegExp(`(${id})(.+)(${state.data[id]})`, 'gm');
    const updatedConfig = state.data.config.replace(regexp, `$1$2${value}`);
    setState({ ...state, data: { ...state.data, config: updatedConfig, [id]: value } });
  }

  return (
    <div className="edit-template edit-php">
      <Helmet>
        <title>{`Sfpanel - ${i18n.SERVER}`}</title>
      </Helmet>
      <Toolbar mobile={false}>
        <div></div>
        <div className="search-toolbar-name"><Link to={`/edit/server/${state.data.web_system}`}>{i18n['Configuring Server']} / {state.data.web_system}</Link></div>
        <div className="link"><Link to="/edit/server/php">{i18n['Configure']} php.ini</Link></div>
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
      <AddItemLayout>
        {state.loading ? <Spinner /> :
          <form onSubmit={event => submitFormHandler(event)} id="edit-mail">
            <input type="hidden" name="save" value="save" />
            <input type="hidden" name="token" value={token} />

            {
              !state.basicOptions && (
                <button type="button" onClick={() => toggleOptions()}>
                  {i18n['Basic options']}
                  {state.basicOptions ? <FontAwesomeIcon icon="caret-up" /> : <FontAwesomeIcon icon="caret-down" />}
                </button>
              )
            }

            {
              state.basicOptions && (
                <>
                  <TextInput
                    id="max_execution_time"
                    title="max_execution_time"
                    name="v_max_execution_time"
                    onChange={event => onUpdateConfig(event.target)}
                    value={parseInt(state.data.max_execution_time)} />

                  <TextInput
                    id="worker_connections"
                    title="worker_connections"
                    name="v_worker_connections"
                    onChange={event => onUpdateConfig(event.target)}
                    value={parseInt(state.data.max_input_time)} />

                  <TextInput
                    id="memory_limit"
                    title="memory_limit"
                    name="v_memory_limit"
                    onChange={event => onUpdateConfig(event.target)}
                    value={parseInt(state.data.memory_limit)} />

                  <TextInput
                    id="error_reporting"
                    title="error_reporting"
                    name="v_error_reporting"
                    onChange={event => onUpdateConfig(event.target)}
                    value={state.data.error_reporting} />

                  <TextInput
                    id="display_errors"
                    title="display_errors"
                    name="v_display_errors"
                    onChange={event => onUpdateConfig(event.target)}
                    value={state.data.display_errors} />

                  <TextInput
                    id="post_max_size"
                    title="post_max_size"
                    name="v_post_max_size"
                    onChange={event => onUpdateConfig(event.target)}
                    value={state.data.post_max_size} />

                  <TextInput
                    id="upload_max_filesize"
                    title="upload_max_filesize"
                    name="v_upload_max_filesize"
                    onChange={event => onUpdateConfig(event.target)}
                    value={state.data.upload_max_filesize} />
                </>
              )
            }

            {
              !state.advancedOptions && (
                <button type="button" onClick={() => toggleOptions()}>
                  {i18n['Advanced options']}
                  {state.advancedOptions ? <FontAwesomeIcon icon="caret-up" /> : <FontAwesomeIcon icon="caret-down" />}
                </button>
              )
            }

            <br />
            <br />

            {
              state.advancedOptions && (
                <>
                  <TextArea
                    onChange={e => setState({ ...state, data: { ...state.data, config: e.target.value } })}
                    defaultValue={state.data.config}
                    title={state.data.config_path}
                    name="v_config"
                    id="v_config"
                    rows="25" />

                  <br />

                  <Checkbox
                    title={i18n['restart']}
                    defaultChecked={true}
                    onChange={checked => setRestart(checked)}
                    name="v_restart"
                    id="restart" />
                </>
              )
            }

            <div className="buttons-wrapper">
              <button type="submit" className="add">{i18n.Save}</button>
              <button type="button" className="back" onClick={() => history.push('/list/server/')}>{i18n.Back}</button>
            </div>

          </form>
        }
      </AddItemLayout>
    </div>
  );
}

export default EditPhp;