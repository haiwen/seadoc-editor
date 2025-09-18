import { commentContainerWikiTransfer } from '../comment/helper';
import { WIKI_EDITOR } from '../constants';
import { useScrollContext } from './use-scroll-context';

export const useCommentListPosition = (selectedElementIds, isContextComment, isClickedContextComment, commentedDom, commentDetail, closeComment, editor) => {
  const headerHeight = 100;
  const scrollRef = useScrollContext();
  const { scrollTop = 0 } = scrollRef.current || {};
  if (isContextComment || isClickedContextComment) {
    let rect;
    if (isContextComment) {
      const commentedDomId = commentedDom.getAttribute('data-id');
      rect = document.querySelector(`[data-id="${commentedDomId}"]`)?.getBoundingClientRect();
    }

    // rect is the last commented context dom
    if (isClickedContextComment) {
      const lastComment = Object.values(commentDetail)
        .map(item => item.detail?.text_comment_id)
        .flatMap(id => {
          const elements = Array.from(document.querySelectorAll(`.sdoc_comment_${id}`));
          return elements.map(el => ({ id, el }));
        })
        .reduce((last, current) => {
          if (!last) return current;
          const position = last.el.compareDocumentPosition(current.el);
          return (position & Node.DOCUMENT_POSITION_FOLLOWING) ? current : last;
        }, null);

      if (lastComment) {
        const result = `.sdoc_comment_${lastComment.id}`;
        const elements = Array.from(document.querySelectorAll(result));
        if (elements.length === 0) return;
        const lastTextElement = elements[elements.length - 1];
        const parentElement = lastTextElement.closest('[data-slate-node="element"]');
        const firstInSameParent = elements.find(el => parentElement.contains(el));
        rect = firstInSameParent?.getBoundingClientRect();
      } else {
        closeComment();
      }
    }

    const editorArticleRight = document.getElementById('sdoc-editor-print-wrapper').getBoundingClientRect().right;
    let topPara;
    topPara = rect.bottom - headerHeight + 10 + scrollTop;

    if (editor.editorType === WIKI_EDITOR) {
      // 55 is basic top title height in wiki
      topPara = commentContainerWikiTransfer(topPara, 55);
    }
    const rightPara = editorArticleRight - rect.left - 300; // 300 is comment container's width
    return {
      right: rightPara,
      y: topPara,
    };
  }

  const selectionPosition = document.querySelectorAll(`[data-id="${selectedElementIds[0]}"]`)[0]?.getBoundingClientRect();
  // Boundary check
  if (!selectionPosition) closeComment();

  if (selectionPosition && selectionPosition.y !== 0) {
    selectionPosition.y = selectionPosition.y - headerHeight + scrollTop;
    if (editor.editorType === WIKI_EDITOR) {
      // 47 is top nav bar height in wiki
      selectionPosition.y = commentContainerWikiTransfer(selectionPosition.y, 47);
    }
  }

  return {
    x: selectionPosition?.x,
    y: selectionPosition?.y,
  };
};
