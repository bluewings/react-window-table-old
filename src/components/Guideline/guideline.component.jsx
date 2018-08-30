/* eslint-disable */
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { css } from 'emotion';
import Draggable from 'react-draggable';

// import template from './scrollbar.component.pug';

const getClientRect = (elem) => {
  const rect = elem.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  };
};

const defaults = {
  width: 12,
  background: {
    top: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    bottom: 'linear-gradient(to top, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    left: 'linear-gradient(to right, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
    right: 'linear-gradient(to left, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
  
  }
}



class Guideline extends PureComponent {


  guidelineStyle = memoize((type, distance, length, customStyle) => {
    let styles = {
      position: 'absolute',
      zIndex: 1,
      width: defaults.width,
      height: defaults.width,
      background: defaults.background[type],
      [type]: distance,
    }
    styles[(type === 'top' || type === 'bottom') ? 'width' : 'height'] = length;
    if (typeof customStyle === 'function') {
      styles = customStyle(styles, { type, distance, length });
    }
    return css(styles);
  })

  render() {
    const { type, distance, length, guidelineStyle } = this.props;
    return (
    <div className={this.guidelineStyle(type, distance, length, guidelineStyle)}>
      <div />
    </div>
    )
  }
}

Guideline.propTypes = {
  scrollbarWidth: PropTypes.number,
  minHandleLength: PropTypes.number,
};

Guideline.defaultProps = {
  scrollbarWidth: 40,
  minHandleLength: 40,
};

export default Guideline;
