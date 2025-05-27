import { commentDecorate } from '../comment/comment-decorate';
import { highlightDecorate } from '../highlight';
import useSelectionUpdate from '../hooks/use-selection-update';

const pluginDecorates = [
  highlightDecorate,
  commentDecorate
];

export const usePipDecorate = (editor) => {

  useSelectionUpdate();

  const decorates = pluginDecorates.map(decorate => {
    return decorate(editor);
  });

  return (entry) => {
    let ranges = [];

    const addRanges = (newRanges) => {
      if (newRanges?.length) ranges = [...ranges, ...newRanges];
    };

    decorates.forEach((decorate) => {
      addRanges(decorate(entry));
    });

    return ranges;
  };
};
