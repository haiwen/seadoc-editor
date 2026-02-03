import React from 'react';
import { withTranslation } from 'react-i18next';
import { SDocViewer, Loading, isMobile, context } from '@seafile/sdoc-editor';
import PropTypes from 'prop-types';
import ErrorBoundary from '../components/error-boundary';
import Layout, { Header, Content } from '../layout';

import '../assets/css/simple-viewer.css';

const propTypes = {
  t: PropTypes.func
};

class SimpleViewer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isContextInit: false,
      errorMessage: null,
      document: null,
    };

    this.config = null;
  }

  async componentDidMount() {
    context.initApi();
    try {
      const contentRes = await context.getFileContent();
      let result = contentRes.data || null;
      this.setState({
        isContextInit: true,
        document: result,
      });
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
      this.setState({
        isContextInit: true,
        errorMessage: 'Load_doc_content_error',
        document: null,
      });
    }
  }

  render() {
    const { isContextInit, errorMessage, document } = this.state;
    const { t } = this.props;

    if (!isContextInit) {
      return <Loading />;
    }

    if (errorMessage) {
      return <div className='d-flex justify-content-center'>{t(errorMessage)}</div>;
    }

    const { docName, sharePermissionText, downloadURL } = context.getSettings();
    const sdocViewProps = {
      document: document,
      showToolbar: isMobile ? false : true,
      showOutline: isMobile ? false : true,
      showComment: false,
      mathJaxSource: this.props.mathJaxSource,
      enableMathJax: true,
    };

    return (
      <ErrorBoundary>
        <Layout>
          <Header>
            <div className="doc-info">
              <h2 className="doc-name my-0">{docName}</h2>
              {sharePermissionText && <span className="sdoc-share-permission ml-2">{sharePermissionText}</span>}
            </div>
            <div className="doc-ops">
              {downloadURL && <a href={downloadURL} className="op-item"><i className="sdocfont sdoc-download"></i></a>}
            </div>
          </Header>
          <Content>
            <SDocViewer {...sdocViewProps} />
          </Content>
        </Layout>
      </ErrorBoundary>
    );
  }
}

SimpleViewer.propTypes = propTypes;

export default withTranslation('sdoc-editor')(SimpleViewer);
