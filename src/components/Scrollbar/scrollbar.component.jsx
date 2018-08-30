/* eslint-disable */
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import memoize from 'memoize-one';
import { css } from 'emotion';
import Draggable from 'react-draggable';

import template from './scrollbar.component.pug';

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

class Scrollbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { scrollTop: 0, scrollLeft: 0 };
    this.trackRef = React.createRef();
    this.handleRef = React.createRef();
    this.cache = {};
  }
  
  scrollTo = ({ scrollTop, scrollLeft }) => {
    this.setState(prevState => ({ ...prevState, scrollTop, scrollLeft }));
  }

  trackStyle = memoize((axis, trackLength, trackWidth) => {
    const styles = {
      position: 'relative',
      width: axis === 'x' ? trackLength : trackWidth,
      height: axis === 'x' ? trackWidth : trackLength,
      background: 'lightgray',
      overflow: 'hidden',
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

  _scrollTo = (point, eventType) => {
    let data = { eventType }
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
    this.props.onScroll(data);
  }

  handleClick = (event) => {
    if (this.trackRef.current === event.target) {
      const { axis } = this.props;
      const { top, left } = getClientRect(this.trackRef.current);
      const point = (axis === 'x' ? event.clientX - left : event.clientY - top) - (this.handleLength() / 2);
      this._scrollTo(point);
    }
  }

  scaled = (point) => {
    const scale = this.scale();
    const key = `${scale}_${point}`;
    if (!this.cache[key]) {
      this.cache[key] = point * scale;
    }
    return this.cache[key];
  }

  handleDragStart = (event, { lastX, lastY }) => {
    console.log('%c handleDragStart ', 'color:red');
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
  }

  handleDrag = (event, { lastX, lastY }) => {
    if (!this.trackRef.current || !this.handleRef.current || !this._ondrag) {
      return;
    }
    const { axis } = this.props;
    const point = axis === 'x' ? lastX - this._ondrag.x : lastY - this._ondrag.y;
    this._scrollTo(point, 'drag');
  }

  handleDragStop = (event, { lastX, lastY }) => {
    if (!this.trackRef.current || !this.handleRef.current || !this._ondrag) {
      delete this._ondrag;
      return;
    }
    const { axis } = this.props;
    const point = axis === 'x' ? lastX - this._ondrag.x : lastY - this._ondrag.y;
    this._scrollTo(point, 'dragend');
    delete this._ondrag;
  }

  render() {
    const { axis, scrollbarLength, scrollbarWidth } = this.props;

    const { scrollTop, scrollLeft } = this.state;

    const dragProps = {
      axis,
      bounds: 'parent',
      onStart: this.handleDragStart,
      onDrag: this.handleDrag,
      onStop: this.handleDragStop,
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
      handleStyle: this.handleStyle(axis, this.handleLength(), scrollbarWidth),
      trackStyle: this.trackStyle(axis, scrollbarLength, scrollbarWidth),
      // components
      Draggable,
      Fragment,
    });
  }
}

Scrollbar.propTypes = {
  scrollbarWidth: PropTypes.number,
  minHandleLength: PropTypes.number,
};

Scrollbar.defaultProps = {
  scrollbarWidth: 40,
  minHandleLength: 40,
};

export default Scrollbar;
