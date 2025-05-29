/** @jsx jsx */
import { decorateOperation } from '../../src/node-id/helpers';
import { reExecRevertOperationList, revertOperationList, syncRemoteOperations } from '../../src/socket/helpers';
import { jsx, StubEditor, formatChildren2 } from '../core';

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
    <hp id="ddd">
      <htext id="ddd1">dddd</htext>
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
    <hp id="ddd">
      <htext id="ddd1">dddd</htext>
    </hp>
  </editor>
);
const clientEditor = new StubEditor(input1);
const serverEditor = new StubEditor(input2);

describe('construct clientEditor and serverEditor', () => {
  it('client editor: execute ops', () => {
    const op1 = {
      node_id: 'ddd1',
      type: 'insert_text',
      path: [3, 0],
      offset: 4,
      text: 'abcd'
    };
    const op2 = {
      node_id: 'ddd1',
      type: 'insert_text',
      path: [3, 0],
      offset: 8,
      text: 'abcd'
    };
    const ops = [op1, op2];
    clientEditor.applyOperations(ops);

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
        <hp id="ddd">
          <htext id="ddd1">ddddabcdabcd</htext>
        </hp>
      </editor>
    );
    expect(clientEditor.getContent()).toEqual(formatChildren2(output.children));
  });
  it('server editor: execute ops', () => {
    const remote_op1 = {
      type: 'merge_node',
      path: [3],
      position: 1,
      properties: { type: 'paragraph' }
    };

    // enter
    const op1 = decorateOperation(serverEditor.getEditor(), remote_op1);

    const ops = [op1];
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
          <htext id="ddd1">dddd</htext>
        </hp>
      </editor>
    );
    expect(serverEditor.getContent()).toEqual(formatChildren2(output.children));
  });
});

describe('sync operations:insert_text&merge_node', () => {
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
        <hp id="ddd">
          <htext id="ddd1">dddd</htext>
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
          <htext id="ddd1">dddd</htext>
        </hp>
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
          <htext id="ddd1">ddddabcdabcd</htext>
        </hp>
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
