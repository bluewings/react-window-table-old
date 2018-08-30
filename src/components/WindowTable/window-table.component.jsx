/* eslint-disable */
import React, { PureComponent } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, defaultProps } from 'recompose';
import memoize from 'memoize-one';
import Scrollbar from '../Scrollbar';
import Guideline from '../Guideline';

// jsx
import template from './window-table.component.pug';

class WindowTable extends PureComponent {
  constructor(props) {
    super(props);

    this.gridRef = {
      center: React.createRef(),
      top: React.createRef(),
      right: React.createRef(),
      bottom: React.createRef(),
      left: React.createRef(),
    };

    this.scrollbarRef = {
      x: React.createRef(),
      y: React.createRef(),
    };

    this.guideLineRef = {
      top: React.createRef(),
      right: React.createRef(),
      bottom: React.createRef(),
      left: React.createRef(),
    };

    this.metric = {
      scrollTop: props.scrollTop || 0,
      scrollLeft: props.scrollLeft || 0,
    };

    this.tableRef = React.createRef();
    this.titleRef = React.createRef();
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      if (this.tableRef.current) {
        const tRect = this.tableRef.current.getBoundingClientRect();
        this.titleRef.current.innerText = `${tRect.width} x ${tRect.height}`;
      }
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  columnWidth = index => this.props.columns[index].width || 80

  rowHeight = index => 40

  scrollTo = ({ scrollTop, scrollLeft }, section) => {
    // clearTimeout(this._timer);
    if (typeof scrollTop !== 'undefined' || typeof scrollLeft !== 'undefined') {
      if (typeof scrollTop !== 'undefined') {
        this.metric.scrollTop = scrollTop;
      }
      if (typeof scrollLeft !== 'undefined') {
        this.metric.scrollLeft = scrollLeft;
      }

      const metric = {
        scrollTop: this.metric.scrollTop || 0,
        scrollLeft: this.metric.scrollLeft || 0,
      }
      // console.log(metric);
      // requestAnimationFrame(() => {
        Object.keys(this.gridRef)
        .filter(key => key !== section && this.gridRef[key].current)
        .forEach(key => this.gridRef[key].current.scrollTo(metric));
      if (this.scrollbarRef.x.current) {
        this.scrollbarRef.x.current.scrollTo(metric);
      } else {
        console.log('>>> not x found');
      }
      if (this.scrollbarRef.y.current) {
        this.scrollbarRef.y.current.scrollTo(metric);
      } else {
        console.log('>>> not y found');
      }
      // const scrollTo = { ...this.metric };
      // });

      

      // this._timer = setTimeout(() => {
      //   console.log(scrollTo, section);
      // }, 500);
    }
  }

  handleScrollbarDrag = ({ eventType, scrollTop, scrollLeft }) => {
    this.onScrollbarDrag = eventType === 'drag';
    console.log('>> handleScrollbarDrag', eventType)
    this.scrollTo({ scrollTop, scrollLeft });
    console.log('fin.');


  }

  handleGridScroll = (event, section) => {
    if (this.onScrollbarDrag || event.scrollUpdateWasRequested !== false) {
      // console.log('>', section);
      return;
    }
    if (this._section !== section) {
      // console.log(this._section, section);
      return 
    }
    // console.log(section);
    
    // if (this.onScrollbarDragevent.scrollUpdateWasRequested === false) {
    const { scrollTop, scrollLeft } = event;
    let scrollTo = {};
    switch (section) {
      case 'left':
      case 'right':
        scrollTo = { scrollTop };
        break;
      case 'top':
      case 'bottom':
        scrollTo = { scrollLeft };
        break;
      default:
        scrollTo = { scrollTop, scrollLeft };
        break;
    }

    this.scrollTo(scrollTo, section);
    // }
  }

  gridWidth = (from, limit) => this.props.columns.slice(from, from + limit).reduce((prev, e) => prev + e.width, 0)

  gridHeight = (from, limit) =>

    new Array(limit)
      .fill(true).reduce((prev, i) => prev + this.rowHeight(from + i), 0)
  // return
  // return this.props.columns.slice(from, from + limit).reduce((prev, e) => {
  //   return prev + e.width;
  // }, 0 )

  // _top = (memoize)

  rowCount = memoize(rows => (rows || []).length)

  columnCount = memoize(columns => (columns || []).length)

  center = memoize((topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height) =>

    // console.log(width, this.gridWidth(0, leftCount), this.gridWidth(columnCount - rightCount, rightCount))
    ({
      width: width - this.gridWidth(0, leftCount) - this.gridWidth(columnCount - rightCount, rightCount),
      height: height - this.gridHeight(0, topCount) - this.gridHeight(rowCount - bottomCount, bottomCount),
      rowOffset: topCount,
      rowCount: rowCount - topCount - bottomCount,
      columnOffset: leftCount,
      columnCount: columnCount - leftCount - rightCount,
    }))


  top = memoize((topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height) =>
    (topCount <= 0 ? null : {
      height: this.gridHeight(0, topCount),
      rowOffset: 0,
      rowCount: topCount,
    }))

  bottom = memoize((topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height) =>
    (bottomCount <= 0 ? null : {
      height: this.gridHeight(rowCount - bottomCount, bottomCount),
      rowOffset: rowCount - bottomCount,
      rowCount: bottomCount,
    }))

  left = memoize((topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height) =>
    (leftCount <= 0 ? null : {
      width: this.gridWidth(0, leftCount),
      columnOffset: 0,
      columnCount: leftCount,
    }))

  right = memoize((topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height) =>
    (rightCount <= 0 ? null : {
      width: this.gridWidth(columnCount - rightCount, rightCount),
      columnOffset: columnCount - rightCount,
      columnCount: rightCount,
    }))

    handleMouseOver = (event, section) => {
      // console.log(event, section);
      this._section = section;
      // console.log(this._section);
    }

  overallWidth = memoize(columns =>
    (columns || []).reduce((prev, column, index) => prev + this.columnWidth(index, column), 0))

  overallHeight = memoize(rows =>
    (rows || []).reduce((prev, row, index) => prev + this.rowHeight(index, row), 0))

  renderGrid = ({
    section, width, height, columnCount, columnOffset, rowCount, rowOffset,
  }) => {
    let gridProps = {
      width,
      height,
      columnCount,
      columnWidth: this.columnWidth,
      rowCount,
      rowHeight: this.rowHeight,
    };
    if (section) {
      gridProps = {
        ...gridProps,
        ref: this.gridRef[section],
        onScroll: event => this.handleGridScroll(event, section),
      };
    }
    const handleMouseOver = (event) => {
      // console.log(section);/
      this.handleMouseOver(event, section);
    }
    return (
      <div onMouseOver={handleMouseOver}>
      <Grid {...gridProps} >
        {({ columnIndex, rowIndex, style }) => (
          <div style={style}>
            {rowOffset + rowIndex}, {columnOffset + columnIndex}
          </div>
          )}
      </Grid>
      </div>
    );
  }

  render() {
    let {
      columns,
      rows,
      width,
      height,
      fixedTopCount: topCount,
      fixedBottomCount: bottomCount,
      fixedLeftCount: leftCount,
      fixedRightCount: rightCount,
      scrollbarWidth,
      guidelineStyle,
    } = this.props;

    // console.log('render');

    const columnCount = this.rowCount(columns);
    const rowCount = this.rowCount(rows);

    const overallWidth = this.overallWidth(columns);
    const overallHeight = this.overallHeight(rows);


    if (overallWidth <= width) {
      leftCount = 0;
      rightCount = 0;
    }

    let contentWidth = width;
    let contentHeight = height;

    let scrollbarX;
    let scrollbarY;


    scrollbarX = contentWidth < overallWidth;
    scrollbarY = contentHeight < overallHeight;

    contentWidth = contentWidth - (scrollbarY ? scrollbarWidth : 0);
    contentHeight = contentHeight - (scrollbarX ? scrollbarWidth : 0);

    if (overallHeight < contentHeight) {
      console.log('case1');
      contentHeight = overallHeight;
    }

    if (scrollbarX && !scrollbarY && contentHeight < overallHeight) {
      console.log('>>>>');
      scrollbarY = true;
      contentWidth = contentWidth - scrollbarWidth;
    }

    // scrollbarX = false;
    // scrollbarY = false;

    // if (overallHeight < contentHeight) {
    //   contentHeight = overallHeight;
    //   // scrollbarX = contentHeight < overallWidth;
      
    //   scrollbarY = contentHeight < overallHeight;
  
    //   contentWidth = contentWidth - (scrollbarY ? scrollbarWidth : 0);
    //   scrollbarX = contentWidth < overallWidth;
    // }


    const center = this.center(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);
    const top = this.top(topCount, rightCount, bottomCount, leftCount, contentWidth, contentHeight);
    const right = this.right(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);
    const bottom = this.bottom(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);
    const left = this.left(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);

    const rowSpan = [top, center, bottom].filter(e => e).length;
    const colSpan = [left, center, right].filter(e => e).length;



    const scrollbar = {
      x: {
        axis: 'x',
        ref: this.scrollbarRef.x,
        scrollbarLength: contentWidth,
        scrollLength: overallWidth,
        scrollbarWidth,
        onScroll: this.handleScrollbarDrag,
        trackStyle: this.props.scrollbarTrackStyle,
        handleStyle: this.props.scrollbarHandleStyle,
      },
      y: {
        axis: 'y',
        ref: this.scrollbarRef.y,
        scrollbarLength: contentHeight,
        scrollLength: overallHeight,
        scrollbarWidth,
        onScroll: this.handleScrollbarDrag,
        trackStyle: this.props.scrollbarTrackStyle,
        handleStyle: this.props.scrollbarHandleStyle,
      },
    };

    return template.call(this, {
      // variables
      bottom,
      center,
      colSpan,
      contentHeight,
      contentWidth,
      guidelineStyle,
      left,
      right,
      rowSpan,
      scrollbar,
      scrollbarWidth,
      scrollbarX,
      scrollbarY,
      top,
      // components
      Guideline,
      Scrollbar,
    });
  }
}

const enhance = compose(defaultProps({
  width: 800,
  height: 400,
  fixedTopCount: 1,
  fixedLeftCount: 1,
  fixedRightCount: 1,
  fixedBottomCount: 1,
  scrollbarWidth: 15,
  columns: [],
  rows: null,
}));

export default enhance(WindowTable);
