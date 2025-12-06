import { useEffect, useState } from 'react';
import { Editor, Point } from '@seafile/slate';

export const useCursors = (editor) => {
  const [cursors, setCursors] = useState([]);

  useEffect(() => {
    const cursors = Object.values(editor.cursors) || [];
    // Initially collapse the selections from all collaborators to  start point
    const newCursors = cursors.map(cursor => {
      if (!Point.equals(cursor.anchor, cursor.focus)) {
        const frontPoint = Editor.start(editor, { anchor: cursor.anchor, focus: cursor.focus });
        return { ...cursor, anchor: frontPoint, focus: frontPoint };
      }
      return cursor;
    });
    setCursors(newCursors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    editor.onCursor = (editorCursors) => {
      const cursors = Object.values(editorCursors) || [];
      setCursors(cursors);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    cursors,
    setCursors,
  };

};
