import React, { useEffect, useState } from 'react';
import { addActiveElement, removeFocusedElement } from "../../../../actions/MainNavigation/mainNavigationActions";
import Checkbox from '../../../ControlPanel/AddItemLayout/Form/Checkbox/Checkbox';
import TextArea from '../../../ControlPanel/AddItemLayout/Form/TextArea/TextArea';
import AddItemLayout from '../../../ControlPanel/AddItemLayout/AddItemLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getServiceInfo, updateService } from 'src/ControlPanelService/Server';
import Spinner from '../../../../components/Spinner/Spinner';
import Toolbar from '../../../MainNav/Toolbar/Toolbar';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './Service.scss';
import { Helmet } from 'react-helmet';
import HtmlParser from 'react-html-parser';

const Service = ({ serviceName = '' }) => {
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
    dispatch(addActiveElement('/list/server/'));
    dispatch(removeFocusedElement());

    if (!serviceName) {
      history.push('/list/server');
    }

    setState({ ...state, loading: true });
    fetchData(serviceName);
  }, []);

  const fetchData = serviceName => {
    getServiceInfo(serviceName)
      .then(response => {
        const { config } = response.data;

        if (!config || config.includes("file doesn't exist")) {
          history.push('/list/server');
        }

        setState({ ...state, data: response.data, loading: false });
      })
      .catch(err => console.error(err));
  }

  const submitFormHandler = event => {
    event.preventDefault();
    let updatedService = {};

    for (var [name, value] of (new FormData(event.target)).entries()) {
      updatedService[name] = value;
    }

    if (Object.keys(updatedService).length !== 0 && updatedService.constructor === Object) {
      setState({ ...state, loading: true });

      updateService(updatedService, serviceName)
        .then(result => {
          if (result.status === 200) {
            const { error_msg, ok_msg } = result.data;

            setErrorMessage(error_msg || '');
            setOkMessage(ok_msg || '');
          }
        })
        .then(() => fetchData(serviceName))
        .catch(err => console.error(err));
    }
  }

  return (
    <div className="edit-template edit-service">
      <Helmet>
        <title>{`Sfpanel - ${i18n.SERVER}`}</title>
      </Helmet>
      <Toolbar mobile={false}>
        <div></div>
        <div className="search-toolbar-name">
          {i18n['Configuring Server']} / {state.data.service_name}
        </div>
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
          <form onSubmit={event => submitFormHandler(event)} id="edit-service">
            <input type="hidden" name="save" value="save" />
            <input type="hidden" name="token" value={token} />

            <TextArea
              defaultValue={state.data.config}
              title={state.data.config_path}
              name="v_config"
              id="v_config"
              rows="18" />

            <br />

            <Checkbox
              title={i18n['restart']}
              defaultChecked={true}
              name="v_restart"
              id="restart" />

            <div className="buttons-wrapper">
              <button type="submit" className="add">{i18n.Save}</button>
              <button type="button" className="back" onClick={() => history.push('/list/server/')}>{i18n.Back}</button>
            </div>

          </form>
        }
      </AddItemLayout>
    </div >
  );
}

export default Service;