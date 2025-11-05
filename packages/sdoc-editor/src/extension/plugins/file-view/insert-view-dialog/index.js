import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalBody, ModalFooter, Alert, Label, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';
import Loading from '../../../../components/loading';
import toaster from '../../../../components/toast';
import context from '../../../../context';
import { getErrorMsg } from '../../../../utils/common-utils';
import { getAccessibleRepos, getWikiSettings, insertFileView } from '../helpers';
import DropdownSelect from './dropdown-select';

const InsertViewDialog = ({ className, editor, element = {}, slateNode, insertPosition, closeDialog }) => {
  const { data = {} } = element;
  const { t } = useTranslation('sdoc-editor');
  const [isLoading, setIsLoading] = useState(true);
  const [viewName, setViewName] = useState('');
  const [currentTypeOption, setCurrentTypeOption] = useState(null);
  const [currentRepoOption, setCurrentRepoOption] = useState(null);

  const [viewNameErrorMessage, setViewNameErrorMessage] = useState('');
  const [typeErrorMessage, setTypeErrorMessage] = useState('');
  const [repoErrorMessage, setRepoErrorMessage] = useState('');
  const [repoOptions, setRepoOptions] = useState([]);

  const TYPE_OPERATIONS = useMemo(() => {
    return [
      { id: 'table', name: 'table', value: 'table', label: 'table' },
    ];
  }, []);

  useEffect(() => {
    const { data = {} } = element;
    setViewName(data.view_name);

    const typeOption = TYPE_OPERATIONS.find(item => item.value === data.view_type) || null;
    setCurrentTypeOption(typeOption);

    const wikiSettings = getWikiSettings();
    const accessibleRepos = getAccessibleRepos();
    const { linked_repos: linkedRepoIds } = wikiSettings;

    const repoList = accessibleRepos.map(item => {
      item.sharePermission = 'rw';
      return item;
    });

    const options = repoList.map(item => {
      return {
        id: item.repo_id,
        name: item.repo_name,
        value: item.repo_name,
        label: item.repo_name,
        permission: item.permission,
      };
    });

    const optionsMap = options.reduce((result, item) => {
      result[item.id] = item;
      return result;
    }, {});

    const repoOptions = linkedRepoIds.map(id => optionsMap[id]).filter(Boolean);

    setRepoOptions(repoOptions);
    setCurrentRepoOption(repoOptions.find(item => item.id === data.linked_repo_id));
    setIsLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const submit = useCallback(() => {
    setViewNameErrorMessage('');
    setTypeErrorMessage('');
    setRepoErrorMessage('');

    if (!viewName) {
      setViewNameErrorMessage(t('The_view_name_is_required'));
      return;
    }

    if (!currentTypeOption) {
      setTypeErrorMessage(t('The_view_type_is_required'));
      return;
    }

    if (!currentRepoOption) {
      setRepoErrorMessage(t('The_linked_library_is_required'));
      return;
    }

    const viewType = currentTypeOption.value;
    const linkedRepoId = currentRepoOption.id;
    let data = {
      view_name: viewName,
      view_type: viewType,
      link_repo_id: linkedRepoId,
    };
    context.insertWikiView(data).then(res => {
      const { view } = res.data;
      const viewData = { ...data, view_id: view._id };
      insertFileView(viewData, editor, insertPosition, slateNode);
      closeDialog();
    }).catch(error => {
      const errorMessage = getErrorMsg(error);
      toaster.danger(errorMessage);
    });
  }, [viewName, currentTypeOption, currentRepoOption, t, editor, insertPosition, slateNode, closeDialog]);

  const onKeyDown = useCallback((event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      submit();
      return;
    }
  }, [submit]);

  const onValueChanged = useCallback((event) => {
    const value = event.target.value;
    if (value === viewName) return;

    setViewName(value);
    setViewNameErrorMessage('');
  }, [viewName]);

  const onSelectTypeOption = useCallback((option) => {
    setCurrentTypeOption(option);
    setTypeErrorMessage('');
  }, []);

  const onSelectTableOption = useCallback((option) => {
    setCurrentRepoOption(option);
    setRepoErrorMessage('');
  }, []);

  const close = useMemo(() => {
    return (
      <span className="sdoc-add-link-close-icon" onClick={closeDialog}>
        <i className="sdocfont sdoc-sm-close" aria-hidden="true"></i>
      </span>
    );
  }, [closeDialog]);

  return (
    <Modal isOpen={true} autoFocus={false} toggle={closeDialog} className={className} zIndex={1071} returnFocusAfterClose={false}>
      <ModalHeader close={close}>{t('Insert_file_view')}</ModalHeader>
      <ModalBody>
        {isLoading && <Loading />}
        {!isLoading && repoOptions.length === 0 && (
          <div className=''>{t('Linked_repo_tip')}</div>
        )}
        {!isLoading && repoOptions.length !== 0 && (
          <>
            <div className="form-group">
              <Label for="addTitle">{t('View_name')}</Label>
              <input
                onKeyDown={onKeyDown}
                type="text"
                className="form-control"
                id="addTitle"
                value={data.view_name}
                onChange={onValueChanged}
              />
              {viewNameErrorMessage && <Alert color="danger" className="mt-2">{t(viewNameErrorMessage)}</Alert>}
            </div>
            <div className="form-group">
              <Label>{t('View_type')}</Label>
              <DropdownSelect
                selectedOption={currentTypeOption}
                options={TYPE_OPERATIONS}
                onSelectOption={onSelectTypeOption}
                isInModal={true}
              />
              {typeErrorMessage && <Alert color="danger" className="mt-2">{t(typeErrorMessage)}</Alert>}
            </div>
            <div className="form-group">
              <Label>{t('Linked_library')}</Label>
              <DropdownSelect
                hasIcon={true}
                selectedOption={currentRepoOption}
                options={repoOptions}
                onSelectOption={onSelectTableOption}
                isInModal={true}
              />
              {repoErrorMessage && <Alert color="danger" className="mt-2">{t(repoErrorMessage)}</Alert>}
            </div>
          </>
        )}
      </ModalBody>
      {!isLoading && repoOptions.length !== 0 && (
        <ModalFooter>
          <Button color="secondary" onClick={closeDialog}>{t('Cancel')}</Button>
          <Button color="primary" disabled={false} onClick={submit}>{t('Submit')}</Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

InsertViewDialog.propTypes = {
  editor: PropTypes.object.isRequired,
  className: PropTypes.string,
  slateNode: PropTypes.object
};

export default InsertViewDialog;
