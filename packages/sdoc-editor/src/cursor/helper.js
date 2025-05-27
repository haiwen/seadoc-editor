import randomColor from 'randomcolor';

// selection: { anchor, focus }
// cursor: { anchor, focus }

export const setCursor = (editor, user, location, cursorData) => {
  const { username: clientId } = user;

  if (!editor.cursors) editor.cursors = {};

  if (location) {

    const oldCursor = editor.cursors[clientId] ? editor.cursors[clientId] : {};
    const newCursorData = { ...oldCursor, ...location, ...cursorData };
    editor.cursors[clientId] = newCursorData;
  } else {
    delete editor.cursors[clientId];
  }

  editor.cursors = { ...editor.cursors };
  return editor;
};

export const deleteCursor = (editor, username) => {
  delete editor.cursors[username];
  editor.cursors = { ...editor.cursors };
  return editor;
};

export const generateCursorData = (config) => {
  const { user } = config;
  const options = {
    luminosity: 'dark',
    format: 'rgba',
    alpha: 1
  };

  const color = randomColor(options);
  return {
    name: user.name,
    cursor_color: color,
  };
};
