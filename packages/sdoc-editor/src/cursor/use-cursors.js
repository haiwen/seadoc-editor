import { useEffect, useState } from 'react';

export const useCursors = (editor) => {
  const [cursors, setCursors] = useState([]);

  useEffect(() => {
    const cursors = Object.values(editor.cursors) || [];
    setCursors(cursors);
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
