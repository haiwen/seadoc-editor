import { useMemo } from 'react';
import { Editor, Element } from '@seafile/slate';

export const useSelectionElement = ({ editor }) => {

  const nodeEntry = useMemo(() => {
    const nodeEntry = Editor.above(editor, {
      mode: 'lowest',
      match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    });
    return nodeEntry;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.selection]);

  if (nodeEntry && nodeEntry[0]) {
    return nodeEntry[0];
  }

  return null;
};

