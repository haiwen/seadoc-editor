import { mdStringToSlate } from '../../../src';
import { formatChildren } from '../../core';

describe('header test', () => {
  it('header', () => {
    const mdString = '# header1 \n## header2 \n### header3 \n#### header4 \n##### header5 \n###### header6';
    const nodes = mdStringToSlate(mdString);
    const expectResult = [
      {
        type: 'header1',
        children: [
          { text: 'header1' },
        ]
      },
      {
        type: 'header2',
        children: [
          { text: 'header2' },
        ]
      },
      {
        type: 'header3',
        children: [
          { text: 'header3' },
        ]
      },
      {
        type: 'header4',
        children: [
          { text: 'header4' },
        ]
      },
      {
        type: 'header5',
        children: [
          { text: 'header5' },
        ]
      },
      {
        type: 'header6',
        children: [
          { text: 'header6' },
        ]
      },
    ];

    expect(formatChildren(nodes)).toEqual(expectResult);
  });
});
