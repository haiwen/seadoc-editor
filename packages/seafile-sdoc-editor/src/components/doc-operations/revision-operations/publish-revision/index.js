import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';

const PublishRevision = ({ publishRevision }) => {
  const { t } = useTranslation('sdoc-editor');

  const onPublishRevision = useCallback((event) => {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    publishRevision();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Button color="success" onClick={onPublishRevision} className="ml-4">{t('Publish')}</Button>
  );
};

PublishRevision.propTypes = {
  publishRevision: PropTypes.func.isRequired,
};

export default PublishRevision;
