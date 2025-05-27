import { Editor, Element, Node, Text, Transforms } from '@seafile/slate';
import { ReactEditor } from '@seafile/slate-react';
import { CODE_BLOCK, IMAGE } from '../../constants';
import { DEFAULT_SEARCH_HIGHLIGHT_FILL_COLOR, FOCUSSED_SEARCH_HIGHLIGHT_FILL_COLOR } from './constant';

// Check the node iff contains text or inline node
const isInlineContainer = (editor, node) => {
  if (Text.isText(node)) return false;
  if (node.children) {
    return node.children.every(child => Text.isText(child) || Editor.isInline(editor, child));
  }
  return false;
};

const formatTextEntries = (textEntries) => {
  return textEntries.reduce((pre, cur) => {
    const currentLength = cur[0].text.length;
    const previousLength = pre[pre.length - 1]?.passedLength ?? 0;
    const currentItem = { passedLength: previousLength + currentLength, textEntry: [...cur] };
    return pre.concat(currentItem);
  }, []);
};

const splitTextNode = (node) => {
  return node.children.reduce((pre, cur) => {
    if (cur.type === IMAGE) {
      pre.push({ ...node, children: [] });
    } else {
      pre[pre.length - 1].children.push(cur);
    }
    return pre;
  }, [{ ...node, children: [] }]);
};

const matchSearchWordPosition = (node, searchWord) => {
  const content = Node.string(node);
  const regex = new RegExp(searchWord, 'gi');

  const matches = [...content.matchAll(regex)];
  return matches.map(match => match.index) || [];
};

const getMatchedTextInfos = (editor, node, keyword) => {
  const matchedTextNodeEntires = [];
  if (node.children) {
    // If node is text container, match keyword in text
    if (isInlineContainer(editor, node)) {
      const splitNodes = splitTextNode(node);
      splitNodes.forEach(node => {
        const textEntries = Array.from(Node.texts(node));
        if (!textEntries) return;
        const newTextEntries = formatTextEntries(textEntries);
        const positions = matchSearchWordPosition(node, keyword);
        const res = positions.reduce((pre, position) => {
          const { ranges, startMatchIndex } = pre;
          let anchor;
          for (let index = startMatchIndex; index < newTextEntries.length; index++) {
            const { passedLength, textEntry } = newTextEntries[index];
            const passedNodeLength = passedLength - textEntry[0].text.length;
            if (!anchor && passedLength > position) {
              anchor = { path: ReactEditor.findPath(editor, textEntry[0]), offset: position - passedNodeLength };
            }
            if (passedLength >= position + keyword.length) {
              const range = {
                anchor,
                focus: { path: ReactEditor.findPath(editor, textEntry[0]), offset: position + keyword.length - passedNodeLength },
              };
              return { ranges: [...ranges, range], startMatchIndex: index };
            }
          }
          return pre;
        }, { ranges: [], startMatchIndex: 0 });
        matchedTextNodeEntires.push(res.ranges);
      });
    }
  }
  return matchedTextNodeEntires;
};

const generateRangeWhenWrapLine = (editor, path, index, count, domRange, baseHeight) => {
  let i = 0;
  let j = 1;
  let isOverrideForwardRange = true;
  const subHighlightInfos = [];
  while (j <= count) {
    const subSplitRange = {
      anchor: { path, offset: index + i, },
      focus: { path, offset: index + j, }
    };
    const subRange = ReactEditor.toDOMRange(editor, subSplitRange);
    const subRangeHeight = Math.round(subRange.getBoundingClientRect().height);
    if (subRangeHeight === baseHeight) {
      isOverrideForwardRange && subHighlightInfos.pop();
      if (!isOverrideForwardRange) isOverrideForwardRange = true;
      subHighlightInfos.push({
        rangeInfo: subRange.getBoundingClientRect(),
        domRange
      });
      j++;
    } else {
      i = j - 1;
      isOverrideForwardRange = false;
    }
  }
  return subHighlightInfos;
};

