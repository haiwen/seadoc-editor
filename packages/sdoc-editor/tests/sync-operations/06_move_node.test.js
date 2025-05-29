/** @jsx jsx */
import ListPlugin from '../../src/extension/plugins/list';
import { decorateOperation } from '../../src/node-id/helpers';
import { reExecRevertOperationList, revertOperationList, syncRemoteOperations } from '../../src/socket/helpers';
import { jsx, StubEditor, formatChildren2 } from '../core';

// hp -> hp
const input1 = (
  <editor>
    <hp id="aaa">
      <htext id="aaa1">aaaa</htext>
    </hp>
    <hp id="bbb">
      <htext id="bbb1">bbbb</htext>
    </hp>
    <hp id="ccc">
      <htext id="ccc1">cccc</htext>
    </hp>
    <hul id="ddd">
      <hli id="li-1">
        <hp id="lic-1">
          <htext id="lic-t1">lic1</htext>
        </hp>
      </hli>
      <hli id="li-2">
        <hp id="lic-2">
          <htext id="lic-t2">lic2</htext>
        </hp>
      </hli>
      <hli id="li-3">
        <hp id="lic-4">
          <htext id="lic-t5">lic3</htext>
        </hp>
      </hli>
    </hul>
    <hp id="eee">
      <htext id="eee">eee</htext>
    </hp>
  </editor>
);
const input2 = (
  <editor>
    <hp id="aaa">
      <htext id="aaa1">aaaa</htext>
    </hp>
    <hp id="bbb">
      <htext id="bbb1">bbbb</htext>
    </hp>
    <hp id="ccc">
      <htext id="ccc1">cccc</htext>
    </hp>
    <hul id="ddd">
      <hli id="li-1">
        <hp id="lic-1">
          <htext id="lic-t1">lic1</htext>
        </hp>
      </hli>
      <hli id="li-2">
        <hp id="lic-2">
          <htext id="lic-t2">lic2</htext>
        </hp>
      </hli>
      <hli id="li-3">
        <hp id="lic-4">
          <htext id="lic-t5">lic3</htext>
        </hp>
      </hli>
    </hul>
    <hp id="eee">
      <htext id="eee">eee</htext>
    </hp>
  </editor>
);
const plugins = [ListPlugin.editorPlugin];
const clientEditor = new StubEditor(input1, plugins);
const serverEditor = new StubEditor(input2, plugins);

describe('construct clientEditor and serverEditor', () => {
  it('client editor: execute ops', () => {
    const op1 = {
      node_id: 'ccc1',
      type: 'split_node',
      path: [2, 0],
      position: 4,
      properties: { id: 'ggg1' }
    };
    const op2 = {
      node_id: 'ccc',
      type: 'split_node',
      path: [2],
      position: 1,
      properties: { type: 'paragraph', id: 'ggg' }
    };

    clientEditor.applyOperations([op1, op2]);

    const op3 = {
      node_id: 'ggg1',
      type: 'insert_text',
      path: [3, 0],
      offset: 0,
      text: 'd'
    };
    const op4 = {
      node_id: 'ggg1',
      type: 'insert_text',
      path: [3, 0],
      offset: 1,
      text: 'd'
    };
    const op5 = {
      node_id: 'ggg1',
      type: 'insert_text',
      path: [3, 0],
      offset: 2,
      text: 'd'
    };
    const op6 = {
      node_id: 'ggg1',
      type: 'insert_text',
      path: [3, 0],
      offset: 3,
      text: 'd'
    };
    clientEditor.applyOperations([op3, op4, op5, op6]);

    const output = (
      <editor>
        <hp id="aaa">
          <htext id="aaa1">aaaa</htext>
        </hp>
        <hp id="bbb">
          <htext id="bbb1">bbbb</htext>
        </hp>
        <hp id="ccc">
          <htext id="ccc1">cccc</htext>
        </hp>
        <hp id="ggg">
          <htext id="ggg1">dddd</htext>
        </hp>
        <hul id="ddd">
          <hli id="li-1">
            <hp id="lic-1">
              <htext id="lic-t1">lic1</htext>
            </hp>
          </hli>
          <hli id="li-2">
            <hp id="lic-2">
              <htext id="lic-t2">lic2</htext>
            </hp>
          </hli>
          <hli id="li-3">
            <hp id="lic-4">
              <htext id="lic-t5">lic3</htext>
            </hp>
          </hli>
        </hul>
        <hp id="eee">
          <htext id="eee">eee</htext>
        </hp>
      </editor>
    );
    expect(clientEditor.getContent()).toEqual(formatChildren2(output.children));
  });
  it('server editor: execute ops, set_node', () => {
    const remote_op1 = {
      node_id: '',
      type: 'insert_node',
      path: [5],
      node: { id: 'fff', type: 'unordered_list', children: [] }
    };
    const remote_op2 = {
      node_id: 'ddd',
      type: 'move_node',
      path: [3, 2],
      newPath: [5, 0]
    };

    // enter
    const op1 = decorateOperation(serverEditor.getEditor(), remote_op1);
    const op2 = decorateOperation(serverEditor.getEditor(), remote_op2);

    const ops = [op1, op2];
    serverEditor.applyOperations(ops);

    const output = (
      <editor>
        <hp id="aaa">
          <htext id="aaa1">aaaa</htext>
        </hp>
        <hp id="bbb">
          <htext id="bbb1">bbbb</htext>
        </hp>
        <hp id="ccc">
          <htext id="ccc1">cccc</htext>
        </hp>
        <hul id="ddd">
          <hli id="li-1">
            <hp id="lic-1">
              <htext id="lic-t1">lic1</htext>
            </hp>
          </hli>
          <hli id="li-2">
            <hp id="lic-2">
              <htext id="lic-t2">lic2</htext>
            </hp>
          </hli>
        </hul>
        <hp id="eee">
          <htext id="eee">eee</htext>
        </hp>
        <hul id='fff'>
          <hli id="li-3">
            <hp id="lic-4">
              <htext id="lic-t5">lic3</htext>
            </hp>
          </hli>
        </hul>
      </editor>
    );
    expect(serverEditor.getContent()).toEqual(formatChildren2(output.children));
  });
});

