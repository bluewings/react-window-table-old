/* eslint-disable */
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { css } from 'emotion';
import Draggable from 'react-draggable';

import template from './scrollbar.component.pug';

class Scrollbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { scrollTop: 0, scrollLeft: 0 };
    this.trackRef = React.createRef();
    this.handleRef = React.createRef();
    this.cache = {
      left: {}, top: {},
    };
  }
  
  scrollTo = ({ scrollTop, scrollLeft }) => {
    this.setState(prevState => ({
      ...prevState,
      scrollTop,
      scrollLeft,
    }));
  }

  trackStyle = memoize((axis, trackLength, trackWidth) => {
    const styles = {
      position: 'relative',
      width: axis === 'x' ? trackLength : trackWidth,
      height: axis === 'x' ? trackWidth : trackLength,
      background: 'lightgray',
    };
    return css(styles);
  })

  handleStyle = memoize((axis, handleLength, trackWidth) => {
    const styles = {
      width: axis === 'x' ? handleLength : trackWidth,
      height: axis === 'x' ? trackWidth : handleLength,
      background: 'green',
    };
    return css(styles);
  })

  _handleLength = memoize((scrollLength, scrollbarLength, minHandleLength) => {
    const scale = Math.min(scrollbarLength / scrollLength, 1);
    return Math.max(scrollbarLength * scale, minHandleLength);
  })

  handleLength = () => {
    const { scrollLength, scrollbarLength, minHandleLength } = this.props;
    return this._handleLength(scrollLength, scrollbarLength, minHandleLength);
  }

  _scale = memoize((scrollLength, scrollbarLength, handleLength) => 
    (scrollbarLength - handleLength) / (scrollLength - scrollbarLength))

  scale = () => {
    const { scrollLength, scrollbarLength } = this.props;
    return this._scale(scrollLength, scrollbarLength, this.handleLength());
  }

  handleClick = (event) => {
    if (this.trackRef.current === event.target) {
      const {
        scaleX,
        handleX,
        axis,
        width,
        height,
        overallWidth,
        overallHeight,
        minHandleLength,
      } = this.props;
      const handleSize = this.handleLength();
      const scale = this.scale();
      console.log(handleSize, scale);

      // let scale = this.scale();
      
      // console.log(handleSize, scale);
      const tRect = event.target.getBoundingClientRect();
      if (this.props.axis === 'x') {
        let point = event.clientX - tRect.left - (handleSize / 2);
        if (point < 0) {
          point = 0;
        } else if (point > width - handleSize) {
          point = width - handleSize;
        }
        this.props.onScroll({
          scrollLeft: point / scale,
        });
      } else {
        let point = event.clientY - tRect.top - (handleSize / 2);
        if (point < 0) {
          point = 0;
        } else if (point > height - handleSize) {
          point = height - handleSize;
        }
        this.props.onScroll({
          scrollTop: point / scale,
        });
      }
    }
  }

  left = (scrollLeft, scale) => {
    const key = `${scrollLeft}_${scale}`;
    if (!this.cache.left[key]) {
      this.cache.left[key] = scrollLeft * scale;
    }
    return this.cache.left[key];
  }

  top = (scrollTop, scale) => {
    const key = `${scrollTop}_${scale}`;
    if (!this.cache.top[key]) {
      this.cache.top[key] = scrollTop * scale;
    }
    return this.cache.top[key];
  }

  handleStart = (event, data) => {
    if (this.trackRef.current && this.handleRef.current) {
      const tRect = this.trackRef.current.getBoundingClientRect();
      const hRect = this.handleRef.current.getBoundingClientRect();
      this._start = {
        x: hRect.left - tRect.left - data.lastX,
        y: hRect.top - tRect.top - data.lastY,
      };
    }
  }

  handleDrag = (event, data) => {

    const {
      scaleX,
      handleX,
      axis,
      width,
      height,
      overallWidth,
      overallHeight,
      minHandleLength,
    } = this.props;
    // const handleSize = this.handleLength();
    const scale = this.scale();

    // console.log(data.lastX - this._start.x);
    // console.log(hRect.left - tRect.left);
    if (this.props.axis === 'x') {
      const point = data.lastX - this._start.x;
      this.props.onScroll({
        scrollLeft: point / scale,
      });
    } else {
      const point = data.lastY - this._start.y;
      this.props.onScroll({
        scrollTop: point / scale,
      });
    }

    //   console.log(hRect.left - tRect.left);
    //   // console.log(tRect, hRect);
    // }
  }

  handleStop = (event) => {
    // console.log(event);
    delete this._start;
  }


  render() {
    const {
      // scaleX,
      // handleX,
      // axis,
      width,
      height,
      // overallWidth,
      // overallHeight,
      // minHandleLength,
    } = this.props;

    
    // 
    const handleSize = this.handleLength();
    const scale = this.scale();

    // console.log(overallWidth, handleSize.bias, overallWidth);
    // const wRate = Math.min(this.props.width / this.props.overallWidth, 1);
    // const hRate = Math.min(this.props.height / this.props.overallHeight, 1);
    // const barWidth = this.props.width * scaleX;
    
    
    // const left = this.state.scrollLeft * scale;

    // scale = (width - handleSize.size) / (overallWidth - width) ;
    //     console.log(axis, width , height, overallWidth, overallHeight, handleSize);
    // console.log(axis, handleSize, scale);
    // console.log(axis, width, height, overallWidth, overallHeight, minHandleLength);
    const left = this.left(this.state.scrollLeft, scale);
    // console.log(this.state.scrollLeft, handleSize.size);

    // const barHeight = this.props.height * scale;
    const top = this.left(this.state.scrollTop, scale);

    const dragProps = {
      axis: this.props.axis,
      bounds: 'parent',
      // position: {x: left, y: 0},
      onStart: this.handleStart,
      onDrag: this.handleDrag,
      onStop: this.handleStop,
    };
    if (!this._start) {
      if (this.props.axis === 'x') {
        dragProps.position = { x: left, y: 0 };
      } else {
        dragProps.position = { x: 0, y: top };
      }
      // delete dragProps.position
    }

    const trackStyle = this.trackStyle(this.props.axis, this.props.scrollbarLength, this.props.scrollbarWidth);

    const handleStyle = this.handleStyle(this.props.axis, handleSize, this.props.scrollbarWidth);

    return template.call(this, {
      // variables
      dragProps,
      handleStyle,
      trackStyle,
      // components
      Draggable,
      Fragment,
    });


    return (
      <div>
        {this.props.axis === 'x' && (
          <div
            ref={this.trackRef}
            onClick={this.handleClick}
            style={{
            position: 'relative',
            height: this.props.scrollbarWidth,
            width,
            background: 'lightgray',
          }}
          >
            <Draggable 
              {...dragProps}
            >
              <div
                ref={this.handleRef}
                style={{
            position: 'absolute',
 width: handleSize,
height: this.props.scrollbarWidth,
background: 'green',
}}
              />
            </Draggable>
          </div>
        )}
        {this.props.axis === 'y' && (
          <div
            ref={this.trackRef}
            onClick={this.handleClick}
            style={{
            position: 'relative',
            // paddingTop: top,
            // boxSizing: 'content-box',
            width: this.props.scrollbarWidth,
            height,
            background: 'yellow',
          }}
          >
            <Draggable 
              {...dragProps}
            >
              <div
                ref={this.handleRef}
                style={{
            position: 'absolute',
            // top: top,
 height: handleSize,
width: this.props.scrollbarWidth,
background: 'green',
}}
              />
            </Draggable>
          </div>
        )}


        {/* <pre>
        {JSON.stringify(this.props)}
        {JSON.stringify(this.state)}
        </pre> */}
      </div>
    );
  }
}

// const enhance = compose(
//   forwardRef('outer'),
//   defaultProps({
//     scrollbarWidth: 20
//   }),
//   withPropsOnChange(['width', 'overallWidth'], ({ width, overallWidth }) => {
//     const scaleX = Math.min(width / overallWidth, 1);
//     console.log(width, overallWidth, scaleX);
//     const handleX = parseInt(width * scaleX, 10);

//     return {
//       scaleX,
//       handleX
//     };
//   }),
//   forwardRef('inner'),
// )

Scrollbar.propTypes = {
  scrollbarWidth: PropTypes.number,
  minHandleLength: PropTypes.number,
  // fieldValue: ImmutablePropTypes.list,
  // readOnly: PropTypes.bool.isRequired,
  // onChange: PropTypes.func,
  // onFocus: PropTypes.func,
  // onBlur: PropTypes.func,
  // renderer: ImmutablePropTypes.map.isRequired,
};

Scrollbar.defaultProps = {
  scrollbarWidth: 40,
  minHandleLength: 40,
  // onFocus: () => {},
  // onBlur: () => {},
  // fieldValue: List(['']),
};

export default Scrollbar;