const findHighlightTextInfos = (editor, keyword) => {
  const matchedBlockEntries = [...Editor.nodes(editor, {
    match: n => {
      if (Element.isElement(n) && Editor.isBlock(editor, n)) {
        try {
          const blockString = Node.string(n);
          return blockString.toLowerCase().includes(keyword.toLowerCase());
        } catch (error) {
          return false;
        }
      }
    },
    mode: 'lowest',
    at: [],
  })];
  const matchedTextEntriesList = Array.from(matchedBlockEntries)
    .reduce((pre, [node]) => [...pre, ...getMatchedTextInfos(editor, node, keyword.toLowerCase())], [])
    .flat();
  return matchedTextEntriesList;
};

const getBaseHeight = (editor, range) => {
  const { anchor: { path } } = range;
  const subRange = {
    anchor: { path, offset: 0, },
    focus: { path, offset: 1, }
  };
  const letterHeight = ReactEditor.toDOMRange(editor, subRange).getBoundingClientRect().height;
  const baseHeight = Math.round(letterHeight);
  return baseHeight;
};

export const getHighlightInfos = (editor, keyword) => {
  if (keyword === '') return [];
  const highlightTextInfos = findHighlightTextInfos(editor, keyword);
  const rangeList = highlightTextInfos?.map((range) => {
    const domRange = ReactEditor.toDOMRange(editor, range);
    const rangeInfo = domRange.getBoundingClientRect();
    const baseHeight = getBaseHeight(editor, range);
    // highlight word wrap line, assume line height is more then letter height
    // Windows systems may have precision issues. truncate decimal to avoid this problem
    const currentRangeHeight = Math.round(rangeInfo.height);
    if (currentRangeHeight > baseHeight) return generateRangeWhenWrapLine(editor, range.anchor.path, range.anchor.offset, keyword.length, domRange, baseHeight);
    return [{ rangeInfo, domRange }];
  });
  return rangeList;
};

export const handleReplaceKeyword = (editor, highlightInfos, replacedContent) => {
  if (!highlightInfos || !highlightInfos.length) return;
  // Delete from backward avoiding the range changed
  highlightInfos.reverse().forEach((highlightInfo) => {
    const { domRange } = highlightInfo[highlightInfo.length - 1];
    const slateRange = ReactEditor.toSlateRange(editor, domRange, { exactMatch: true });
    Transforms.insertText(editor, replacedContent, { at: Editor.end(editor, slateRange) });
    Transforms.delete(editor, { at: slateRange });
  });
};

export const clearCanvas = (canvases) => {
  canvases.forEach(canvas => canvas
    .getContext('2d')
    .clearRect(0, 0, canvas.width, canvas.height)
  );
};


export const scrollIntoView = (articleContainerTop, highlightX, highlightY, codeBlockDom, width) => {
  if (!articleContainerTop) return;
  const scrollContainer = document.getElementById('sdoc-scroll-container');
  // Scroll into view when highlight block overflow y
  const scrollTop = highlightY - articleContainerTop - 20;
  const isOverflowY = scrollContainer.scrollTop > scrollTop || scrollContainer.scrollTop + scrollContainer.clientHeight < scrollTop;
  isOverflowY && scrollContainer.scrollTo({ top: scrollTop });
  // Scroll into view when code block overflow x
  if (codeBlockDom) {
    let isOverflowX = false;
    const codeBlockDomLeft = codeBlockDom.getBoundingClientRect().left;
    const leftDistance = codeBlockDomLeft + 50;
    const rightDistance = leftDistance + codeBlockDom.clientWidth - 50;
    isOverflowX = leftDistance > highlightX + width || rightDistance < highlightX + width;
    isOverflowX && codeBlockDom.scrollTo({ left: highlightX - leftDistance + width });
  }
};

const getNowrapCodeBlockInfos = (editor) => {
  const codeBlockEntries = Editor.nodes(editor, {
    match: n => {
      const isCodeBlock = Element.isElement(n) && n.type === CODE_BLOCK;
      if (!isCodeBlock) return false;
      // To compatible with old version,which has no style property with white_space, by default, it is 'nowrap'
      const nodeWhiteSpace = n?.style?.['white_space'] || 'nowrap';
      if (nodeWhiteSpace === 'nowrap') return true;
      return false;
    },
    at: []
  }) || [];

  // Get code block dom and range info
  const codeBlockInfos = Array.from(codeBlockEntries)
    .map(([codeBlockNode]) => {
      const codeBlockRange = ReactEditor.toDOMNode(editor, codeBlockNode).getBoundingClientRect();
      return { codeBlockRange, codeBlockNode };
    });

  return codeBlockInfos;
};

