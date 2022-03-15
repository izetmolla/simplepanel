import React, { useEffect, useState } from 'react';
import { addActiveElement, removeFocusedElement } from "src/actions/MainNavigation/mainNavigationActions";
import { updateBackupExclusions, getBackupExclusionsInfo } from 'src/ControlPanelService/Backup';
import TextArea from 'src/components/ControlPanel/AddItemLayout/Form/TextArea/TextArea';
import AddItemLayout from 'src/components/ControlPanel/AddItemLayout/AddItemLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Toolbar from 'src/components/MainNav/Toolbar/Toolbar';
import Spinner from 'src/components/Spinner/Spinner';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

import './style.scss';
import HtmlParser from 'react-html-parser';

const EditBackupExclusions = () => {
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
    dispatch(addActiveElement('/list/backup/'));
    dispatch(removeFocusedElement());

    setState({ ...state, loading: true });
    fetchData();
  }, []);

  const fetchData = () => {
    getBackupExclusionsInfo()
      .then(response => {
        setState({
          ...state,
          data: response.data,
          loading: false
        });
      })
      .catch(err => console.error(err));
  }

  const submitFormHandler = event => {
    event.preventDefault();
    let updatedExclusions = {};

    for (var [name, value] of (new FormData(event.target)).entries()) {
      updatedExclusions[name] = value;
    }

    updatedExclusions['token'] = token;
    updatedExclusions['save'] = 'save';

    if (Object.keys(updatedExclusions).length !== 0 && updatedExclusions.constructor === Object) {
      setState({ ...state, loading: true });

      updateBackupExclusions(updatedExclusions)
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

  return (
    <div className="edit-template edit-backup-exclusions">
      <Helmet>
        <title>{`Sfpanel - ${i18n.BACKUP}`}</title>
      </Helmet>
      <Toolbar mobile={false}>
        <div></div>
        <div className="search-toolbar-name">{i18n['Editing Backup Exclusions']}</div>
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
          <form onSubmit={event => submitFormHandler(event)} id="edit-backup-exclusions">
            <TextArea
              title={i18n['Web Domains']}
              defaultValue={state.data.web}
              name="v_web"
              id="v_web" />

            <TextArea
              title={i18n['Mail Domains']}
              defaultValue={state.data.mail}
              name="v_mail"
              id="v_mail" />

            <TextArea
              title={i18n['Databases']}
              defaultValue={state.data.db}
              name="v_db"
              id="v_db" />

            <TextArea
              title={i18n['User Directories']}
              defaultValue={state.data.userdir}
              name="v_userdir"
              id="v_userdir" />

            <div className="buttons-wrapper">
              <button type="submit" className="add">{i18n.Save}</button>
              <button type="button" className="back" onClick={() => history.push('/list/backup/exclusions')}>{i18n.Back}</button>
            </div>
          </form>
        }
      </AddItemLayout>
    </div>
  );
}

export default EditBackupExclusions;
