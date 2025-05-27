import { scaleFontSize } from './helpers';


const withFont = (editor) => {
  const newEditor = editor;

  newEditor.increaseFontSize = () => {
    scaleFontSize(newEditor, 'increase');
  };

  newEditor.reduceFontSize = () => {
    scaleFontSize(newEditor, 'reduce');
  };

  return newEditor;
};

export default withFont;
