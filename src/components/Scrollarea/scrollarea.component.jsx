/* eslint-disable no-underscore-dangle */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import memoizeOne from 'memoize-one';

// jsx
import template from './scrollarea.component.pug';

const THROTTLED_SCROLL = 100;

class Scrollarea extends PureComponent {
  constructor(props) {
    super(props);
    this.bumperRef = React.createRef();
    this.shimRef = React.createRef();
    this.scrollWrapRef = React.createRef();
    this.scrollContentRef = React.createRef();
    this.scrollInfo = Map({ scrollTop: 0, scrollLeft: 0 });
  }

  componentDidMount() {
    if (this.bumperRef.current && this.scrollWrapRef.current) {
      this.scrollWrapRef.current.style.width = this.bumperRef.current.style.width;
    }
  }

  componentDidUpdate() {
    if (this.bumperRef.current && this.scrollWrapRef.current) {
      const bumperWidth = this.bumperRef.current.getBoundingClientRect().width;
      this.scrollWrapRef.current.style.width = `${bumperWidth}px`;
    }
  }

  handleMousewheel = (event) => {
    const scrollContentRect = this.scrollContentRef.current.getBoundingClientRect();
    const scrollWrapRect = this.scrollWrapRef.current.getBoundingClientRect();

    const contentWidth = this.props.contentWidth || scrollContentRect.width;
    const contentHeight = this.props.contentHeight || scrollContentRect.height;

    const scrollWidth = Math.max(contentWidth - scrollWrapRect.width, 0);
    const scrollHeight = contentHeight - scrollWrapRect.height;

    let { deltaX, deltaY } = event;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY * 1.5) {
      deltaY = 0;
    } else if (absDeltaY > absDeltaX * 1.5) {
      deltaX = 0;
    }

    let scrollTop = this.scrollInfo.get('scrollTop');
    let scrollLeft = this.scrollInfo.get('scrollLeft');

    scrollTop += deltaY;
    if (scrollTop < 0) {
      scrollTop = 0;
    } else if (scrollTop > scrollHeight) {
      scrollTop = scrollHeight;
    }

    scrollLeft += deltaX;
    if (scrollLeft < 0) {
      scrollLeft = 0;
    } else if (scrollLeft > scrollWidth) {
      scrollLeft = scrollWidth;
    }

    const scrollInfo = this.scrollInfo
      .set('scrollTop', scrollTop)
      .set('scrollLeft', scrollLeft);

    if (this.scrollInfo !== scrollInfo) {
      event.preventDefault();
      event.stopPropagation();
      this.handleThrottledScroll(scrollInfo);
      if (typeof this.props.onScroll === 'function') {
        this.props.onScroll({ scrollLeft, scrollTop });
      }
      this.scrollInfo = scrollInfo;
    }
  };

  handleThrottledScroll = (scrollInfo) => {
    clearTimeout(this._clearScrollId);
    this.throttledScrollInfo = scrollInfo;
    if (!this._scrollId) {
      this._scrollId = setInterval(this.throttledScroll, THROTTLED_SCROLL);
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
      // show scroll stats
      // const stats = {
      //   elapsed: new Date() - this._scrollStart.time,
      //   throttled: THROTTLED_SCROLL,
      //   events: this._scrollCount,
      //   movedX:
      //     this.scrollInfo.get('scrollLeft') - this._scrollStart.scrollLeft,
      //   movedY: this.scrollInfo.get('scrollTop') - this._scrollStart.scrollTop,
      // };
      // console.table(stats);
      this.props.onThrottledScroll({
        scrollTop: this.scrollInfo.get('scrollTop'),
        scrollLeft: this.scrollInfo.get('scrollLeft'),
      });
    }, THROTTLED_SCROLL + 50);
  };

  throttledScroll = () => {
    if (this.throttledScrollInfo) {
      if (typeof this.props.onThrottledScroll === 'function') {
        const scrollTop = this.throttledScrollInfo.get('scrollTop');
        const scrollLeft = this.throttledScrollInfo.get('scrollLeft');
        this.props.onThrottledScroll({ scrollLeft, scrollTop });
      }
      delete this.throttledScrollInfo;
      this._scrollCount += 1;
    }
  };

  scrollWrapStyle = memoizeOne((width, height) => ({
    // position: 'relative',
    // overflow: 'hidden',
    width,
    height,
  }));


  render() {
    return template.call(this, {
      // variables
      scrollWrapStyle: this.scrollWrapStyle(
        this.props.width,
        this.props.height,
      ),
    });
  }
}

Scrollarea.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  contentWidth: PropTypes.number.isRequired,
  contentHeight: PropTypes.number.isRequired,
  onScroll: PropTypes.func,
  onThrottledScroll: PropTypes.func,
};

Scrollarea.defaultProps = {
  onScroll: null,
  onThrottledScroll: null,
};

export default Scrollarea;
