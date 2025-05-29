/** @jsx jsx */
import { toggleList } from '../../../../src/extension/plugins/list/transforms';
import { jsx, createSdocEditor, formatChildren } from '../../../core';
import { ORDERED_LIST, UNORDERED_LIST } from '../../../core/constants';

describe('toggle list test', () => {
  it('toggle paragraph to order list', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hp>aa<cursor /></hp>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aa</hp>
          </hli>
        </hol>
      </editor>
    );

    const editor = createSdocEditor(input);
    toggleList(editor, ORDERED_LIST);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
  it('toggle order list to paragraph', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aa<cursor /></hp>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hp>aa</hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    toggleList(editor, ORDERED_LIST);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('toggle paragraph to unorder list', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hp>aa<cursor /></hp>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hul>
          <hli>
            <hp>aa</hp>
          </hli>
        </hul>
      </editor>
    );

    const editor = createSdocEditor(input);
    toggleList(editor, UNORDERED_LIST);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
  it('toggle unorder list to paragraph', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hul>
          <hli>
            <hp>aa<cursor /></hp>
          </hli>
        </hul>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hp>aa</hp>
      </editor>
    );

    const editor = createSdocEditor(input);
    toggleList(editor, UNORDERED_LIST);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
  it('toggle unorder list to order list', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hul>
          <hli>
            <hp>aa<cursor /></hp>
          </hli>
        </hul>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aa</hp>
          </hli>
        </hol>
      </editor>
    );

    const editor = createSdocEditor(input);
    toggleList(editor, ORDERED_LIST);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
  it('toggle order list to unorder list', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aa<cursor /></hp>
          </hli>
        </hol>
      </editor>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hul>
          <hli>
            <hp>aa</hp>
          </hli>
        </hul>
      </editor>
    );

    const editor = createSdocEditor(input);
    toggleList(editor, UNORDERED_LIST);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
