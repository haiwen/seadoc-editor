/** @jsx jsx */
import LinkPlugin from '../../src/extension/plugins/link';
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
const plugins = [LinkPlugin.editorPlugin];
const clientEditor = new StubEditor(input1, plugins);
const serverEditor = new StubEditor(input2, plugins);

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
      node_id: 'ddd',
      type: 'insert_text',
      path: [3, 0],
      offset: 8,
      text: ''
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
          <htext id="ddd1">ddddabcd</htext>
        </hp>
      </editor>
    );
    expect(clientEditor.getContent()).toEqual(formatChildren2(output.children));
  });
  it('server editor: execute ops, set_node', () => {
    const remote_op1 = {
      parent_node_id: 'ddd',
      type: 'insert_node',
      path: [3, 1],
      node: { id: 'ddd2', type: 'link', href: 'http://127.0.0.1', title: 'aaa', children: [{ id: 'ddd21', text: 'aaa' }] }
    };

    // enter
    const op1 = decorateOperation(serverEditor.getEditor(), remote_op1);

    const ops = [op1];
    serverEditor.applyOperations(ops);
    // 此处会在默认执行一个插入空文本的操作
    const operationList = serverEditor.getPendingOperationList();
    const executedOps = operationList[0];
    const execOp2 = executedOps[1];

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
          <ha id="ddd2" href="http://127.0.0.1" title="aaa">
            <htext id="ddd21">aaa</htext>
          </ha>
          <htext id={execOp2.node.id}></htext>
        </hp>
      </editor>
    );
    expect(serverEditor.getContent()).toEqual(formatChildren2(output.children));
  });
});

describe('sync operations:insert_text&insert_node', () => {
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
    const operations = remoteOperationList[0];
    const op2 = operations[1];

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
          <ha id="ddd2" href="http://127.0.0.1" title="aaa">
            <htext id="ddd21">aaa</htext>
          </ha>
          <htext id={op2.node.id}></htext>
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

    // get auto generate node id
    const remoteOperationList = serverEditor.getPendingOperationList();
    const operations = remoteOperationList[0];
    const op2 = operations[1];

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
          <htext id="ddd1">ddddabcd</htext>
          <ha id="ddd2" href="http://127.0.0.1" title="aaa">
            <htext id="ddd21">aaa</htext>
          </ha>
          <htext id={op2.node.id}></htext>
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
