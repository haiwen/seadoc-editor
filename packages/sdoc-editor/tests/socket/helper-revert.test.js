/** @jsx jsx */
import { Editor } from '@seafile/slate';
import { revertOperationList } from '../../src/socket/helpers';
import { jsx, createSdocEditor, formatChildren } from '../core';

describe('execute ops & revert ops', () => {
  it('execute ops', () => {
    const input = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>dddd</hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>ddddabcdabcd</hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    const op = {
      type: 'insert_text',
      path: [3, 0],
      offset: 4,
      text: 'abcd'
    };
    editor.apply(op);
    editor.apply(op);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('revert ops', () => {
    const input = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>ddddabcdabcd</hp>
      </editor>
    );

    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>dddd</hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    const op = {
      type: 'insert_text',
      path: [3, 0],
      offset: 4,
      text: 'abcd'
    };
    const ops = [op, op];
    revertOperationList(editor, [ops]);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});

describe('Revert process testing 1', () => {

  const input = (
    <editor>
      <hp>aaaa</hp>
      <hp>bbbb</hp>
      <hp>cccc</hp>
      <hp>dddd</hp>
    </editor>
  );
  const editor = createSdocEditor(input);
  let localeOperations = [];

  it('execute locale ops', () => {
    const op1 = {
      type: 'insert_text',
      path: [3, 0],
      offset: 4,
      text: 'abcd'
    };
    const op2 = {
      type: 'insert_text',
      path: [3, 0],
      offset: 8,
      text: 'abcd'
    };
    Editor.withoutNormalizing(editor, () => {
      editor.apply(op1);
      editor.apply(op2);
    });
    localeOperations = editor.operations.slice();
    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>ddddabcdabcd</hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('revert locale ops', () => {
    revertOperationList(editor, [localeOperations]);
    editor.operations = [];

    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>dddd</hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('execute remote ops', () => {
    const remote_op1 = {
      type: 'split_node',
      path: [3, 0],
      position: 8,
    };
    const remote_op2 = {
      type: 'split_node',
      path: [3],
      position: 1,
      properties: { type: 'paragraph' }
    };
    const remote_op3 = {
      type: 'insert_text',
      path: [4, 0],
      offset: 0,
      text: 'xiaoqiang'
    };
    Editor.withoutNormalizing(editor, () => {
      editor.apply(remote_op1);
      editor.apply(remote_op2);
      editor.apply(remote_op3);
    });
    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>dddd</hp>
        <hp>xiaoqiang</hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('re-execute locale ops', () => {

    Editor.withoutNormalizing(editor, () => {
      localeOperations.forEach(item => {
        editor.apply(item);
      });
    });
    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>ddddabcdabcd</hp>
        <hp>xiaoqiang</hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});

describe('Revert process testing 2', () => {

  const input = (
    <editor>
      <hp>aaaa</hp>
      <hp>bbbb</hp>
      <hp>cccc</hp>
      <hp>dddd</hp>
    </editor>
  );
  const editor = createSdocEditor(input);
  let localeOperations = [];

  it('execute locale ops', () => {
    const op1 = {
      type: 'insert_text',
      path: [3, 0],
      offset: 4,
      text: 'abcd'
    };
    const op2 = {
      type: 'insert_text',
      path: [3, 0],
      offset: 8,
      text: 'abcd'
    };
    Editor.withoutNormalizing(editor, () => {
      editor.apply(op1);
      editor.apply(op2);
    });
    localeOperations = editor.operations.slice();
    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>ddddabcdabcd</hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('revert locale ops', () => {
    revertOperationList(editor, [localeOperations]);
    editor.operations = [];

    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>dddd</hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('execute remote ops', () => {
    const remote_op1 = {
      type: 'split_node',
      path: [3, 0],
      position: 8,
    };
    const remote_op2 = {
      type: 'split_node',
      path: [3],
      position: 1,
      properties: { type: 'paragraph' }
    };
    const remote_op3 = {
      type: 'insert_text',
      path: [3, 0],
      offset: 0,
      text: 'xiaoqiang'
    };
    Editor.withoutNormalizing(editor, () => {
      editor.apply(remote_op1);
      editor.apply(remote_op2);
      editor.apply(remote_op3);
    });
    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>xiaoqiangdddd</hp>
        <hp><htext></htext></hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('re-execute locale ops', () => {
    Editor.withoutNormalizing(editor, () => {
      localeOperations.forEach(item => {
        editor.apply(item);
      });
    });
    const output = (
      <editor>
        <hp>aaaa</hp>
        <hp>bbbb</hp>
        <hp>cccc</hp>
        <hp>xiaoabcdabcdqiangdddd</hp>
        <hp><htext></htext></hp>
      </editor>
    );
    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
