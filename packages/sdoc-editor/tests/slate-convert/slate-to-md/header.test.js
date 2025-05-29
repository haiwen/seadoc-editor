import { formatSlateToMd } from '../../../src/slate-convert/slate-to-md/transform';

describe('header test', () => {
  it('header', () => {
    const nodes = [
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

    const expectResult = [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: 'header1'
          },
        ]
      },
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'header2'
          },
        ]
      },
      {
        type: 'heading',
        depth: 3,
        children: [
          {
            type: 'text',
            value: 'header3'
          },
        ]
      },
      {
        type: 'heading',
        depth: 4,
        children: [
          {
            type: 'text',
            value: 'header4'
          },
        ]
      },
      {
        type: 'heading',
        depth: 5,
        children: [
          {
            type: 'text',
            value: 'header5'
          },
        ]
      },
      {
        type: 'heading',
        depth: 6,
        children: [
          {
            type: 'text',
            value: 'header6'
          },
        ]
      },
    ];

    expect(formatSlateToMd(nodes)).toEqual(expectResult);
  });
});
