import slugid from 'slugid';
import LocalStorage from '../../../utils/local-storage-utils';
import { CODE_BLOCK, CODE_LINE, RECENT_COPY_CONTENT } from '../../constants';
import { getSelectedNodeByType } from '../../core';
import { deserializeHtml } from './helper';

const withHtml = (editor) => {
  const { insertData } = editor;
  const newEditor = editor;

  newEditor.insertData = (data) => {
    if (!newEditor.insertFragmentData(data)) {
      // Other document paste content into code block
      if (!data.types.includes('text/code-block') && getSelectedNodeByType(editor, CODE_BLOCK)) {
        const plaintext = data.getData('text/plain') || '';
        if (plaintext) {
          let fragmentData = [];
          plaintext.split('\n').forEach((item) => {
            const codeLine = {
              id: slugid.nice(),
              type: CODE_LINE,
              children: [{ text: item, id: slugid.nice() }],
            };
            fragmentData.push(codeLine);
          });
          newEditor.insertFragment(fragmentData);
        }
        return;
      }

      const htmlContent = data.getData('text/html') || '';
      if (htmlContent) {
        const content = deserializeHtml(htmlContent);
        LocalStorage.setItem(RECENT_COPY_CONTENT, htmlContent);
        editor.insertFragment(content);
        return;
      }

      LocalStorage.setItem(RECENT_COPY_CONTENT, data);
      insertData(data);
    }
  };

  return newEditor;

};

export default withHtml;
