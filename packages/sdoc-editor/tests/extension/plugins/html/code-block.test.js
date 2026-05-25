import { deserializeHtml } from '../../../../src/extension/plugins/html/helper';
import { formatChildren } from '../../../core/utils';


describe('deserialize code-block', () => {
  it('pre > code to slate node', () => {
    const html = [
      '<pre>',
      '<code>const seafile = \'seafile\'</code>',
      '</pre>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'const seafile = \'seafile\''
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('pre with div lines to slate node', () => {
    const html = [
      '<pre>',
      '<div>const seafile = \'seafile\';</div>',
      '<div>const sdoc = \'editor\';</div>',
      '</pre>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'const seafile = \'seafile\';'
              }
            ]
          },
          {
            type: 'code_line',
            children: [
              {
                text: 'const sdoc = \'editor\';'
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('pre with br lines to slate node', () => {
    const html = [
      '<pre>',
      'const seafile = \'seafile\';<br>',
      'const sdoc = \'editor\';',
      '</pre>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'const seafile = \'seafile\';'
              }
            ]
          },
          {
            type: 'code_line',
            children: [
              {
                text: 'const sdoc = \'editor\';'
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('pre > code with div lines to slate node', () => {
    const html = [
      '<pre>',
      '<code><div>const seafile = \'seafile\';</div><div>const sdoc = \'editor\';</div></code>',
      '</pre>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          {
            type: 'code_line',
            children: [
              {
                text: 'const seafile = \'seafile\';'
              }
            ]
          },
          {
            type: 'code_line',
            children: [
              {
                text: 'const sdoc = \'editor\';'
              }
            ]
          }
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('pycharm pre with span and br keeps code lines and blank lines', () => {
    const html = [
      '<html><head><meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body>',
      '<div style="background-color:#191a1c;color:#bcbec4"><pre style="font-family:\'JetBrains Mono\',monospace;font-size:9.8pt;">',
      '<span style="color:#c77dbb;">GITHUB_ISSUE_ADDED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'github_issue_added\'<br></span>',
      '<span style="color:#c77dbb;">GITHUB_ISSUE_UPDATED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'github_issue_updated\'<br></span>',
      '<span style="color:#c77dbb;">GITHUB_ISSUE_CLOSED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'github_issue_closed\'<br></span>',
      '<span style="color:#c77dbb;">GITHUB_ISSUE_REOPENED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'github_issue_reopened\'<br></span>',
      '<span style="color:#c77dbb;">GITHUB_ISSUE_COMMENT_ADDED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'github_issue_comment_added\'<br></span>',
      '<span style="color:#c77dbb;">DISCOURSE_TOPIC_ADDED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'discourse_topic_added\'<br></span>',
      '<span style="color:#c77dbb;">DISCOURSE_TOPIC_UPDATED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'discourse_topic_updated\'<br></span>',
      '<span style="color:#c77dbb;">DISCOURSE_TOPIC_REPLY_ADDED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'discourse_topic_reply_added\'<br></span>',
      '<span style="color:#c77dbb;">EMAIL_THREAD_ADDED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'email_thread_added\'<br></span>',
      '<span style="color:#c77dbb;">EMAIL_MESSAGE_ADDED&#32;</span>=&#32;',
      '<span style="color:#6aab73;">\'email_message_added\'</span>',
      '</pre></div></body></html>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          { type: 'code_line', children: [{ text: 'GITHUB_ISSUE_ADDED = \'github_issue_added\'' }] },
          { type: 'code_line', children: [{ text: 'GITHUB_ISSUE_UPDATED = \'github_issue_updated\'' }] },
          { type: 'code_line', children: [{ text: 'GITHUB_ISSUE_CLOSED = \'github_issue_closed\'' }] },
          { type: 'code_line', children: [{ text: 'GITHUB_ISSUE_REOPENED = \'github_issue_reopened\'' }] },
          { type: 'code_line', children: [{ text: 'GITHUB_ISSUE_COMMENT_ADDED = \'github_issue_comment_added\'' }] },
          { type: 'code_line', children: [{ text: 'DISCOURSE_TOPIC_ADDED = \'discourse_topic_added\'' }] },
          { type: 'code_line', children: [{ text: 'DISCOURSE_TOPIC_UPDATED = \'discourse_topic_updated\'' }] },
          { type: 'code_line', children: [{ text: 'DISCOURSE_TOPIC_REPLY_ADDED = \'discourse_topic_reply_added\'' }] },
          { type: 'code_line', children: [{ text: 'EMAIL_THREAD_ADDED = \'email_thread_added\'' }] },
          { type: 'code_line', children: [{ text: 'EMAIL_MESSAGE_ADDED = \'email_message_added\'' }] },
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });

  it('pre with div wrappers preserves blank lines', () => {
    const html = [
      '<pre>',
      '<div>const seafile = \'seafile\';</div>',
      '<div><br></div>',
      '<div>const sdoc = \'editor\';</div>',
      '</pre>'
    ].join('');

    const ret = deserializeHtml(html);
    const exp = [
      {
        type: 'code_block',
        language: 'plaintext',
        children: [
          { type: 'code_line', children: [{ text: 'const seafile = \'seafile\';' }] },
          { type: 'code_line', children: [{ text: '' }] },
          { type: 'code_line', children: [{ text: 'const sdoc = \'editor\';' }] },
        ]
      }
    ];
    expect(formatChildren(ret)).toEqual(exp);
  });
});
