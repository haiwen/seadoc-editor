import blackBorder from '../../../../assets/images/black-border.png';
import greyBorder from '../../../../assets/images/grey-border.png';
import noBorder from '../../../../assets/images/no-border.png';

export const IMAGE_DISPLAY_TYPE = [
  {
    text: 'Inline',
    value: 'paragraph',
  },
  {
    text: 'Block',
    value: 'image_block',
  }
];

export const IMAGE_BORDER_TYPE = [
  {
    type: 'none',
    imgUrl: noBorder,
    value: 'none'
  },
  {
    type: 'grey',
    imgUrl: greyBorder,
    value: '2px solid #E5E5E5'
  },
  {
    type: 'black',
    imgUrl: blackBorder,
    value: '2px solid #41464A'
  },
];
