import { isListNested } from '../queries';
import { movedListItemUp } from './move-list-item-up';

export const removeFirstListItem = (editor, { list, listItem }) => {
  const [, listPath] = list;
  if (!isListNested(editor, listPath)) {
    movedListItemUp(editor, { list, listItem });
    return true;
  }
  return false;
};