// Hide highlight block when overflow article container
const updateInfoAsMatchedInCodeBlock = (editor, codeBlockInfos, highlightX, highlightY, highlightHeight, highlightWidth) => {
  if (!codeBlockInfos.length) return;

  let codeBlockDom = null;

  codeBlockInfos.some(({ codeBlockRange, codeBlockNode }) => {
    const isInCodeBlockArea = codeBlockRange.y <= highlightY && codeBlockRange.y + codeBlockRange.height > highlightY + highlightHeight;
    if (isInCodeBlockArea) {
      codeBlockDom = ReactEditor.toDOMNode(editor, codeBlockNode).querySelector('.sdoc-code-block-pre');
      const codeBlockRightSidePosition = codeBlockRange.x + codeBlockRange.width;
      const isOverflowX = codeBlockRange.x > highlightX || codeBlockRightSidePosition < highlightX + highlightWidth;
      if (isOverflowX) {
        // Calculate forward and backward hidden width
        const overflowForward = codeBlockRange.x - highlightX > 0 ? codeBlockRange.x - highlightX : 0;
        const overflowBackward = highlightX + highlightWidth - codeBlockRightSidePosition > 0 ? highlightX + highlightWidth - codeBlockRightSidePosition : 0;
        highlightWidth = highlightWidth - overflowForward - overflowBackward;
      }
      if (highlightWidth < 0) highlightWidth = 0;
      if (highlightX < codeBlockRange.x) highlightX = codeBlockRange.x;
      return true;
    }
    return false;
  });
  return { codeBlockDom, highlightX, highlightWidth };
};

export const drawHighlights = (editor, ranges, selectIndex, isMoveIntoView = false) => {
  const canvases = document.querySelectorAll('.sdoc-find-search-highlight-canvas');
  clearCanvas(canvases);
  if (ranges.length === 0) return;
  const articleContainer = document.querySelector('.sdoc-article-container');
  const { top, left } = articleContainer.getBoundingClientRect();
  let rangeIndex = 0;
  let splitRangeIndex = 0;
  let canvasIndex = 0;
  const codeBlockInfos = getNowrapCodeBlockInfos(editor);

  do {
    let canvas = canvases[canvasIndex];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const splitRanges = ranges[rangeIndex];
    for (let j = splitRangeIndex; j < splitRanges.length; j++) {
      const isFocussedHighlight = rangeIndex === selectIndex;
      let { x, y, width, height } = splitRanges[j].rangeInfo;
      let codeBlockDom = null;

      if (y - top < (canvasIndex + 1) * 5000) {

        // Hide highlight block when overflow article container
        const updateInfo = updateInfoAsMatchedInCodeBlock(editor, codeBlockInfos, x, y, height, width);
        if (updateInfo) {
          x = updateInfo.highlightX;
          width = updateInfo.highlightWidth;
          if (isFocussedHighlight) codeBlockDom = updateInfo.codeBlockDom;
        }

        // Draw highlight block
        ctx.fillStyle = isFocussedHighlight ? FOCUSSED_SEARCH_HIGHLIGHT_FILL_COLOR : DEFAULT_SEARCH_HIGHLIGHT_FILL_COLOR;
        ctx.fillRect(x - left, y - top - (canvasIndex * 5000), width, height);

        // Scroll into view
        isMoveIntoView && isFocussedHighlight && scrollIntoView(top, x, y, codeBlockDom, width);

        if (j === splitRanges.length - 1) rangeIndex++;
        splitRangeIndex = 0;

      } else {
        splitRangeIndex = j;
        canvasIndex = Math.ceil((y - top) / 5000 - 1);
      }

    }

  } while (rangeIndex < ranges.length);

};
