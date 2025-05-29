/** @jsx jsx */
import { withReact } from '@seafile/slate-react';
import { LinkPlugin } from '../../../../src/extension/plugins';
import {
  insertLink,
  updateLink,
  unWrapLinkNode,
} from '../../../../src/extension/plugins/link/helpers';
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
          <ha href='http://localhost:7003/simple-editor' title='测试链接'>
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
            <ha href='http://localhost:7003/simple-editor' title='测试链接'>
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
            <ha href='http://localhost:7003/simple-editor' title='bb'>
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
            <ha href='http://localhost:7003' title='新测试链接'>
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
          <ha href='http://localhost:7003/simple' title='测试'>
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