describe('sync operations:split_node&move_node', () => {
  it('revert ops', () => {
    // revert operations
    const clientOperationList = clientEditor.getPendingOperationList();
    revertOperationList(clientEditor.getEditor(), clientOperationList);

    const output1 = (
      <editor>
        <hp id="aaa">
          <htext id="aaa1">aaaa</htext>
        </hp>
        <hp id="bbb">
          <htext id="bbb1">bbbb</htext>
        </hp>
        <hp id="ccc">
          <htext id="ccc1">cccc</htext>
        </hp>
        <hul id="ddd">
          <hli id="li-1">
            <hp id="lic-1">
              <htext id="lic-t1">lic1</htext>
            </hp>
          </hli>
          <hli id="li-2">
            <hp id="lic-2">
              <htext id="lic-t2">lic2</htext>
            </hp>
          </hli>
          <hli id="li-3">
            <hp id="lic-4">
              <htext id="lic-t5">lic3</htext>
            </hp>
          </hli>
        </hul>
        <hp id="eee">
          <htext id="eee">eee</htext>
        </hp>
      </editor>
    );
    expect(clientEditor.getContent()).toEqual(formatChildren2(output1.children));
  });

  it('execute remote ops', () => {
    // execute remote ops
    const remoteOperationList = serverEditor.getPendingOperationList();
    remoteOperationList.forEach(operations => {
      syncRemoteOperations(clientEditor.getEditor(), operations);
    });

    const output2 = (
      <editor>
        <hp id="aaa">
          <htext id="aaa1">aaaa</htext>
        </hp>
        <hp id="bbb">
          <htext id="bbb1">bbbb</htext>
        </hp>
        <hp id="ccc">
          <htext id="ccc1">cccc</htext>
        </hp>
        <hul id="ddd">
          <hli id="li-1">
            <hp id="lic-1">
              <htext id="lic-t1">lic1</htext>
            </hp>
          </hli>
          <hli id="li-2">
            <hp id="lic-2">
              <htext id="lic-t2">lic2</htext>
            </hp>
          </hli>
        </hul>
        <hp id="eee">
          <htext id="eee">eee</htext>
        </hp>
        <hul id='fff'>
          <hli id="li-3">
            <hp id="lic-4">
              <htext id="lic-t5">lic3</htext>
            </hp>
          </hli>
        </hul>
      </editor>
    );
    expect(clientEditor.getContent()).toEqual(formatChildren2(output2.children));
  });

  it('re-execute reverted ops', () => {
    // re-execute reverted ops
    const clientOperationList = clientEditor.getPendingOperationList();
    reExecRevertOperationList(clientEditor.getEditor(), clientOperationList);
    clientEditor.resetPendingOperationList();

    const output3 = (
      <editor>
        <hp id="aaa">
          <htext id="aaa1">aaaa</htext>
        </hp>
        <hp id="bbb">
          <htext id="bbb1">bbbb</htext>
        </hp>
        <hp id="ccc">
          <htext id="ccc1">cccc</htext>
        </hp>
        <hp id="ggg">
          <htext id="ggg1">dddd</htext>
        </hp>
        <hul id="ddd">
          <hli id="li-1">
            <hp id="lic-1">
              <htext id="lic-t1">lic1</htext>
            </hp>
          </hli>
          <hli id="li-2">
            <hp id="lic-2">
              <htext id="lic-t2">lic2</htext>
            </hp>
          </hli>
        </hul>
        <hp id="eee">
          <htext id="eee">eee</htext>
        </hp>
        <hul id='fff'>
          <hli id="li-3">
            <hp id="lic-4">
              <htext id="lic-t5">lic3</htext>
            </hp>
          </hli>
        </hul>
      </editor>
    );
    expect(clientEditor.getContent()).toEqual(formatChildren2(output3.children));
  });

  it('client send new ops to server', () => {
    // send operations to server
    expect(clientEditor.getContent()).not.toEqual(serverEditor.getContent());
    const newClientOperations = clientEditor.getPendingOperationList();
    newClientOperations.forEach(operations => {
      serverEditor.applyOperations(operations);
    });
    expect(clientEditor.getContent()).toEqual(serverEditor.getContent());
  });
});
