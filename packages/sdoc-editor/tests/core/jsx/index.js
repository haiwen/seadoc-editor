import { createHyperscript, createText as createTestText } from '@seafile/slate-hyperscript';
import { ELEMENTS } from '../constants';

export const jsx = createHyperscript({
  elements: ELEMENTS,
  creators: {
    htext: createTestText
  }
});
