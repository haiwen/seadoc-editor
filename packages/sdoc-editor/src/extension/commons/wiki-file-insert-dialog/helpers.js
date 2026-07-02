import { INTERNAL_EVENT } from '../../../constants';
import EventBus from '../../../utils/event-bus';
import { removeTempInput } from '../../plugins/sdoc-link/helpers';
import { insertWikiPageLink } from '../../plugins/wiki-link/helpers';

export const invalidTitlePattern = /[\\/:*?"<>|]/;

export const validateWikiPageTitle = (title) => {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    return 'Please_enter_title';
  }

  if (invalidTitlePattern.test(trimmedTitle)) {
    return 'Page_title_contains_invalid_characters';
  }

  return '';
};

export const createWikiPageAndInsertLink = ({ editor, element, title }) => {
  const createName = title.trim();
  const eventBus = EventBus.getInstance();
  const unsubscribe = eventBus.subscribe(INTERNAL_EVENT.WIKI_PAGE_ID_CREATED, ({ pageId, pageName, wikiRepoId }) => {
    insertWikiPageLink(editor, pageName, wikiRepoId, pageId);
    unsubscribe();
  });

  removeTempInput(editor, element);
  eventBus.dispatch(INTERNAL_EVENT.CREATE_WIKI_PAGE, {
    newFileName: createName,
    insertWikiPageLink,
    editor,
    noShowDialog: true,
    noRedirect: true,
  });
};
