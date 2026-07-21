import { WIKI_EDITOR } from '../../../../src/constants';
import context from '../../../../src/context';
import ImagePlugin from '../../../../src/extension/plugins/image';
import { getImageWikiPageUrl } from '../../../../src/extension/plugins/image/helpers';

const createEditor = (editorType = '') => {
  const insertFragment = jest.fn();
  const editor = {
    editorType,
    isInline: jest.fn(),
    isVoid: jest.fn(),
    insertData: jest.fn(),
    deleteBackward: jest.fn(),
    insertFragment,
    insertBreak: jest.fn(),
  };
  ImagePlugin.editorPlugin(editor);
  return { editor, insertFragment };
};

const fragment = [
  {
    type: 'paragraph',
    children: [
      {
        type: 'image',
        data: {
          src: 'image.jpg',
          href: 'https://cloud.example.com/wikis/target-wiki/page-id/',
          linked_wiki_page_id: 'page-id',
          linked_wiki_id: 'target-wiki',
        },
        children: [{ text: '' }],
      },
    ],
  },
  { type: 'paragraph', children: [{ text: 'after image' }] },
];

describe('image clipboard links', () => {
  it('keeps the target wiki and page when pasted into another wiki', () => {
    const { editor, insertFragment } = createEditor(WIKI_EDITOR);

    editor.insertFragment(fragment);

    expect(insertFragment).toHaveBeenCalledWith(fragment);
  });

  it('removes the wiki page link when pasted into a library document', () => {
    const { editor, insertFragment } = createEditor('');

    editor.insertFragment(fragment);

    const [insertedFragment] = insertFragment.mock.calls[0];
    expect(insertedFragment[0].children[0].data).toEqual({
      src: 'image.jpg',
    });
  });

  it('keeps a regular web link when pasted into a library document', () => {
    const { editor, insertFragment } = createEditor('');
    const webLinkFragment = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'image',
            data: { src: 'image.jpg', href: 'https://example.com' },
            children: [{ text: '' }],
          },
        ],
      },
      { type: 'paragraph', children: [{ text: 'after image' }] },
    ];

    editor.insertFragment(webLinkFragment);

    const [insertedFragment] = insertFragment.mock.calls[0];
    expect(insertedFragment[0].children[0].data).toEqual({
      src: 'image.jpg',
      href: 'https://example.com',
    });
  });

  it('keeps an internal library link when pasted into a library document', () => {
    const { editor, insertFragment } = createEditor('');
    const libraryLinkFragment = [
      {
        type: 'paragraph',
        children: [{
          type: 'image',
          data: {
            src: 'image.jpg',
            href: 'https://cloud.example.com/lib/repo-id/file/test.sdoc',
          },
          children: [{ text: '' }],
        }],
      },
      { type: 'paragraph', children: [{ text: 'after image' }] },
    ];

    editor.insertFragment(libraryLinkFragment);

    expect(insertFragment).toHaveBeenCalledWith(libraryLinkFragment);
  });

  it('builds a clean absolute URL for the target wiki page', () => {
    context.initSSRSettings({
      serviceUrl: 'https://cloud.example.com',
      siteRoot: '/seafile/',
    });

    expect(getImageWikiPageUrl('target-wiki', 'page-id'))
      .toBe('https://cloud.example.com/seafile/wikis/target-wiki/page-id/');
  });
});
