import deserializeHtml from './html-to-slate';
import processor from './md-to-html';
import mdStringToSlate from './md-to-slate';
import slateToMdString from './slate-to-md';

export {
  mdStringToSlate,
  slateToMdString,
  processor, // md string to html
  deserializeHtml, // html -> slate notes
};
