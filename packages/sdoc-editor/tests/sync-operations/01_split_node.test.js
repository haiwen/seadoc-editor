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
      type: 'split_node',
      path: [3, 0],
      position: 4,
      properties: {}
    };
    const remote_op2 = {
      type: 'split_node',
      path: [3],
      position: 1,
      properties: { type: 'paragraph' }
    };

    // enter
    const op1 = decorateOperation(serverEditor.getEditor(), remote_op1);
    const op2 = decorateOperation(serverEditor.getEditor(), remote_op2);

    const ops = [op1, op2];
    serverEditor.applyOperations(ops);
    const remote_op3 = {
      type: 'insert_text',
      path: [4, 0],
      offset: 0,
      text: 'xiaoqiang'
    };

    const op3 = decorateOperation(serverEditor.getEditor(), remote_op3);
    serverEditor.applyOperations([op3]);

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
          <htext id="ddd1">dddd</htext>
        </hp>
        <hp id={op2.properties.id}>
          <htext id={op1.properties.id}>xiaoqiang</htext>
        </hp>
      </editor>
    );
    expect(serverEditor.getContent()).toEqual(formatChildren2(output.children));
  });
});

describe('sync operations:insert_text&split_node', () => {
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
    const operations = remoteOperationList[0];
    const id1 = operations[0].properties.id;
    const id2 = operations[1].properties.id;
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
        <hp id="ddd">
          <htext id="ddd1">dddd</htext>
        </hp>
        <hp id={id2}>
          <htext id={id1}>xiaoqiang</htext>
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

    const remoteOperationList = serverEditor.getPendingOperationList();
    const operations = remoteOperationList[0];
    const id1 = operations[0].properties.id;
    const id2 = operations[1].properties.id;
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
        <hp id="ddd">
          <htext id="ddd1">ddddabcdabcd</htext>
        </hp>
        <hp id={id2}>
          <htext id={id1}>xiaoqiang</htext>
        </hp>
      </editor>
    );
    expect(clientEditor.getContent()).toEqual(formatChildren2(output3.children));
  });

  it('client send new ops to server', () => {
    // send operations to server
    const newClientOperations = clientEditor.getPendingOperationList();
    expect(clientEditor.getContent()).not.toEqual(serverEditor.getContent());
    newClientOperations.forEach(operations => {
      serverEditor.applyOperations(operations);
    });
    expect(clientEditor.getContent()).toEqual(serverEditor.getContent());
  });
});
