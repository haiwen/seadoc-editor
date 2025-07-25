import { useReadOnly, useSlateStatic } from '@seafile/slate-react';
import { DIFF_VIEWER } from '../../constants';
import { BLOCKQUOTE, LINK, CHECK_LIST_ITEM, HEADER1, HEADER2, HEADER3, HEADER4, HEADER5, HEADER6, LIST_ITEM, ORDERED_LIST, PARAGRAPH,
  UNORDERED_LIST, CODE_BLOCK, CODE_LINE, IMAGE, IMAGE_BLOCK, VIDEO, ELEMENT_TYPE, SDOC_LINK, FILE_LINK, TITLE, SUBTITLE, CALL_OUT,
  SUPPORTED_SIDE_OPERATION_TYPE, MENTION, MENTION_TEMP, FILE_LINK_INSET_INPUT_TEMP, QUICK_INSERT
} from '../constants';
import { WHITEBOARD, WIKI_LINK } from '../constants/element-type';
import { getParentNode } from '../core';
import { BlockquotePlugin, LinkPlugin, CheckListPlugin, HeaderPlugin, ListPlugin, CodeBlockPlugin, ImagePlugin, VideoPlugin, TablePlugin,
  MultiColumnPlugin, SdocLinkPlugin, ParagraphPlugin, FileLinkPlugin, CalloutPlugin, MentionPlugin, QuickInsertPlugin, WikiLinkPlugin,
  GroupPlugin, WhiteboardPlugin
} from '../plugins';
import { setDataRoot, setMouseEnter, onDragOver, onDragLeave, onDrop } from './helper';

const CustomRenderElement = (props) => {
  const editor = useSlateStatic();
  const readonly = useReadOnly();
  const { element, attributes } = props;

  if (SUPPORTED_SIDE_OPERATION_TYPE.includes(element.type)) {
    setMouseEnter(editor, element, attributes);
    attributes['onDragOver'] = onDragOver;
    attributes['onDragLeave'] = onDragLeave;
    attributes['onDrop'] = onDrop;
    attributes['className'] = 'sdoc-drag-cover';
  }

  // Sets the data-root attribute to true for certain elements
  setDataRoot(element, attributes);

  switch (element.type) {
    case PARAGRAPH: {
      let placeholder = undefined;
      if (editor.editorType === DIFF_VIEWER) placeholder = '';

      const parentNode = getParentNode(editor.children, element.id);
      if (parentNode && parentNode.type === LIST_ITEM) {
        const [renderParagraph] = ParagraphPlugin.renderElements;
        return renderParagraph({ ...props, placeholder });
      }

      placeholder = readonly ? '' : 'Enter_text_or_press_forward_slash_to_insert_element';
      const [renderParagraph] = ParagraphPlugin.renderElements;
      return renderParagraph({ ...props, placeholder });
    }
    case TITLE: {
      const [renderTitle] = HeaderPlugin.renderElements;
      return renderTitle(props, editor);
    }
    case SUBTITLE: {
      const [, renderSubtitle] = HeaderPlugin.renderElements;
      return renderSubtitle(props, editor);
    }
    case HEADER1:
    case HEADER2:
    case HEADER3:
    case HEADER4:
    case HEADER5:
    case HEADER6: {
      const [, , renderHeader] = HeaderPlugin.renderElements;
      return renderHeader(props, editor);
    }
    case LINK: {
      const [renderLink] = LinkPlugin.renderElements;
      return renderLink(props, editor, readonly);
    }
    case BLOCKQUOTE: {
      const [renderBlockquote] = BlockquotePlugin.renderElements;
      return renderBlockquote(props, editor);
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
    case CHECK_LIST_ITEM: {
      const [renderCheckListItem] = CheckListPlugin.renderElements;
      return renderCheckListItem(props, editor);
    }
    case CODE_BLOCK: {
      const [renderCodeBlock] = CodeBlockPlugin.renderElements;
      return renderCodeBlock(props, editor);
    }
    case CODE_LINE: {
      const [, renderCodeLine] = CodeBlockPlugin.renderElements;
      return renderCodeLine(props, editor);
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
    case ELEMENT_TYPE.MULTI_COLUMN: {
      const [renderMultiColumn] = MultiColumnPlugin.renderElements;
      return renderMultiColumn(props, editor);
    }
    case ELEMENT_TYPE.COLUMN: {
      const [, renderColumn] = MultiColumnPlugin.renderElements;
      return renderColumn(props, editor);
    }
    case ELEMENT_TYPE.TABLE: {
      const [renderTable] = TablePlugin.renderElements;
      return renderTable(props, editor);
    }
    case ELEMENT_TYPE.TABLE_ROW: {
      const [, renderTableRow] = TablePlugin.renderElements;
      return renderTableRow(props, editor);
    }
    case ELEMENT_TYPE.TABLE_CELL: {
      const [, , renderTableCell] = TablePlugin.renderElements;
      return renderTableCell(props, editor);
    }
    case SDOC_LINK: {
      const [renderSdocLink] = SdocLinkPlugin.renderElements;
      return renderSdocLink(props, editor);
    }
    case FILE_LINK: {
      const [renderFileLink] = FileLinkPlugin.renderElements;
      return renderFileLink(props, editor);
    }
    case FILE_LINK_INSET_INPUT_TEMP: {
      const [, renderFileLinkFileSearchInput] = SdocLinkPlugin.renderElements;
      return renderFileLinkFileSearchInput(props, editor);
    }
    case CALL_OUT: {
      const [renderCallout] = CalloutPlugin.renderElements;
      return renderCallout(props, editor);
    }
    case MENTION: {
      const [renderMention] = MentionPlugin.renderElements;
      return renderMention(props, editor);
    }
    case MENTION_TEMP: {
      const [, renderMentionTemporaryInput] = MentionPlugin.renderElements;
      return renderMentionTemporaryInput(props, editor);
    }
    case QUICK_INSERT: {
      const [renderQuickInsert] = QuickInsertPlugin.renderElements;
      return renderQuickInsert(props, editor, readonly);
    }
    case WIKI_LINK: {
      const [renderWikiLink] = WikiLinkPlugin.renderElements;
      return renderWikiLink(props, editor);
    }
    case ELEMENT_TYPE.GROUP: {
      const [renderGroup] = GroupPlugin.renderElements;
      return renderGroup(props);
    }
    case WHITEBOARD: {
      const [renderWhiteboard] = WhiteboardPlugin.renderElements;
      return renderWhiteboard({ ...props }, editor);
    }
    default: {
      const [renderParagraph] = ParagraphPlugin.renderElements;
      return renderParagraph(props);
    }
  }
};

export default CustomRenderElement;
