import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const Svg = ({ t, isSelected, imageRef }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 360 360'
      preserveAspectRatio='xMinYMin meet'
      className={classNames('sdoc-image-placeholder-wrapper', { 'image-selected': isSelected })}
      ref={imageRef}
      draggable={false}
    >
      <rect
        width='100%'
        height='100%'
        fill='#f0f0f0'
      />
      <g
        className='sdoc-image-content-wrapper'
        transform='translate(180, 180) scale(1)'
      >
        <g className='sdoc-image-title' transform='translate(0, 0)'
        >
          <foreignObject x='-85' y='-16' width='20' height='28'>
            <div className='sdocfont sdoc-exclamation-circle'>
            </div>
          </foreignObject>
          <text className='sdoc-image-tip-title'
            transform='translate(-55, 4)'
            fontSize='20'
            fill='red'
            fontFamily='Arial, sans-serif'
          >
            {t('Image_copy_error')}
          </text>
        </g>
        <text className='sdoc-image-tip-content'
          transform='translate(0, 35)'
          fontSize='12'
          textAnchor='middle'
          fill='black'
          fontFamily='Arial, sans-serif'
        >
          {t('Image_cannot_be_copied_Please_download_the_source_image')}
        </text>
        <text className='sdoc-image-tip-content'
          transform='translate(0, 55)'
          fontSize='12'
          textAnchor='middle'
          fill='black'
          fontFamily='Arial, sans-serif'
        >
          {t('And_select_insert_-_image_to_upload')}
        </text>
      </g>
    </svg>
  );
};

Svg.propTypes = {
  t: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
  imageRef: PropTypes.object.isRequired,
};

export default Svg;
