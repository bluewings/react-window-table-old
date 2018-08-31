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

const SHADOW_GRADIENT = 'rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%';

const defaults = {
  width: 6,
  background: {
    top: 'linear-gradient(to bottom, ' + SHADOW_GRADIENT + ')',
    bottom: 'linear-gradient(to top, ' + SHADOW_GRADIENT + ')',
    left: 'linear-gradient(to right, ' + SHADOW_GRADIENT + ')',
    right: 'linear-gradient(to left, ' + SHADOW_GRADIENT + ')',
  
  }
}



class Guideline extends PureComponent {
  
  constructor(props) {
    super(props)
    this.scrollX = 0;
    this.scrollY = 0;
    this.aaaRef = React.createRef();
    this.bbbRef = React.createRef();
  }

  componentDidMount() {
    this.aaa();
  }

  guidelineStyle = memoize((type, distance, length, customStyle) => {
    let styles = {
      position: 'absolute',
      zIndex: 1,
      width: defaults.width,
      height: defaults.width,
      background: defaults.background[type],
      [type]: distance,
      transition: 'opacity 0.2s',
      '&.scroll-0': {
        opacity: 0
      }
    }
    styles[(type === 'top' || type === 'bottom') ? 'width' : 'height'] = length;
    if (typeof customStyle === 'function') {
      styles = customStyle(styles, { type, distance, length });
    }
    return css({
      ...styles,
      [(type === 'top' || type === 'bottom') ? 'width' : 'height']: length,
    });
  })

  update = (abc)=> {
    const { scrollX, scrollY } = abc;
    // console.log(abc);
    // console.log(aaa);
    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.aaa();
    
  }

  aaa = () => {
    if (this.aaaRef.current) {
      let ccc;
      switch (this.props.type) {
        case 'top':
        ccc = this.scrollY
          break;
          case 'bottom':
          ccc = 1 - this.scrollY
          break;
          case 'left':
          ccc = this.scrollX
          break;
          case 'right':
          ccc = 1 - this.scrollX
          break;
      }
      // this.aaaRef.current.innerText = parseInt(ccc * 100, 10) / 100;
      // this.aaaRef.current.innerText = parseInt(ccc * 100, 10) / 100 || 0;
      this.bbbRef.current.classList.remove('scroll-0', 'scroll-100');
      if (isNaN(ccc)) {
        ccc = 0
      }
      if (ccc === 0) {
        this.bbbRef.current.classList.add('scroll-0');
      } else if (ccc === 1) {
        this.bbbRef.current.classList.add('scroll-100');
      }
    }
  }

  render() {
    const { type, distance, length, guidelineStyle } = this.props;
    return (
    <div ref={this.bbbRef} className={this.guidelineStyle(type, distance, length, guidelineStyle)}>
      <div ref={this.aaaRef }/>
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
