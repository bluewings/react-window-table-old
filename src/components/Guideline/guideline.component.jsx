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
    }
    styles[(type === 'top' || type === 'bottom') ? 'width' : 'height'] = length;
    if (typeof customStyle === 'function') {
      styles = customStyle(styles, { type, distance, length });
    }
    return css(styles);
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
      this.aaaRef.current.innerText = parseInt(ccc * 100, 10) / 100;
      this.bbbRef.current.classList.remove('no-scroll', 'full-scroll');
      if (ccc === 0) {
        this.bbbRef.current.classList.add('no-scroll');
      } else if (ccc === 1) {
        this.bbbRef.current.classList.add('full-scroll');
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
