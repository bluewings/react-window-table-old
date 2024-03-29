/* eslint-disable */
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
// import { css } from 'emotion';
import { Map } from 'immutable';
import { compose, withPropsOnChange } from 'recompose';
import Draggable from 'react-draggable';
import forwardRef from '../../hocs/forward-ref.hoc';
import {
  scrollbarTrackStyle,
  scrollbarHandleStyle,
  defaultScrollbarClassNames,
} from '../../styles';

import template from './scrollbar.component.pug';

const THROTTLED_SCROLL = 100;

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

// const scrollbarTrackStyle = ({
//   axis, handleLength, trackWidth,
//   width, height,
// }) => {
//   let styles = {
//     position: 'relative',
//     width,
//     height,
//     // background: 'rgba(0, 0, 0, .1)',
//     // background: '#f9f9f9',
//     overflow: 'hidden',
//     boxSizing: 'border-box',
//   };
//   if (axis === 'x') {
//     styles.borderTop = '1px solid #e5e5e5';
//     styles.borderTop = '1px solid #cacaca';
//   } else {
//     styles.borderLeft = '1px solid #cacaca';
//   }

//   return styles;
// };

// const scrollbarHandleStyle = ({
//   axis, handleLength, trackWidth,
//   width, height,
// }) => {
//   return {
//     // ...base,
//     background: 'transparent',
//     // background: 'red',

//     '> div': {
//       position: 'absolute',
//       display: 'block',
//       top: 3,
//       left: 3,
//       right: 4,
//       bottom: 4,
//       pointerEvent: 'none',
//       // margin: 3,
//       borderRadius: ((height - 6) / 2) + 'px',
//       // background: 'red',
//       transition: 'background 0.2s',
//       // background: 'rgba(204,204,204,0.4)',
//       // background: 'rgba(204,204,204,0.4)',
//       // background: 'rgba(0,0,0,0.25)',
//       // background: '#c2c2c2',
//       background: '#c0c0c0',

//       '&:hover': {
//         background: '#7b7b7b',
//         // boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
//       }
//     },
//     '&.dragging > div': {
//       // background: 'blue',
//       // background: 'rgba(204,204,204,0.8)',
//       // background: 'rgba(0,0,0,0.5)',
//       background: '#7b7b7b',
//       // boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
//     },
//   }
// }

class Scrollbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { scrollTop: 0, scrollLeft: 0, status: null };
    this.trackRef = React.createRef();
    this.handleRef = React.createRef();
    this.cache = {};
    this.scrollInfo = Map();
  }

  scrollTo = ({ scrollTop, scrollLeft }) => {
    this.setState(prevState => ({ ...prevState, scrollTop, scrollLeft }));
  };

  trackStyle = memoize((classNames, axis, trackLength, trackWidth, customStyleFn) =>
    scrollbarTrackStyle({
      classNames,
      axis,
      trackLength,
      trackWidth,
      customStyleFn,
    }),

    // // , scrollbarHandleStyle
    // const width = axis === 'x' ? trackLength : trackWidth;
    // const height = axis === 'x' ? trackWidth : trackLength;
    // let styles = scrollbarTrackStyle({
    //   axis, trackLength, trackWidth,
    //   width, height,
    // })
    // if (typeof customStyleFn === 'function') {
    //   styles = customStyleFn(styles, { axis, trackLength, trackWidth });
    // }
    // return css({
    //   ...styles,
    //   position: 'relative',
    //   width,
    //   height,
    // });
  );

  handleStyle = memoize((classNames, axis, handleLength, trackWidth, customStyleFn) =>
    scrollbarHandleStyle({
      classNames,
      axis,
      handleLength,
      trackWidth,
      customStyleFn,
    }),
    // const width = axis === 'x' ? handleLength : trackWidth;
    // const height = axis === 'x' ? trackWidth : handleLength;
    // let styles = scrollbarHandleStyle({
    //   axis, handleLength, trackWidth,
    //   width, height,
    // })
    // // const width = axis === 'x' ? handleLength : trackWidth;
    // // const height = axis === 'x' ? trackWidth : handleLength;
    // // let styles = {
    // //   width,
    // //   height,
    // //   background: 'green',
    // // };
    // if (typeof customStyleFn === 'function') {
    //   styles = customStyleFn(styles, { axis, handleLength, trackWidth });
    // }
    // return css({
    //   ...styles,
    //   width,
    //   height,
    // });
  );

  _handleLength = memoize((scrollLength, scrollbarLength, minHandleLength) => {
    const scale = Math.min(scrollbarLength / scrollLength, 1);
    return Math.max(scrollbarLength * scale, minHandleLength);
  });

  handleLength = () => {
    const { scrollLength, scrollbarLength, minHandleLength } = this.props;
    return this._handleLength(scrollLength, scrollbarLength, minHandleLength);
  };

  _scale = memoize((scrollLength, scrollbarLength, handleLength) =>
    (scrollbarLength - handleLength) / (scrollLength - scrollbarLength));

  scale = () => {
    const { scrollLength, scrollbarLength } = this.props;
    return this._scale(scrollLength, scrollbarLength, this.handleLength());
  };

  _scrollTo = (point, eventType) => {
    let data = { eventType };
    if (point !== null) {
      const { axis, scrollbarLength } = this.props;
      const handleSize = this.handleLength();
      const scale = this.scale();
      if (point < 0) {
        point = 0;
      } else if (point > scrollbarLength - handleSize) {
        point = scrollbarLength - handleSize;
      }
      point = Math.round(point / scale);
      if (axis === 'x') {
        data = { ...data, scrollLeft: point };
      } else {
        data = { ...data, scrollTop: point };
      }
    }
    // if (typeof this.props.onScroll === 'function') {
    this.handleThrottledScroll(data);
    this.props.onScroll(data);
    // }
    // this.props.onScroll(data);
  };


  handleThrottledScroll = (scrollInfo) => {
    const { throttle } = this.props;
    clearTimeout(this._clearScrollId);
    this.throttledScrollInfo = scrollInfo;
    if (!this._scrollId) {
      this._scrollId = setInterval(this.throttledScroll, throttle);
      this._scrollCount = 0;
      this._scrollStart = {
        time: new Date(),
        scrollTop: this.scrollInfo.get('scrollTop'),
        scrollLeft: this.scrollInfo.get('scrollLeft'),
      };
      this.throttledScroll();
    }
    this._clearScrollId = setTimeout(() => {
      clearInterval(this._scrollId);
      this.throttledScroll();
      delete this._scrollId;
      this.props.onThrottledScroll({
        scrollTop: this.scrollInfo.get('scrollTop'),
        scrollLeft: this.scrollInfo.get('scrollLeft'),
      });
    }, throttle + 50);
  };

  throttledScroll = () => {
    if (this.throttledScrollInfo) {
      // if (typeof this.props.onThrottledScroll === 'function') {
      // const scrollTop = this.throttledScrollInfo.get('scrollTop');
      // const scrollLeft = this.throttledScrollInfo.get('scrollLeft');
      const scrollTop = this.throttledScrollInfo.scrollTop;
      const scrollLeft = this.throttledScrollInfo.scrollLeft;
      this.props.onThrottledScroll({ scrollLeft, scrollTop });
      // }
      delete this.throttledScrollInfo;
      this._scrollCount += 1;
    }
  };

  handleClick = (event) => {
    if (this.trackRef.current === event.target) {
      const { axis } = this.props;
      const { top, left } = getClientRect(this.trackRef.current);
      const point =
        (axis === 'x' ? event.clientX - left : event.clientY - top) -
        this.handleLength() / 2;
      this._scrollTo(point);
    }
  };

  scaled = (point) => {
    const scale = this.scale();
    const key = `${scale}_${point}`;
    if (!this.cache[key]) {
      this.cache[key] = point * scale;
    }
    return this.cache[key];
  };

  handleDragStart = (event, { lastX, lastY }) => {
    // console.log('%c handleDragStart ', 'color:red');
    if (!this.trackRef.current || !this.handleRef.current) {
      return;
    }
    const track = getClientRect(this.trackRef.current);
    const handle = getClientRect(this.handleRef.current);
    this._ondrag = {
      x: handle.left - track.left - lastX,
      y: handle.top - track.top - lastY,
    };
    this._scrollTo(null, 'dragstart');
    // this.updateStatus('dragst')
  };

  updateStatus = (status) => {
    if (this.state.status !== status) {
      this.setState(prevState => ({
        ...prevState,
        status,
      }));
    }
  };

  handleDrag = (event, { lastX, lastY }) => {
    if (!this.trackRef.current || !this.handleRef.current || !this._ondrag) {
      return;
    }
    const { axis } = this.props;
    const point =
      axis === 'x' ? lastX - this._ondrag.x : lastY - this._ondrag.y;
    this._scrollTo(point, 'drag');
    this.updateStatus('dragging');
    // if (this.state.status !== 'dragging') {
    //   this.setState(prevState => {
    //     return {
    //       ...prevState,
    //       status: 'dragging',
    //     }
    //   })
    // }
  };

  handleDragStop = (event, { lastX, lastY }) => {
    if (!this.trackRef.current || !this.handleRef.current || !this._ondrag) {
      delete this._ondrag;
      return;
    }
    const { axis } = this.props;
    const point =
      axis === 'x' ? lastX - this._ondrag.x : lastY - this._ondrag.y;
    this._scrollTo(point, 'dragend');
    delete this._ondrag;
    this.updateStatus('dragend');
  };

  render() {
    const {
      axis,
      scrollbarLength,
      scrollbarWidth,
      trackStyle,
      handleStyle,
      scrollbarClassNames,
    } = this.props;

    const { scrollTop, scrollLeft, status } = this.state;

    const dragProps = {
      axis,
      bounds: 'parent',
      onStart: this.handleDragStart,
      onDrag: this.handleDrag,
      onStop: this.handleDragStop,
      // className: 'drr',
    };
    if (!this._ondrag) {
      if (axis === 'x') {
        dragProps.position = { x: this.scaled(scrollLeft), y: 0 };
      } else {
        dragProps.position = { x: 0, y: this.scaled(scrollTop) };
      }
    }

    return template.call(this, {
      // variables
      dragProps,
      handleStyle: this.handleStyle(
        scrollbarClassNames,
        axis,
        this.handleLength(),
        scrollbarWidth,
        handleStyle,
      ),
      scrollbarClassNames,
      status,
      trackStyle: this.trackStyle(
        scrollbarClassNames,
        axis,
        scrollbarLength,
        scrollbarWidth,
        trackStyle,
      ),
      // components
      Draggable,
      Fragment,
    });
  }
}

Scrollbar.propTypes = {
  scrollbarWidth: PropTypes.number,
  minHandleLength: PropTypes.number,

  throttle: PropTypes.number,
  onScroll: PropTypes.func,
  onThrottledScroll: PropTypes.func,
};

Scrollbar.defaultProps = {
  scrollbarWidth: 40,
  minHandleLength: 40,

  throttle: THROTTLED_SCROLL,
  onScroll: () => null,
  onThrottledScroll: () => null,
};

const enhance = compose(
  forwardRef('outer'),

  withPropsOnChange(
    ['scrollbarClassNames'],
    ({ scrollbarClassNames: classNames }) => {
      let scrollbarClassNames = defaultScrollbarClassNames;
      if (classNames && typeof classNames === 'object') {
        entries(classNames)
          .filter(([key]) => scrollbarClassNames.has(key))
          .forEach(([key, className]) => {
            scrollbarClassNames = scrollbarClassNames.set(key, className);
          });
      }
      return { scrollbarClassNames: scrollbarClassNames.toJS() };
    },
  ),

  forwardRef('inner'),
);

export default enhance(Scrollbar);
