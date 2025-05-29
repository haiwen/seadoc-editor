/** @jsx jsx */
import CheckListPlugin from '../../../../src/extension/plugins/check-list';
import { setCheckListItemType } from '../../../../src/extension/plugins/check-list/helpers';
import { changeToCodeBlock, changeToPlainText } from '../../../../src/extension/plugins/code-block/helpers';
import { jsx, createSdocEditor, formatChildren } from '../../../core';
import { CHECK_LIST_ITEM, PARAGRAPH } from '../../../core/constants';

describe('toggle code-block test', () => {
  it('change paragraph to checkbox', () => {
    const input = (
      <editor>
        <hp>aaaa<cursor /></hp>
      </editor>
    );

    const output = (
      <editor>
        <htodoli >
          aaaa
        </htodoli>
      </editor>
    );

    const plugins = [CheckListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    setCheckListItemType(editor, CHECK_LIST_ITEM);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('change checkbox to paragraph', () => {
    const input = (
      <editor>
        <htodoli>
          aaaa<cursor />
        </htodoli>
      </editor>
    );

    const output = (
      <editor>
        <hp>aaaa</hp>
      </editor>
    );

    const plugins = [CheckListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    setCheckListItemType(editor, PARAGRAPH);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
