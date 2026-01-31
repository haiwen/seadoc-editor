
import { FORMULA } from '../../constants/element-type';
import FormulaMenu from './menu';
import withFormula from './plugin';
import renderFormula from './render-element';

const FormulaPlugin = {
  type: FORMULA,
  nodeType: 'element',
  editorMenus: [FormulaMenu],
  editorPlugin: withFormula,
  renderElements: [renderFormula],
};

export default FormulaPlugin;
