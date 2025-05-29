/** @jsx jsx */
import ListPlugin from '../../../../src/extension/plugins/list';
import { jsx, createSdocEditor, formatChildren } from '../../../core';

describe('insert fragment list', () => {
  it('copy checkbox into empty list item', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><cursor/></hp>
          </hli>
        </hol>
      </editor>
    );

    const fragment = (
      <fragment>
        <htodoli>aaa</htodoli>
      </fragment>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aaa</hp>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertFragment(fragment);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('copy checkbox into list item not empty', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>ccc<cursor/></hp>
          </hli>
        </hol>
      </editor>
    );

    const fragment = (
      <fragment>
        <htodoli>aaa</htodoli>
      </fragment>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertFragment(fragment);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('copy listItem into paragraph', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hp><cursor /></hp>
      </editor>
    );

    const fragment = (
      <fragment>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
          </hli>
        </hol>
      </fragment>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertFragment(fragment);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('copy listItem(no ol child) into listItem, and listItem(no ol child) lic is empty', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><cursor /></hp>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const fragment = (
      <fragment>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
          </hli>
        </hol>
      </fragment>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertFragment(fragment);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('copy listItem(no ol child) into listItem, and listItem(has ol child) lic is empty', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><cursor /></hp>
            <hol>
              <hli>
                <hp>aaabbbccc</hp>
              </hli>
            </hol>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const fragment = (
      <fragment>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
          </hli>
        </hol>
      </fragment>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
            <hol>
              <hli>
                <hp>aaabbbccc</hp>
              </hli>
            </hol>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertFragment(fragment);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('copy listItem(has ol child) into listItem, and listItem(has ol child) lic is empty', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp><cursor /></hp>
            <hol>
              <hli>
                <hp>aaabbbccc</hp>
              </hli>
            </hol>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const fragment = (
      <fragment>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
            <hol>
              <hli>
                <hp>1111111</hp>
              </hli>
              <hli>
                <hp>222222</hp>
              </hli>
            </hol>
          </hli>
        </hol>
      </fragment>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
            <hol>
              <hli>
                <hp>1111111</hp>
              </hli>
              <hli>
                <hp>222222</hp>
              </hli>
              <hli>
                <hp>aaabbbccc</hp>
              </hli>
            </hol>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertFragment(fragment);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });

  it('copy listItem(has ol child) into listItem, and listItem(has ol child) lic not empty', () => {
    const input = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aaa<cursor /></hp>
            <hol>
              <hli>
                <hp>aaabbbccc</hp>
              </hli>
            </hol>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const fragment = (
      <fragment>
        <hol>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
            <hol>
              <hli>
                <hp>1111111</hp>
              </hli>
              <hli>
                <hp>222222</hp>
              </hli>
            </hol>
          </hli>
        </hol>
      </fragment>
    );

    const output = (
      <editor>
        <hh1>aa</hh1>
        <hol>
          <hli>
            <hp>aaa</hp>
            <hol>
              <hli>
                <hp>aaabbbccc</hp>
              </hli>
            </hol>
          </hli>
          <hli>
            <hp>
              <htext>ccc</htext>
              <htext>aaa</htext>
            </hp>
            <hol>
              <hli>
                <hp>1111111</hp>
              </hli>
              <hli>
                <hp>222222</hp>
              </hli>
            </hol>
          </hli>
          <hli>
            <hp>aaabbbccc</hp>
          </hli>
        </hol>
      </editor>
    );

    const plugins = [ListPlugin.editorPlugin];
    const editor = createSdocEditor(input, plugins);
    editor.insertFragment(fragment);

    expect(formatChildren(editor.children)).toEqual(formatChildren(output.children));
  });
});
