/* eslint-disable */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { compose, defaultProps, withPropsOnChange } from 'recompose';
// import forwardRef from '../../hoc/forward-ref.hoc';
import Draggable from 'react-draggable';

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

  handleClick = (event) => {

    // console.log(this.trackRef.current, event.target);

    if (this.trackRef.current === event.target) {
      const {
        scaleX,
        handleX,
        type,
        width,
        height,
        overallWidth,
        overallHeight,
        minHandleSize,
      } = this.props;
      const handleSize = this.handleSize(type, width, height, overallWidth, overallHeight, minHandleSize);
      let scale = this.scal2(type, width , height, overallWidth, overallHeight, handleSize);
      console.log(handleSize, scale);

      // let scale = this.scal2(type, width , height, overallWidth, overallHeight, handleSize);
      
      // console.log(handleSize, scale);
      const tRect = event.target.getBoundingClientRect();
      if (this.props.type === 'x') {
        let point = event.clientX - tRect.left - (handleSize / 2);
        if (point < 0) {
          point = 0;
        } else if (point > width - handleSize) {
          point = width - handleSize
        }
        this.props.onScroll({
          scrollLeft: point / scale
        })
      } else {
        let point = event.clientY - tRect.top - (handleSize / 2);
        if (point < 0) {
          point = 0;
        } else if (point > height - handleSize) {
          point = height - handleSize
        }
        this.props.onScroll({
          scrollTop: point / scale
        })
      }

      // console.log(event.target);
      // console.log(this.trackRef.current)

      // console.log(event.clientX - tRect.left, tRect.width);
  
      // console.log(event.pageX, event.clientX, event.offsetX, event.screenX);
    }


  }

  scale = memoize((type, width, height, overallWidth, overallHeight) => {
    return type === 'x' ? Math.min(width / overallWidth, 1) : Math.min(height / overallHeight, 1);
    // return Math.min(this.props.width / this.props.overallWidth, 1)
  })

  handleSize = memoize((type, width, height, overallWidth, overallHeight, minHandleSize) => {



    const scale = type === 'x' ? Math.min(width / overallWidth, 1) : Math.min(height / overallHeight, 1);

    // console.log(Math.min(height / overallHeight, 1));

    let handleSize = (type === 'x' ? width : height) * scale;



    return  Math.max(handleSize, minHandleSize);
    //   size: Math.max(handleSize, minHandleSize),
    //   bias: Math.max(handleSize, minHandleSize) - handleSize,
    // }
    //   bias: Math.max(handleSize, minHandleSize) - handleSize,
    // }
    
  })

  scal2 = memoize((type, width, height, overallWidth, overallHeight, handleSize) => {

    if (type === 'x') {
      return (width - handleSize) / (overallWidth - width) ;
    }
      return (height - handleSize) / (overallHeight - height) ;
    // }
    // return scale;
    

    // return type === 'x' ? Math.min(width / overallWidth, 1) : Math.min(height / overallHeight, 1);
    // return Math.min(this.props.width / this.props.overallWidth, 1)
  })

  left = (scrollLeft, scale) => {
    const key = scrollLeft + '_' + scale;
    if (!this.cache.left[key]) {
      this.cache.left[key] = scrollLeft * scale;
    }
    return this.cache.left[key];

  }

  top = (scrollTop, scale) => {
    const key = scrollTop + '_' + scale;
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
        // left: hRect.left - tRect.left,
        x: hRect.left - tRect.left - data.lastX,
        y: hRect.top - tRect.top - data.lastY,
      }
      
      // console.log('>>>', data)
    }
  }

  handleDrag = (event, data) => {
    

    // this._start = {
    //   left: hRect.left - tRect.left,
    //   x: data.lastX,
    // }
    // console.log(event.pageX, event.clientX, event.offsetX, event.layerX);
    // if (this.trackRef.current && this.handleRef.current) {
    //   const tRect = this.trackRef.current.getBoundingClientRect();
    //   const hRect = this.handleRef.current.getBoundingClientRect();

      const {
        scaleX,
        handleX,
        type,
        width,
        height,
        overallWidth,
        overallHeight,
        minHandleSize,
      } = this.props;
      const handleSize = this.handleSize(type, width, height, overallWidth, overallHeight, minHandleSize);
      let scale = this.scal2(type, width , height, overallWidth, overallHeight, handleSize);

      // console.log(data.lastX - this._start.x);
      // console.log(hRect.left - tRect.left);
      if (this.props.type === 'x') {
        const point = data.lastX - this._start.x
        this.props.onScroll({
          scrollLeft: point / scale
        })
      } else {
        const point = data.lastY - this._start.y
        this.props.onScroll({
          scrollTop: point / scale
        })
      }

    //   console.log(hRect.left - tRect.left);
    //   // console.log(tRect, hRect);
    // }
  }

  handleStop = (event) => {
    // console.log(event);
    delete this._start
  }


  render() {
    const {
      scaleX,
      handleX,
      type,
      width,
      height,
      overallWidth,
      overallHeight,
      minHandleSize,
    } = this.props;

    
    // 
    const handleSize = this.handleSize(type, width, height, overallWidth, overallHeight, minHandleSize);
    let scale = this.scal2(type, width , height, overallWidth, overallHeight, handleSize);

    // console.log(overallWidth, handleSize.bias, overallWidth);
    // const wRate = Math.min(this.props.width / this.props.overallWidth, 1);
    // const hRate = Math.min(this.props.height / this.props.overallHeight, 1);
    // const barWidth = this.props.width * scaleX;
    
    
    // const left = this.state.scrollLeft * scale;

    // scale = (width - handleSize.size) / (overallWidth - width) ;
//     console.log(type, width , height, overallWidth, overallHeight, handleSize);
// console.log(type, handleSize, scale);
// console.log(type, width, height, overallWidth, overallHeight, minHandleSize);
    const left = this.left(this.state.scrollLeft, scale);
    // console.log(this.state.scrollLeft, handleSize.size);

    // const barHeight = this.props.height * scale;
    const top = this.left(this.state.scrollTop, scale);

    const dragProps = {
      axis: this.props.type,
      bounds: 'parent',
      // position: {x: left, y: 0},
      onStart: this.handleStart,
      onDrag: this.handleDrag,
      onStop: this.handleStop,
    };
    if (!this._start) {
      if (this.props.type === 'x') {
        dragProps.position = { x: left, y: 0 }
      } else {
        dragProps.position = { x: 0, y: top }
      }
      // delete dragProps.position
    }
    return (
      <div>
        {this.props.type === 'x' && (
          <div  ref={this.trackRef} onClick={this.handleClick} style={{
            position: 'relative',
            // paddingTop: top,
            // boxSizing: 'content-box',
            height: this.props.scrollbarWidth,
            width,
            background: 'lightgray'
          }}>
          <Draggable 
          {...dragProps}
          >
          <div
            ref={this.handleRef}
            style={{
            position: 'absolute',
            // left,
          // transform: 'translate(' + left + 'px, 0px)',
 width: handleSize, height: this.props.scrollbarWidth, background: 'green',
}}
          />
          </Draggable>
          </div>
        )}
        {this.props.type === 'y' && (
          <div  ref={this.trackRef} onClick={this.handleClick} style={{
            position: 'relative',
            // paddingTop: top,
            // boxSizing: 'content-box',
            width: this.props.scrollbarWidth,
            height: height,
            background: 'yellow'
          }}>
          <Draggable 
          {...dragProps}
          >
          <div
            ref={this.handleRef}
            style={{
            position: 'absolute',
            // top: top,
 height: handleSize, width: this.props.scrollbarWidth, background: 'green',
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
  minHandleSize: PropTypes.number,
  // fieldValue: ImmutablePropTypes.list,
  // readOnly: PropTypes.bool.isRequired,
  // onChange: PropTypes.func,
  // onFocus: PropTypes.func,
  // onBlur: PropTypes.func,
  // renderer: ImmutablePropTypes.map.isRequired,
};

Scrollbar.defaultProps = {
  scrollbarWidth: 40,
  minHandleSize: 100,
  // onFocus: () => {},
  // onBlur: () => {},
  // fieldValue: List(['']),
};

export default Scrollbar;
