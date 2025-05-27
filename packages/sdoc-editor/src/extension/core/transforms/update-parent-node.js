import { Transforms } from '@seafile/slate';
import { REBASE_MARK_KEY } from '../../../constants';
import { ELEMENT_TYPE } from '../../constants';
import { getNode } from '../queries';

export const updateRebaseParentNodeByPath = (editor, path) => {
  const parentPath = path.slice(0, -1);
  const parentNode = getNode(editor, parentPath);
  if (![ELEMENT_TYPE.ORDERED_LIST, ELEMENT_TYPE.UNORDERED_LIST].includes(parentNode.type)) return;
  const newParentElement = { ...parentNode };
  newParentElement[REBASE_MARK_KEY.REBASE_TYPE] && delete newParentElement[REBASE_MARK_KEY.REBASE_TYPE];
  newParentElement[REBASE_MARK_KEY.OLD_ELEMENT] && delete newParentElement[REBASE_MARK_KEY.OLD_ELEMENT];
  newParentElement[REBASE_MARK_KEY.ORIGIN] && delete newParentElement[REBASE_MARK_KEY.ORIGIN];
  newParentElement['children'] = newParentElement['children'].map(item => {
    item[REBASE_MARK_KEY.REBASE_TYPE] && delete item[REBASE_MARK_KEY.REBASE_TYPE];
    item[REBASE_MARK_KEY.OLD_ELEMENT] && delete item[REBASE_MARK_KEY.OLD_ELEMENT];
    item[REBASE_MARK_KEY.ORIGIN] && delete item[REBASE_MARK_KEY.ORIGIN];
    return item;
  });
  Transforms.removeNodes(editor, { at: parentPath });

  Transforms.insertNodes(editor, newParentElement, {
    at: parentPath
  });
};
