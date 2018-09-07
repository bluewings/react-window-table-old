/* eslint-disable react/prop-types, no-underscore-dangle, react/no-unused-state */
import React, { PureComponent } from 'react';
import { compose, defaultProps } from 'recompose';
// import sampleImg from './sample.png';


// jsx, styles
import template from './scrollarea.component.pug';

class Scrollarea extends PureComponent {
  constructor(props) {
    super(props);
    // this.state = { fieldValue: {}, scrollTop: 0, scrollLeft: 0 };
    this.state = { scrollTop: 0, scrollLeft: 0 };
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
    //   // // // console.log(event);
    //   // // console.log('wheel', event);
    //   event.preventDefault();
    //   // event.preventDefault();
    //   // event.stopPropagation();
    //   return false;
    // });
    // window.addEventListener('mousewheel', (event) => {
    //   // // console.log('mousewheel', event);
    //   // event.preventDefault();
    //   // event.stopPropagation();
    //   // return false;
    // });
  }

  componentDidUpdate() {
    // console.log('www');
    if (this.bumperRef.current && this.scrollWrapRef.current) {
      // // // console.log(this.bumperRef.current.style.width);
      this.scrollWrapRef.current.style.width = `${this.bumperRef.current.getBoundingClientRect().width}px`;
    }
  }

  handleValueChange = (fieldValue) => {
    this.setState({ fieldValue });
  }

  // handleTouchstart = (event) => {
  //   // // console.log('%c touchstart', 'background:yellow');
  //   // // console.log(event);
  // }

  handleMousewheel = (event) => {
    // // // console.log(this.scrollContent)

    // var wheelDistance = function(evt){
    //   if (!evt) evt = event;
    //   var w=evt.wheelDelta, d=evt.detail;
    //   if (d){
    //     if (w) return w/d/40*d>0?1:-1; // Opera
    //     else return -d/3;              // Firefox;         TODO: do not /3 for OS X
    //   } else return w/120;             // IE/Safari/Chrome TODO: /3 for Chrome OS X
    // };
    // // // console.log(event.deltaX, event.deltaY);
    const contentHeight = this.props.contentHeight ||
      this.scrollContentRef.current.getBoundingClientRect().height;
    const scrollHeight = contentHeight - this.scrollWrapRef.current.getBoundingClientRect().height;

    const contentWidth = this.props.contentWidth ||
      this.scrollContentRef.current.getBoundingClientRect().width;

    const scrollWidth = Math.max(contentWidth -
      this.scrollWrapRef.current.getBoundingClientRect().width, 0);

    let { deltaX, deltaY } = event;

    // deltaX *= 1.2;
    // deltaY *= 1.2;


    const _deltaX = Math.abs(deltaX);
    const _deltaY = Math.abs(deltaY);
    if (_deltaX > _deltaY * 1.5) {
      deltaY = 0;
    } else if (_deltaY > _deltaX * 1.5) {
      deltaX = 0;
    }

    // if (Math.abs(deltaX > 0 ?))
    // if (Math.ab)


    let { scrollLeft, scrollTop } = this.props;
    scrollTop += deltaY;
    if (scrollTop < 0) {
      scrollTop = 0;
    }
    // // // console.log(scrollTop, scrollHeight);
    if (scrollTop > scrollHeight) {
      scrollTop = scrollHeight;
    }


    scrollLeft += deltaX;

    // console.log(scrollLeft, scrollWidth);
    if (scrollLeft < 0) {
      scrollLeft = 0;
    }
    // // // console.log(scrollTop, scrollHeight);
    if (scrollLeft > scrollWidth) {
      scrollLeft = scrollWidth;
    }
    // // // console.log(scrollLeft, scrollTop, scrollWidth);

    // const _scrollLeft = Math.abs(event.deltaX);
    // const _scrollTop = Math.abs(event.deltaY);
    // // // console.log(_scrollTop / _scrollLeft)
    // // console.log(scrollLeft, scrollTop);

    if (scrollTop !== this.state.scrollTop || scrollLeft !== this.state.scrollLeft) {
      // // // console.log('>>> moving...');
      // this.state.scrollLeft = scrollLeft;
      // this.state.scrollTop = scrollTop;
      event.preventDefault();
      event.stopPropagation();

      if (typeof this.props.onScroll === 'function') {
        // requestAnimationFrame(() => {
        // // console.log(scrollTop * -1);
        // console.log(scrollLeft, scrollTop);
        this.props.onScroll({ scrollLeft, scrollTop });
        // });
      }
      this.setState(prevState => ({
        ...prevState,
        scrollTop,
        scrollLeft,
      }));
    }
    // else if (_scrollTop / _scrollLeft < 0.5) {
    //   // 가로 이동이다!!!
    //   // // console.log('>>> 가로 이동임....');
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
      scrollLeft,
      scrollTop,
    } = this.state;

    const scrollWrapStyle = {
      width, height,
    };

    return template.call(this, {
      // variables
      unused_fieldValue: fieldValue,
      unused_scrollLeft: scrollLeft,
      unused_scrollTop: scrollTop,
      scrollWrapStyle,
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
