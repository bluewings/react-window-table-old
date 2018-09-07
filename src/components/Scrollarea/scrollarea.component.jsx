/* eslint-disable react/prop-types, no-underscore-dangle, react/no-unused-state */
import React, { PureComponent } from 'react';
import { compose, defaultProps } from 'recompose';
// import sampleImg from './sample.png';


// jsx, styles
import template from './scrollarea.component.pug';

class Scrollarea extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { fieldValue: {}, y: 0, x: 0 };
    this.state = { fieldValue: {}, y: 0, x: 0 };
    this.bumperRef = React.createRef();
    this.shimRef = React.createRef();
    this.scrollWrapRef = React.createRef();
    this.scrollContentRef = React.createRef();
  }

  componentDidMount() {
    if (this.bumperRef.current && this.scrollWrapRef.current) {
      this.scrollWrapRef.current.style.width = this.bumperRef.current.style.width;
    }
    // window.addEventListener('wheel', (event) => {
    //   // // console.log(event);
    //   // console.log('wheel', event);
    //   event.preventDefault();
    //   // event.preventDefault();
    //   // event.stopPropagation();
    //   return false;
    // });
    // window.addEventListener('mousewheel', (event) => {
    //   // console.log('mousewheel', event);
    //   // event.preventDefault();
    //   // event.stopPropagation();
    //   // return false;
    // });
  }

  componentDidUpdate() {
    if (this.bumperRef.current && this.scrollWrapRef.current) {
      // // console.log(this.bumperRef.current.style.width);
      this.scrollWrapRef.current.style.width = `${this.bumperRef.current.getBoundingClientRect().width}px`;
    }
  }

  handleValueChange = (fieldValue) => {
    this.setState({ fieldValue });
  }

  // handleTouchstart = (event) => {
  //   // console.log('%c touchstart', 'background:yellow');
  //   // console.log(event);
  // }

  handleMousewheel = (event) => {
    // // console.log(this.scrollContent)

    // var wheelDistance = function(evt){
    //   if (!evt) evt = event;
    //   var w=evt.wheelDelta, d=evt.detail;
    //   if (d){
    //     if (w) return w/d/40*d>0?1:-1; // Opera
    //     else return -d/3;              // Firefox;         TODO: do not /3 for OS X
    //   } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
    // };
    // // console.log(event.deltaX, event.deltaY);
    const contentHeight = this.props.contentHeight ||
      this.scrollContentRef.current.getBoundingClientRect().height;
    const scrollHeight = this.scrollWrapRef.current.getBoundingClientRect().height -
      contentHeight;

    const contentWidth = this.props.contentWidth ||
      this.scrollContentRef.current.getBoundingClientRect().height;

    const scrollWidth = Math.min(this.scrollWrapRef.current.getBoundingClientRect().width -
    contentWidth, 0);

    let { deltaX, deltaY } = event;

    const _deltaX = Math.abs(deltaX);
    const _deltaY = Math.abs(deltaY);
    if (_deltaX > _deltaY * 1.5) {
      deltaY = 0;
    } else if (_deltaY > _deltaX * 1.5) {
      deltaX = 0;
    }

    // if (Math.abs(deltaX > 0 ?))
    // if (Math.ab)


    let { x, y } = this.state;
    y -= deltaY;
    if (y > 0) {
      y = 0;
    }
    // // console.log(y, scrollHeight);
    if (y < scrollHeight) {
      y = scrollHeight;
    }

    x -= deltaX;
    if (x > 0) {
      x = 0;
    }
    // // console.log(y, scrollHeight);
    if (x < scrollWidth) {
      x = scrollWidth;
    }
    // // console.log(x, y, scrollWidth);

    // const _x = Math.abs(event.deltaX);
    // const _y = Math.abs(event.deltaY);
    // // console.log(_y / _x)
    // console.log(x, y);

    if (y !== this.state.y || x !== this.state.x) {
      // // console.log('>>> moving...');
      // this.state.x = x;
      // this.state.y = y;
      event.preventDefault();
      event.stopPropagation();
      this.setState(prevState => ({
        ...prevState,
        y,
        x,
      }));
      if (typeof this.props.onScroll === 'function') {
        // requestAnimationFrame(() => {
        this.props.onScroll({ x, y });
        // });
      }
    }
    // else if (_y / _x < 0.5) {
    //   // 가로 이동이다!!!
    //   // console.log('>>> 가로 이동임....');
    //   // event.preventDefault();
    //   // event.stopPropagation();
    //   // return false;
    // }
    // return undefined;
    // event.preventDefault();
    // event.stopPropagation();
  }

  render() {
    const {
      width, height,
    } = this.props;
    const {
      fieldValue,
      x,
      y,
    } = this.state;

    const scrollWrapStyle = {
      width, height,
    };

    return template.call(this, {
      // variables
      unused_fieldValue: fieldValue,
      scrollWrapStyle,
      unused_x: x,
      unused_y: y,
    });
  }
}

const enhance = compose(defaultProps({
  width: 500,
  height: 400,
  contentWidth: null,
  contentHeight: null,
}));


export default enhance(Scrollarea);
