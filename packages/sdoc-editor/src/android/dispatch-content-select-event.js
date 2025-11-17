import { MULTI_COLUMN } from '../extension/constants';
import { getNode, getTopLevelBlockNode } from '../extension/core';
import { ACTION_TYPES } from './constants';
import jsBridge from './js-bridge';

export const dispatchContentSelectEvent = (editor) => {
  const topBlockEntry = getTopLevelBlockNode(editor);
  if (!topBlockEntry) return;
  const topNode = topBlockEntry[0];
  let topType = topNode.type;
  if (topType === MULTI_COLUMN) {
    const selection = editor.selection;
    const currentNodeInColumn = getNode(editor, selection.anchor.path.slice(0, 3));
    topType = currentNodeInColumn.type;
  }
  // content select
  const selectData = {
    v: 2,
    action: ACTION_TYPES.EDITOR_CONTENT_SELECT,
    data: JSON.stringify({
      type: topType,
    })
  };
  jsBridge.callAndroidFunction(JSON.stringify(selectData));

  // op execute
  const opData = {
    v: 2,
    action: ACTION_TYPES.EDITOR_OPERATION_EXECUTE,
    data: JSON.stringify({
      type: 'op-execute'
    })
  };
  jsBridge.callAndroidFunction(JSON.stringify(opData));
};
