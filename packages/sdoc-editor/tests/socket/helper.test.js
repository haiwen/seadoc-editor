import { getNodePathById } from '../../src/socket/helpers';

export const content = {
  version: 0,
  children: [
    {
      id: '6B58B498-C697-84EF-73E3-244E6DDB3E30',
      type: 'paragraph',
      children: [
        {
          id: 'add-edd',
          text: 'With Slate you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
        },
      ],
    },
    {
      id: '563AD53A-98EA-A004-2E2D-9D9DB0BCE08A',
      type: 'check-list-item',
      checked: true,
      children: [
        {
          id: 'E0566E8D-EFF0-7711-764E-653A922FECFD',
          text: 'Slide to the left.',
        },
      ],
    },
    {
      id: '229F15AF-A340-4410-6B61-226EB20C5CEF',
      type: 'check-list-item',
      checked: true,
      children: [
        {
          id: 'FCC2F814-AE94-3DB1-AF2C-BFC8752D33A8',
          text: 'Slide to the right.',
        },
      ],
    },
    {
      id: '4442C405-E553-31D5-D14E-D63FCAABAB92',
      type: 'check-list-item',
      checked: false,
      children: [
        {
          id: '56EE0CF4-C388-8B9F-AF05-DF9178D64708',
          text: 'Criss-cross.',
        },
      ],
    },
    {
      id: '0F552D81-2CE1-3FD5-43B9-70545A673579',
      type: 'check-list-item',
      checked: true,
      children: [
        {
          id: 'F8C1F381-8DA3-178B-1272-84D4B99DA79E',
          text: 'Criss-cross!',
        },
      ],
    },
    {
      id: '582F309C-8A4B-181E-F804-D5B9B87A610F',
      type: 'check-list-item',
      checked: false,
      children: [
        {
          id: 'E154E286-FFE5-4F1D-B80C-15AFB798826A',
          text: 'Cha cha real smooth…',
        },
      ],
    },
    {
      id: 'BA49CB84-5BEB-F939-52CC-D6B48D2460DB',
      type: 'check-list-item',
      checked: false,
      children: [
        {
          id: 'F9A2C2EF-1BCB-91D6-2432-97CF73F66AB6',
          text: 'Let\'s go to work!',
        },
      ],
    },
    {
      id: '65D7AD06-F80C-C03B-F0A9-C10D23C775A8',
      type: 'paragraph',
      children: [
        {
          id: '697DD837-CC59-D567-1AA2-8FFDAECE6537',
          text: 'Try it out for yourself!',
        },
      ],
    },
    {
      type: 'ordered_list',
      children: [
        {
          type: 'list-item',
          children: [
            {
              id: 'GBg1ZUG-T5e35CdST1UF1A',
              type: 'list-lic',
              children: [
                {
                  id: 'Zs_MmRdmT36Uy6S8HCJgMg',
                  text: 'adfdfa',
                },
              ],
            },
          ],
          id: 'WNEAcyFnSsmTJxQhm1z4rg',
        },
      ],
      id: 'V1V5YhnzTaW-BA5zIY3AJg',
    },
  ],
};

describe('test get node path by id', () => {
  it('get parent', () => {
    const output = [0];
    const nodeId = '6B58B498-C697-84EF-73E3-244E6DDB3E30';
    const input = getNodePathById(content, nodeId);

    expect(input).toEqual(output);
  });

  it('get child', () => {
    const output = [0, 0];
    const nodeId = 'add-edd';
    const input = getNodePathById(content, nodeId);

    expect(input).toEqual(output);
  });

  it('get list child: list-item', () => {
    const output = [8, 0];
    const nodeId = 'WNEAcyFnSsmTJxQhm1z4rg';
    const input = getNodePathById(content, nodeId);

    expect(input).toEqual(output);
  });

  it('get list child: list-lic', () => {
    const output = [8, 0, 0];
    const nodeId = 'GBg1ZUG-T5e35CdST1UF1A';
    const input = getNodePathById(content, nodeId);

    expect(input).toEqual(output);
  });

  it('get list child: list-text', () => {
    const output = [8, 0, 0, 0];
    const nodeId = 'Zs_MmRdmT36Uy6S8HCJgMg';
    const input = getNodePathById(content, nodeId);

    expect(input).toEqual(output);
  });
});
