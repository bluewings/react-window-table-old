/* eslint-disable react/prop-types, no-underscore-dangle, react/no-unused-state */
/* eslint-disabl */
import React, { PureComponent } from 'react';
import { compose, defaultProps } from 'recompose';
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
    this.state = { scrollTop: 0, scrollLeft: 0 };
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

    let { scrollLeft, scrollTop } = this.props;

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

    const scrollInfo = this.scrollInfo.set('scrollTop', scrollTop).set('scrollLeft', scrollLeft);

    if (this.scrollInfo !== scrollInfo) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof this.props.onScroll === 'function') {
        this.props.onScroll({ scrollLeft, scrollTop });
      }
      this.scrollInfo = scrollInfo;
      this.handleThrottledScroll(scrollInfo);
    }
  };

  handleThrottledScroll = (scrollInfo) => {
    clearTimeout(this._clearScrollId);
    this.throttledScrollInfo = scrollInfo;
    if (!this._scrollId) {
      this._scrollId = setInterval(this.throttledScroll, THROTTLED_SCROLL);
      this._scrollCount = 0;
      this._scrollStart = new Date();
      this.throttledScroll();
    }
    this._clearScrollId = setTimeout(() => {
      clearInterval(this._scrollId);
      this.throttledScroll();
      delete this._scrollId;
      // show scroll stats
      const stats = {
        elapsed: new Date() - this._scrollStart,
        throttled: THROTTLED_SCROLL,
        events: this._scrollCount,
      };
      console.table(stats);
    }, THROTTLED_SCROLL + 50);
  };

  throttledScroll = () => {
    if (this.throttledScrollInfo) {
      delete this.throttledScrollInfo;
      this._scrollCount += 1;
    }
  };

  scrollWrapStyle = memoizeOne((width, height) => ({ width, height }));

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

const enhance = compose(defaultProps({
  width: 500,
  height: 400,
  contentWidth: null,
  contentHeight: null,
}));

export default enhance(Scrollarea);
