import { Node } from '@seafile/slate';

export const commentDecorate = (editor) => ([node, path]) => {
  const decorations = [];
  const comments = editor.element_comments_map?.[node.id] || [];
  const unresolvedComments = comments && comments.filter(item => !item?.resolved);
  for (const comment of unresolvedComments) {
    if (comment.detail.element_id) {
      const commentedContextId = comment.detail.text_comment_id;
      // rgba prevents occlusion of the cursor
      decorations.push({
        anchor: { path, offset: 0 },
        focus: {
          path: path,
          offset: Node.string(node).length
        },
        [`sdoc_comment_${commentedContextId}`]: true,
      });
    }
  }
  return decorations;
};
