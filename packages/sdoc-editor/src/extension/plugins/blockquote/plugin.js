import { Editor, Element, Transforms, Node, Path, Range } from '@seafile/slate';
import { BLOCKQUOTE, PARAGRAPH, CODE_BLOCK, TABLE, HEADER1, HEADER2, HEADER3, HEADER4, HEADER5, HEADER6, TITLE, SUBTITLE } from '../../constants';
import { generateDefaultText, getSelectedNodeByType, getSelectedNodeEntryByType, isSelectionAtBlockStart, isContainsVoidElement, isMiddlePoint } from '../../core';
import { getFormattedElements, getFormattedRestElements } from './helpers';

const withBlockquote = (editor) => {
  const { insertBreak, deleteBackward, insertFragment } = editor;
  const newEditor = editor;

  newEditor.insertBreak = () => {
    const { selection } = editor;
    if (selection == null) return insertBreak();

    const [quoteBlockEntry] = Editor.nodes(editor, {
      match: n => Element.isElement(n) && n.type === BLOCKQUOTE,
      universal: true,
    });
    if (!quoteBlockEntry) return insertBreak();

    const [currentLineEntry] = Editor.nodes(newEditor, {
      match: n => Element.isElement(n) && [PARAGRAPH, HEADER1, HEADER2, HEADER3, HEADER4, HEADER5, HEADER6, TITLE, SUBTITLE].includes(n.type),
      mode: 'lowest',
    });

    // Exit blockquote when current line is empty
    const isAtBlockquoteEnd = currentLineEntry[1].slice(-1)[0] === quoteBlockEntry[0].children.length - 1;
    if (isAtBlockquoteEnd) {
      const isEmptyLine = !(currentLineEntry && Editor.string(newEditor, currentLineEntry[1]).length) && !isContainsVoidElement(currentLineEntry[0]);
      if (isEmptyLine) {
        const nextPath = Path.next(quoteBlockEntry[1]);
        Transforms.moveNodes(newEditor, {
          at: currentLineEntry[1],
          to: nextPath,
        });
        return;
      }
    }

    // const isMiddleIn
    if (Range.isCollapsed(selection)) {
      const isMiddleIn = isMiddlePoint(editor, selection.anchor, currentLineEntry[1]);
      if (isMiddleIn) {
        insertBreak();
        return;
      }
    }

    // Insert new line
    Transforms.insertNodes(
      editor,
      { type: PARAGRAPH, children: [generateDefaultText()] },
      { at: newEditor.selection, select: true }
    );
  };

  newEditor.deleteBackward = (unit) => {
    const { selection } = newEditor;
    if (selection === null) {
      deleteBackward(unit);
      return;
    }

    const blockQuoteEntry = getSelectedNodeEntryByType(editor, BLOCKQUOTE);
    if (blockQuoteEntry) {
      const [, blockQuotePath] = blockQuoteEntry;
      const [currentLineEntry] = Editor.nodes(newEditor, {
        match: (n, p) => Element.isElement(n)
          && p.length === blockQuotePath.length + 1
          && n.type === PARAGRAPH,
      });
      if (!currentLineEntry) return deleteBackward(unit);
      const [, currentLinePath] = currentLineEntry;
      const currentLineIndex = currentLinePath[blockQuotePath.length];
      // Transforms to paragraph when Select at the beginning of the first line
      if (currentLineIndex === 0 && isSelectionAtBlockStart(editor, { at: currentLinePath })) {
        Transforms.liftNodes(editor, { at: currentLinePath });
        return;
      }

    }
    deleteBackward(unit);
  };

  newEditor.insertFragment = (data) => {
    // Paste into quote block
    if (getSelectedNodeByType(newEditor, BLOCKQUOTE)) {
      const lastIndex = data.findLastIndex((item) => [CODE_BLOCK, TABLE].includes(item?.type));
      let elements = getFormattedElements(data.slice(0, lastIndex + 1));
      let restElements = getFormattedRestElements(data.slice(lastIndex + 1));
      const path = Editor.path(newEditor, newEditor.selection);
      // Insert elements of quote block
      if (restElements.length !== 0) {
        if (Range.isCollapsed(editor.selection)) {
          const paragraphEntry = getSelectedNodeEntryByType(newEditor, PARAGRAPH);
          if (paragraphEntry) {
            const parentNodeEntry = Editor.parent(editor, paragraphEntry[1]);
            if (parentNodeEntry && parentNodeEntry[0].type === BLOCKQUOTE) {
              if (!Node.string(paragraphEntry[0]).length) {
                insertFragment(restElements);
                return;
              }
            }
          }
        }

        // Insert text when inserting a single line paragraph
        if (restElements.length === 1 && restElements[0].type === PARAGRAPH) {
          const string = Node.string(restElements[0]);
          Editor.insertText(newEditor, string);
        } else {
          Transforms.insertNodes(newEditor, restElements, { at: [path[0], path[1] + 1] });
        }
      }

      // Insert elements above the quoted block
      if (elements.length !== 0) {
        Transforms.insertNodes(newEditor, elements, { at: [path[0]] });
      }

      return;
    }
    return insertFragment(data);
  };

  return newEditor;
};

export default withBlockquote;
