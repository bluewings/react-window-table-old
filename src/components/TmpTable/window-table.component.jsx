/* eslint-disable */
import React, { PureComponent } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, defaultProps, withPropsOnChange } from 'recompose';
import memoize from 'memoize-one';
import { css } from 'emotion';
import Scrollarea from '../Scrollarea';
import Scrollbar from '../Scrollbar';
import Guideline from '../Guideline';

// jsx
import template from './window-table.component.pug';
import styles from './window-table.component.scss';

class WindowTable extends PureComponent {
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();

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

    this.guidelineRef = {
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
    // this.timer = setInterval(() => {
    //   if (this.tableRef.current && this.center) {
    //     const tRect = this.containerRef.current.getBoundingClientRect();
    //     this.titleRef.current.innerText = `${tRect.width} x ${tRect.height}`;
    //     // this.titleRef.current.innerText = this.metric.scrollLeft
    //     // + ' , ' + this.metric.maxScrollX
    //     // + ' , ' + this.metric.scrollTop
    //     // + ' , ' + this.metric.maxScrollY
    //   }
    // }, 10);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }


  containerStyle = memoize((width, height) => css({
    border: '1px solid #c4c4c4',
    boxSizing: 'border-box',
    width,
    height,
    // width: 500,
  }))

  rect = memoize((containerStyle, width, height) => {
    const div = document.createElement('div');
    div.classList.add(containerStyle);
    document.body.appendChild(div);
    const styles = window.getComputedStyle(div);
    // document.body.removeChild(div);
    const borderTop = parseInt(styles.borderTopWidth, 10);
    const borderBottom = parseInt(styles.borderBottomWidth, 10);
    const borderLeft = parseInt(styles.borderLeftWidth, 10);
    const borderRight = parseInt(styles.borderRightWidth, 10);
    document.body.removeChild(div);
    return {
      width: width - borderLeft - borderRight,
      height: height - borderTop - borderBottom,
    };
    // conso

    // // console.log(styles.width);
    // // console.log(borderLeft, borderRight);

    // // console.log(styles.borderRightWidth);
    // // console.log(styles.borderRightWidth);
  })

  columnWidth = (index) => {
    // // console.log(this.props.columns[index].width);
    let width = this.props.columns[index].width;
    width = isNaN(width) ? 80 : width;
    // console.log(width);
    return width;
  }

  rowHeight = index =>
    // // console.log('rowHeight', index, this.props.rows);
    this.props.rows[index]._height
    // if (typeof this.props.rowHeight === 'function') {
    //   return this.props.rowHeight(index - 1);
    // } else if (typeof this.props.rowHeight === 'number') {
    //   return this.props.rowHeight;
    // }
    // return 40;
  scrollTo = ({ scrollTop, scrollLeft }, section) => {
    // cancelAnimationFrame(this._timer);
    // this._timer = requestAnimationFrame(() => {
    this._scrollTo({ scrollTop, scrollLeft }, section);
    // })
  }


  _scrollTo = ({ scrollTop, scrollLeft }, section) => {
    // clearTimeout(this._timer);
    if (typeof scrollTop !== 'undefined' || typeof scrollLeft !== 'undefined') {
      if (typeof scrollTop !== 'undefined') {
        this.metric.scrollTop = scrollTop;
      }
      if (typeof scrollLeft !== 'undefined') {
        this.metric.scrollLeft = scrollLeft;
      }

      let metric = {
        scrollTop: this.metric.scrollTop || 0,
        scrollLeft: this.metric.scrollLeft || 0,
      };
      // // // console.log(metric);
      // requestAnimationFrame(() => {
      Object.keys(this.gridRef)
        .filter(key => key !== section && this.gridRef[key].current)
        .forEach(key => this.gridRef[key].current.scrollTo(metric));
      metric = {
        ...metric,
        scrollX: this.metric.scrollLeft / this.metric.maxScrollX,
        scrollY: this.metric.scrollTop / this.metric.maxScrollY,
        // scrollTop: this.metric.scrollTop || 0,
        // scrollLeft: this.metric.scrollLeft || 0,
      };
      if (this.scrollbarRef.x.current) {
        this.scrollbarRef.x.current.scrollTo(metric);
      } else {
        // // console.log('>>> not x found');
      }
      if (this.scrollbarRef.y.current) {
        this.scrollbarRef.y.current.scrollTo(metric);
      } else {
        // // console.log('>>> not y found');
      }

      Object.keys(this.guidelineRef)
        .filter(key => this.guidelineRef[key].current)
        .forEach(key => this.guidelineRef[key].current.update(metric));

    }
  }

  handleScrollbarDrag = ({ eventType, scrollTop, scrollLeft }) => {
    this.onScrollbarDrag = eventType === 'drag';
    // // console.log('>> handleScrollbarDrag', eventType)
    this.scrollTo({ scrollTop, scrollLeft });
    // // console.log('fin.');
  }

  // handleGridScroll = (event, section) => {
  //   if (this.onScrollbarDrag || event.scrollUpdateWasRequested !== false) {
  //     // // // console.log('>', section);
  //     return;
  //   }
  //   if (this._section !== section) {
  //     // // // console.log(this._section, section);
  //     return;
  //   }
  //   // // // console.log(section);

  //   // if (this.onScrollbarDragevent.scrollUpdateWasRequested === false) {
  //   const { scrollTop, scrollLeft } = event;
  //   let scrollTo = {};
  //   switch (section) {
  //     case 'left':
  //     case 'right':
  //       scrollTo = { scrollTop };
  //       break;
  //     case 'top':
  //     case 'bottom':
  //       scrollTo = { scrollLeft };
  //       break;
  //     default:
  //       scrollTo = { scrollTop, scrollLeft };
  //       break;
  //   }

  //   this.scrollTo(scrollTo, section);
  //   // }
  // }

  // gridWidth = (from, limit) => this.props.columns.slice(from, from + limit).reduce((prev, e) => prev + e.width, 0)

  gridWidth = (from, limit) => {
    // // console.log('%c grid height ' + from + ' ~ ' + limit, 'background:yellow');
    // // // console.log(from, limit);
    // // console.log(limit, this.props.rows);
    limit = limit > 0 ? limit : 0;


    // // console.log(from, limit || 0);
    return new Array(limit)
      .fill(true)
      .map((e, i) => from + i)
      .reduce(
        (prev, i) =>
        // // console.log(i);
          prev + this.columnWidth(i)
        , 0,
      );
  }

  gridHeight = (from, limit) => {
    // // console.log('%c grid height ' + from + ' ~ ' + limit, 'background:yellow');
    // // // console.log(from, limit);
    // console.log(limit, this.props.rows);
    limit = limit > 0 ? limit : 0;


    // // console.log(from, limit || 0);
    return new Array(limit)
      .fill(true)
      .map((e, i) => from + i)
      .reduce(
        (prev, i) =>
        // // console.log(i);
          prev + this.rowHeight(i)
        , 0,
      );
  }

  // return
  // return this.props.columns.slice(from, from + limit).reduce((prev, e) => {
  //   return prev + e.width;
  // }, 0 )

  // _top = (memoize)

  rowCount = memoize(rows => (rows || []).length)

  columnCount = memoize(columns => (columns || []).length)

  _center = memoize((topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height) =>

    // // console.log('center', [0, topCount], this.gridHeight(0, topCount));
    // // console.log('center', this.gridHeight(0, topCount), this.gridHeight(rowCount - bottomCount, bottomCount) );
    ({
      width_: this.gridWidth(leftCount, columnCount - leftCount - rightCount),
      width: width - this.gridWidth(0, leftCount) - this.gridWidth(columnCount - rightCount, rightCount),
      // height: height - this.gridHeight(-1, topCount) - this.gridHeight(rowCount -1 - bottomCount, bottomCount),
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
      // // // console.log(event, section);
      this._section = section;
      // // // console.log(this._section);
    }

  overallWidth = memoize(columns =>
    (columns || []).reduce((prev, column, index) => prev + this.columnWidth(index, column), 0))

  overallHeight = memoize(rows =>
    (rows || []).reduce((prev, row, index) => prev + this.rowHeight(index, row), 0))

  // overallHeight = memoize(rows => {

  //   // new Array(rows)
  //   return [...rows].reduce((prev, row, index) => prev + this.rowHeight(index, row), 0)


  // })

  headerStyle = memoize((cellStyles, customStyle) => {
    let styles = {
      // boxSizing: 'border-box',
      // border: '1px solid black',
      // '&.cell-top': {

      // },
      ...cellStyles,
      background: 'silver',
    };
    if (typeof customStyle === 'function') {
      styles = customStyle(styles, { });
    }
    return css({
      ...styles,
      // position: 'relative',
      // width,
      // height,
    });
  })

  _handleScroll = (args) => {
    // console.log('_handleScroll', args);
    this.scrollTo({
      scrollTop: args.y * -1,
      scrollLeft: args.x * -1,
    })
  }

  cellStyle = memoize((customStyle) => {
    // odd / even
    let styles = {
      boxSizing: 'border-box',
      overflow: 'hidden',
      borderRight: '1px solid #cacaca',
      borderBottom: '1px solid #cacaca',

      '&.cell-right': {
        borderLeft: '1px solid #cacaca',
        borderRight: 'none',
      },
      '&.cell-bottom': {
        borderTop: '1px solid #cacaca',
        borderBottom: 'none',
      },


      '&.cell-center': {
        '&.cell-h-last': {
          borderRight: 'none',
        },

      },
      '&.cell-middle': {
        '&.cell-v-last': {
          borderBottom: 'none',
        },

      },
      '&.row-even': {
        // background: '#f8f8f8',
        background: 'lightyellow',
      },
    };
    if (typeof customStyle === 'function') {
      styles = customStyle(styles, { });
    }

    return css({
      ...styles,
      // position: 'relative',
      // width,
      // height,
    });
  })

  renderGrid = ({
    section, width, height, columnCount, columnOffset, rowCount, rowOffset,
  }) => {
    let gridProps = {
      width,
      height,
      columnCount,
      columnWidth: index => this.columnWidth(index + columnOffset),
      rowCount,
      // overscanCount: 3,
      rowHeight: index =>
        // // console.log('>>> row height', index + rowOffset);
        this.rowHeight(index + rowOffset)
      ,
    };
    let aaa;
    if (section) {
      const priority = ['top', 'bottom', 'left', 'right', 'center'];

      switch (section.join(' ')) {
        case 'top center':
          aaa = 'top';
          break;
        case 'middle left':
          aaa = 'left';
          break;
        case 'middle center':
          aaa = 'center';
          break;
        case 'middle right':
          aaa = 'right';
          break;
        case 'bottom center':
          aaa = 'bottom';
          break;
        default:
          break;
      }
      // console.log(aaa);
      // const aaa = section.sort((a, b) => {
      //   const c = priority.indexOf(a);
      //   const d = priority.indexOf(b);
      //   if (c === d) {
      //     return 0;
      //   }
      //   return c < d ? -1 : 1;
      // })[0];
      // // console.log(aaa);
      gridProps = {
        ...gridProps,
        ref: this.gridRef[aaa],
        // onScroll: event => this.handleGridScroll(event, aaa),
      };
    }
    const handleMouseOver = (event) => {
      // // // console.log(section);/
      this.handleMouseOver(event, aaa);
    };

    const cellStyle = this.cellStyle(this.props.cellStyle);
    const sectionClass = (Array.isArray(section) ? section : [section]).map(e => `cell-${e}`).join(' ');

    return (
      <div className={styles.gridWrap} onMouseOver={handleMouseOver} style={{ width, height }}>
        <Grid {...gridProps} >
          {({ columnIndex, rowIndex, style }) => {
          const _colIndex = columnOffset + columnIndex;
          const _rowIndex = rowOffset + rowIndex;
          const applyStyle = [
            cellStyle,
            sectionClass,
            columnIndex === 0 && 'cell-h-first',
            rowIndex === 0 && 'cell-v-first',
            columnIndex === columnCount - 1 && 'cell-h-last',
            rowIndex === rowCount - 1 && 'cell-v-last',
            _colIndex % 2 ? 'col-odd' : 'col-even',
            _rowIndex % 2 ? 'row-odd' : 'row-even',

          ].join(' ');

          // // // console.log('>', _rowIndex, _colIndex);

          // consol
          // const newStyle = { ...style, border: '1px solid black' }


          return (
            <div className={applyStyle} style={style}>
            {/* <div style={newStyle}> */}
              {_rowIndex === -1 && this.props.columns[_colIndex].name}

              {_rowIndex >= 0 && (

              <span>{this.props.rows[_rowIndex].arr[_colIndex]}
              </span>
            )}

            </div>
          );
        }}
        </Grid>
      </div>
    );
  }

  render() {
    let {
      columns,
      rows,
      width: _width,
      height: _height,
      fixedTopCount: topCount,
      fixedBottomCount: bottomCount,
      fixedLeftCount: leftCount,
      fixedRightCount: rightCount,
      scrollbarWidth,
      guidelineStyle,
    } = this.props;

    // // // console.log('render');
    const containerStyle = this.containerStyle(_width, _height);
    const { width, height } = this.rect(containerStyle, _width, _height);

    const columnCount = this.columnCount(columns);
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

    contentWidth -= (scrollbarY ? scrollbarWidth : 0);
    contentHeight -= (scrollbarX ? scrollbarWidth : 0);

    // console.log(contentWidth, contentHeight);

    if (overallHeight < contentHeight) {
      // console.log('case1');
      contentHeight = overallHeight;
    }

    if (scrollbarX && !scrollbarY && contentHeight < overallHeight) {
      // console.log('>>>>');
      scrollbarY = true;
      contentWidth -= scrollbarWidth;
    }

    this.contentWidth = contentWidth;

    // scrollbarX = false;
    // scrollbarY = false;

    // if (overallHeight < contentHeight) {
    //   contentHeight = overallHeight;
    //   // scrollbarX = contentHeight < overallWidth;

    //   scrollbarY = contentHeight < overallHeight;

    //   contentWidth = contentWidth - (scrollbarY ? scrollbarWidth : 0);
    //   scrollbarX = contentWidth < overallWidth;
    // }


    const center = this._center(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);
    const top = this.top(topCount, rightCount, bottomCount, leftCount, contentWidth, contentHeight);
    const right = this.right(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);
    const bottom = this.bottom(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);
    const left = this.left(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);

    const rowSpan = [top, center, bottom].filter(e => e).length;
    const colSpan = [left, center, right].filter(e => e).length;

    this.center = center;

    this.metric.maxScrollX = Math.max(0, this.gridWidth(leftCount, columnCount - leftCount - rightCount) - center.width);
    this.metric.maxScrollY = Math.max(0, this.gridHeight(topCount, rowCount - topCount - bottomCount) - center.height);


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

    // // console.log(center);

    const _cWidth = this.gridWidth(center.columnOffset, center.columnCount);
    const _cHeight = this.gridHeight(center.rowOffset, center.rowCount);

    // renderGrid = ({
    //   section, width, height, columnCount, columnOffset, rowCount, rowOffset,
    // }) => {
    //   let gridProps = {
    //     width,
    //     height,
    //     columnCount,
    //     columnWidth: index => this.columnWidth(index + columnOffset),
    //     rowCount,

    return template.call(this, {
      // variables
      unused__cHeight: _cHeight,
      unused__cWidth: _cWidth,
      bottom,
      center,
      unused_colSpan: colSpan,
      containerStyle,
      contentHeight,
      contentWidth,
      guidelineStyle,
      left,
      overallHeight,
      overallWidth,
      right,
      unused_rowSpan: rowSpan,
      // unused_scrollTop: scrollTop,
      scrollbar,
      unused_scrollbarWidth: scrollbarWidth,
      scrollbarX,
      scrollbarY,
      top,
      // components
      Guideline,
      Scrollarea,
      Scrollbar,
    });
  }
}

const enhance = compose(
  defaultProps({
    width: 800,
    height: 400,
    fixedTopCount: 1,
    fixedLeftCount: 1,
    fixedRightCount: 1,
    fixedBottomCount: 1,
    scrollbarWidth: 15,
    columns: [],
    rows: null,
  }),
  withPropsOnChange(['columns', 'rows', 'rowHeight'], ({ columns, rows, rowHeight }) => {
  // // // console.log(columns);
  // // // console.log(rows);

  // if (rows === null || typeof rows !== 'object') {
  //   return;
  // }
    if (!Array.isArray(rows)) {
      return;
    }

    const ts = new Date();

    let getRowHeight;

    if (typeof rowHeight === 'function') {
      getRowHeight = index => rowHeight(index - 1);
    } else if (typeof rowHeight === 'number') {
      getRowHeight = index => rowHeight;
    } else {
      getRowHeight = index => 50;
    }


    // rowHeight = index => {
    //   if (typeof this.props.rowHeight === 'function') {
    //     return this.props.rowHeight(index - 1);
    //   } else if (typeof this.props.rowHeight === 'number') {
    //     return this.props.rowHeight;
    //   }
    //   return 40;
    // }


    rows = rows.map((row) => {
      let _row;
      if (Array.isArray(row)) {
        _row = columns.reduce((prev, e, i) => ({
          ...prev,
          [e.name]: row[i],
        }), {});
      } else {
        _row = { ...row };
      }

      // const

      const data = {
        org: { ..._row },
        arr: columns.map((e) => {
          let value = _row[e.name];
          if (typeof e.getValue === 'function') {
            value = e.getValue(value);
          }
          if (typeof value === 'string') {
            return value;
          }
          return '-';
        }),
      };

      return data;
    });

    rows = [
      {
        org: {},
        arr: columns.map(e => e.name),
      },
      ...rows,
    ].map((e, i) => ({
      ...e,
      _height: getRowHeight(i, e),
    }));

    // // // console.log(rows);
    const te = new Date();
    console.info('data count', rows.length * columns.length, 'elapsed', te - ts);
    // // // console.log(rows);

    return { rows };
  // return {

  // }
  // // // console.log(rows)
  }),
);

export default enhance(WindowTable);
