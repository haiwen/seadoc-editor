/** @jsx jsx */
import { withReact } from '@seafile/slate-react';
import context from '../../../../src/context';
import { LinkPlugin } from '../../../../src/extension/plugins';
import {
  insertLink,
  updateLink,
  unWrapLinkNode,
} from '../../../../src/extension/plugins/link/helpers';
import * as sdocLinkHelpers from '../../../../src/extension/plugins/sdoc-link/helpers';
import { jsx, createSdocEditor, formatChildren } from '../../../core';


describe('toggle link test', () => {
  describe('insert link menu when not selected', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext></htext>
          <ha href='http://localhost:7003/simple-editor' title='测试链接' linked_id='' linked_wiki_page_id='' >
            测试链接
          </ha>
          <htext></htext>
        </hp>
      </editor>
    );

    const plugins = [LinkPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    insertLink(editor, '测试链接', 'http://localhost:7003/simple-editor', 'current');

    expect(formatChildren(editor.children)).toEqual(
      formatChildren(output.children)
    );
  });

  describe('insert link menu when selected', () => {
    it('selected text is not the same as the linked text', () => {
      const input = (
        <editor>
          <hp>
            <htext>aaabbb</htext>
          </hp>
        </editor>
      );

      const output = (
        <editor>
          <hp>
            <htext>aaa</htext>
            <ha href='http://localhost:7003/simple-editor' title='测试链接' linked_id='' linked_wiki_page_id='' >
              测试链接
            </ha>
            <htext>b</htext>
          </hp>
        </editor>
      );

      const plugins = [LinkPlugin.editorPlugin];
      const editor = createSdocEditor(input, plugins);
      editor.selection = {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      };
      insertLink(editor, '测试链接', 'http://localhost:7003/simple-editor', 'current');

      expect(formatChildren(editor.children)).toEqual(
        formatChildren(output.children)
      );
    });

    it('selected text is same as the linked text', () => {
      const input = (
        <editor>
          <hp>
            <htext>aaabbb</htext>
          </hp>
        </editor>
      );

      const output = (
        <editor>
          <hp>
            <htext>aaa</htext>
            <ha href='http://localhost:7003/simple-editor' title='bb' linked_id='' linked_wiki_page_id='' >
              bb
            </ha>
            <htext>b</htext>
          </hp>
        </editor>
      );

      const plugins = [LinkPlugin.editorPlugin];
      const editor = createSdocEditor(input, plugins);
      editor.selection = {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      };
      insertLink(editor, 'bb', 'http://localhost:7003/simple-editor', 'current');

      expect(formatChildren(editor.children)).toEqual(
        formatChildren(output.children)
      );
    });
  });

  describe('edit link menu', () => {
    it('edit link menu', () => {
      const input = (
        <editor>
          <hp>
            <htext> </htext>
            <ha href='http://localhost:7003/simple-editor' title='测试链接'>
              测试链接
            </ha>
            <htext> </htext>
          </hp>
        </editor>
      );

      const output = (
        <editor>
          <hp>
            <htext> </htext>
            <ha href='http://localhost:7003' title='新测试链接' linked_id=''>
              新测试链接
            </ha>
            <htext> </htext>
          </hp>
        </editor>
      );

      const plugins = [LinkPlugin.editorPlugin];
      const editor = createSdocEditor(input, plugins);
      editor.selection = {
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
      };
      updateLink(editor, '新测试链接', 'http://localhost:7003');

      expect(formatChildren(editor.children)).toEqual(
        formatChildren(output.children)
      );
    });
  });

  describe('unlink link menu', () => {
    it('unlink menu test', () => {
      const input = (
        <editor>
          <hp>
            <htext> </htext>
            <ha href='http://localhost:7003/simple-editor' title='测试链接'>
              测试链接
            </ha>
            <htext> </htext>
          </hp>
        </editor>
      );

      const output = (
        <editor>
          <hp>
            <htext> </htext>
            <htext>测试链接</htext>
            <htext> </htext>
          </hp>
        </editor>
      );

      const plugins = [LinkPlugin.editorPlugin];
      const editor = createSdocEditor(input, plugins);
      editor.selection = {
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
      };
      unWrapLinkNode(editor);

      expect(formatChildren(editor.children)).toEqual(
        formatChildren(output.children)
      );
    });
  });
});

describe('modify link test', () => {
  it('modify link', () => {
    const input = (
      <editor>
        <hp>
          <ha href='http://localhost:7003/simple-editor' title='测试链接'>
            测试链接
          </ha>
          <htext> </htext>
          <ha href='http://localhost:7003/simple-editor' title='测试链接'>
            测试<cursor />链接
          </ha>
        </hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>
          <htext></htext>
          <ha href='http://localhost:7003/simple-editor' title='测试链接'>
            测试链接
          </ha>
          <htext> </htext>
          <ha href='http://localhost:7003/simple' title='测试' linked_id=''>
            测试
          </ha>
          <htext></htext>
        </hp>
      </editor>
    );
    const plugins = [LinkPlugin.editorPlugin, withReact];
    const editor = createSdocEditor(input, plugins);
    updateLink(editor, '测试', 'http://localhost:7003/simple');

    expect(formatChildren(editor.children)).toEqual(
      formatChildren(output.children)
    );
  });
});

describe('paste encoded internal file link', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('looks up file info with the decoded URL', async () => {
    const encodedUrl = 'https://example.com/f/repo/?p=%E4%B8%AD%E6%96%87';
    const decodedUrl = decodeURIComponent(encodedUrl);
    const insertSdocFileLink = jest.spyOn(sdocLinkHelpers, 'insertSdocFileLink').mockImplementation(() => {});
    const getLinkFilesInfo = jest.spyOn(context, 'getLinkFilesInfo').mockResolvedValue({
      data: {
        files_info: {
          [decodedUrl]: {
            file_ext: 'sdoc',
            file_uuid: 'sdoc-uuid',
            is_dir: false,
            name: '中文.sdoc',
          },
        },
      },
    });
    context.initSSRSettings({ serviceUrl: 'https://example.com' });

    const input = (
      <editor>
        <hp><cursor /></hp>
        <hp><htext></htext></hp>
      </editor>
    );
    const editor = createSdocEditor(input, [withReact, LinkPlugin.editorPlugin]);

    await editor.insertData({
      getData: (type) => type === 'text/plain' ? encodedUrl : '',
      types: ['text/plain'],
    });

    expect(getLinkFilesInfo).toHaveBeenCalledWith([encodedUrl]);
    expect(insertSdocFileLink).toHaveBeenCalledWith(editor, '中文.sdoc', 'sdoc-uuid');
  });
});
