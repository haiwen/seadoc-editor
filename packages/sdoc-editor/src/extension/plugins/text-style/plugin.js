import { TEXT_STYLE_MAP } from '../../constants';
import { getValue, isMenuDisabled, addMark, removeMark } from './helpers';

const withTextStyle = (editor) => {

  const toggleTextStyle = (type) => {
    const isDisabled = isMenuDisabled(editor);
    if (isDisabled) {
      return false;
    }

    const isActive = !!getValue(editor, type);
    if (isActive) {
      removeMark(editor, type);
    } else {
      addMark(editor, type);
    }
  };

  editor.toggleTextBold = () => {
    toggleTextStyle(TEXT_STYLE_MAP.BOLD);
  };

  editor.toggleTextItalic = () => {
    toggleTextStyle(TEXT_STYLE_MAP.ITALIC);
  };

  return editor;
};

export default withTextStyle;
