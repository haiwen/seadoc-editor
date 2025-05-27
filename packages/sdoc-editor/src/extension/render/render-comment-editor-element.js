import { useReadOnly, useSlateStatic } from '@seafile/slate-react';
import { LINK, LIST_ITEM, ORDERED_LIST, PARAGRAPH, UNORDERED_LIST, IMAGE, IMAGE_BLOCK, VIDEO, MENTION, MENTION_TEMP, BLOCKQUOTE } from '../constants';
import { getParentNode } from '../core';
import { LinkPlugin, ListPlugin, ImagePlugin, VideoPlugin, ParagraphPlugin, MentionPlugin, BlockquotePlugin } from '../plugins';

const RenderCommentEditorCustomRenderElement = (props) => {
  const editor = useSlateStatic();
  const readonly = useReadOnly();
  const { element, commentType } = props;

  switch (element.type) {
    case PARAGRAPH: {
      const parentNode = getParentNode(editor.children, element.id);
      const _props = { ...props, className: 'sdoc-comment-editor-paragraph' };
      if (parentNode && parentNode.type === LIST_ITEM) {
        const [renderParagraph] = ParagraphPlugin.renderElements;
        return renderParagraph(_props);
      }
      const placeholder = commentType === 'comment' ? 'Enter_comment_shift_enter_for_new_line_Enter_to_send' : 'Enter_reply_shift_Enter_for_new_line_Enter_to_send';
      const [renderParagraph] = ParagraphPlugin.renderElements;
      return renderParagraph({ ..._props, placeholder });
    }
    case LINK: {
      const [renderLink] = LinkPlugin.renderElements;
      return renderLink(props, editor, readonly);
    }
    case ORDERED_LIST:
    case UNORDERED_LIST: {
      const [renderList] = ListPlugin.renderElements;
      return renderList(props, editor);
    }
    case LIST_ITEM: {
      const [, renderListItem] = ListPlugin.renderElements;
      return renderListItem(props, editor);
    }
    case IMAGE: {
      const parentNode = getParentNode(editor.children, element.id);
      const comments = editor.element_comments_map?.[parentNode.id] || [];
      const unresolvedComments = comments && comments.filter(item => !item.resolved);
      let leaf = {};
      if (unresolvedComments && unresolvedComments.length > 0) {
        leaf['computed_background_color'] = 'rgba(129, 237, 247, 0.5)';
      }
      const [renderImage] = ImagePlugin.renderElements;
      return renderImage({ ...props, leaf }, editor);
    }
    case IMAGE_BLOCK: {
      const [, renderImageBlock] = ImagePlugin.renderElements;
      return renderImageBlock({ ...props }, editor);
    }
    case VIDEO: {
      const [renderVideo] = VideoPlugin.renderElements;
      return renderVideo({ ...props }, editor);
    }
    case MENTION: {
      const [renderMention] = MentionPlugin.renderElements;
      return renderMention(props, editor);
    }
    case MENTION_TEMP: {
      const [, renderMentionTemporaryInput] = MentionPlugin.renderElements;
      return renderMentionTemporaryInput(props, editor);
    }
    case BLOCKQUOTE: {
      const [renderBlockquote] = BlockquotePlugin.renderElements;
      return renderBlockquote(props, editor);
    }
    default: {
      const [renderParagraph] = ParagraphPlugin.renderElements;
      return renderParagraph(props);
    }
  }
};

export default RenderCommentEditorCustomRenderElement;
