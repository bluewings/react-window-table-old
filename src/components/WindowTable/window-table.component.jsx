/* eslint-disable */
import React, { PureComponent } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, defaultProps, withPropsOnChange } from 'recompose';
import memoize from 'memoize-one';
import { css } from 'emotion';
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
    this.timer = setInterval(() => {
      if (this.tableRef.current && this.center) {
        const tRect = this.tableRef.current.getBoundingClientRect();
        this.titleRef.current.innerText = `${tRect.width} x ${tRect.height}`;
        // this.titleRef.current.innerText = this.metric.scrollLeft
          // + ' , ' + this.metric.maxScrollX
          // + ' , ' + this.metric.scrollTop
          // + ' , ' + this.metric.maxScrollY
      }
    }, 10);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  columnWidth = index => this.props.columns[index].width || 80

  rowHeight = index => {
    return this.props.rows[index]._height;
    // if (typeof this.props.rowHeight === 'function') {
    //   return this.props.rowHeight(index - 1);
    // } else if (typeof this.props.rowHeight === 'number') {
    //   return this.props.rowHeight;
    // }
    // return 40;
  }

  scrollTo = ({ scrollTop, scrollLeft }, section) => {
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
      }
      // // console.log(metric);
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
      }
      if (this.scrollbarRef.x.current) {
        this.scrollbarRef.x.current.scrollTo(metric);
      } else {
        // console.log('>>> not x found');
      }
      if (this.scrollbarRef.y.current) {
        this.scrollbarRef.y.current.scrollTo(metric);
      } else {
        // console.log('>>> not y found');
      }

      Object.keys(this.guidelineRef)
      .filter(key => this.guidelineRef[key].current)
      .forEach(key => this.guidelineRef[key].current.update(metric));
      // const scrollTo = { ...this.metric };
      // });

      

      // this._timer = setTimeout(() => {
      //   // console.log(scrollTo, section);
      // }, 500);
    }
  }

  handleScrollbarDrag = ({ eventType, scrollTop, scrollLeft }) => {
    this.onScrollbarDrag = eventType === 'drag';
    // console.log('>> handleScrollbarDrag', eventType)
    this.scrollTo({ scrollTop, scrollLeft });
    // console.log('fin.');


  }

  handleGridScroll = (event, section) => {
    if (this.onScrollbarDrag || event.scrollUpdateWasRequested !== false) {
      // // console.log('>', section);
      return;
    }
    if (this._section !== section) {
      // // console.log(this._section, section);
      return 
    }
    // // console.log(section);
    
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

  gridHeight = (from, limit) => {

    // console.log('%c grid height ' + from + ' ~ ' + limit, 'background:yellow');
    // // console.log(from, limit);


    return new Array(limit)
    .fill(true)
    .map((e, i) => {
      return from + i;
    })
    .reduce((prev, i) => {
      // console.log(i);
      return prev + this.rowHeight(i)
    }, 0)

  }

  // return
  // return this.props.columns.slice(from, from + limit).reduce((prev, e) => {
  //   return prev + e.width;
  // }, 0 )

  // _top = (memoize)

  rowCount = memoize(rows => {
    return (rows || []).length
  })

  columnCount = memoize(columns => (columns || []).length)

  center = memoize((topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height) => {

    // console.log('center', [0, topCount], this.gridHeight(0, topCount));
      // console.log('center', this.gridHeight(0, topCount), this.gridHeight(rowCount - bottomCount, bottomCount) );
    return {
      width_: this.gridWidth(leftCount, columnCount - leftCount - rightCount), 
      width: width - this.gridWidth(0, leftCount) - this.gridWidth(columnCount - rightCount, rightCount),
      // height: height - this.gridHeight(-1, topCount) - this.gridHeight(rowCount -1 - bottomCount, bottomCount),
      height: height - this.gridHeight(0, topCount) - this.gridHeight(rowCount - bottomCount, bottomCount),
      rowOffset: topCount,
      rowCount: rowCount - topCount - bottomCount,
      columnOffset: leftCount,
      columnCount: columnCount - leftCount - rightCount,
    }
  })

    
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
      // // console.log(event, section);
      this._section = section;
      // // console.log(this._section);
    }

  overallWidth = memoize(columns =>
    (columns || []).reduce((prev, column, index) => prev + this.columnWidth(index, column), 0))

  overallHeight = memoize(rows =>
    (rows || []).reduce((prev, row, index) => prev + this.rowHeight(index, row), 0))

  // overallHeight = memoize(rows => {

  //   // new Array(rows)
  //   return [...rows].reduce((prev, row, index) => prev + this.rowHeight(index, row), 0)


  // })

  headerStyle = memoize((customStyle) => {
    let styles = {
      boxSizing: 'border-box'
    };
    if (typeof customStyle === 'function') {
      styles = customStyle(styles, {  });
    }
    return css({
      ...styles,
      // position: 'relative',
      // width,
      // height,
    });
  })

  cellStyle = memoize((customStyle) => {
    let styles = {
      boxSizing: 'border-box'
    };
    if (typeof customStyle === 'function') {
      styles = customStyle(styles, {  });
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
      columnWidth: this.columnWidth,
      rowCount,
      rowHeight: (index) => {
        // console.log('>>> row height', index + rowOffset);
        return this.rowHeight(index + rowOffset)
      }
    };
    if (section) {
      gridProps = {
        ...gridProps,
        ref: this.gridRef[section],
        onScroll: event => this.handleGridScroll(event, section),
      };
    }
    const handleMouseOver = (event) => {
      // // console.log(section);/
      this.handleMouseOver(event, section);
    }
    return (
      <div onMouseOver={handleMouseOver}>
      <Grid {...gridProps} >
        {({ columnIndex, rowIndex, style }) => {
          const _colIndex = columnOffset + columnIndex;
          const _rowIndex = rowOffset + rowIndex;
          const cellStyle = this.cellStyle(this.props.cellStyle);
          const headerStyle = this.headerStyle(this.props.headerStyle);

          // const applyStyle = _rowIndex === -1 ? headerStyle : cellStyle;
          const applyStyle = _rowIndex === 0 ? headerStyle : cellStyle;
          // // console.log('>', _rowIndex, _colIndex);

          // consol



          return (

          
          // <div className={(_colIndex + _rowIndex) % 2 ? "odd" : "even"} style={style}>
          <div className={applyStyle} style={style}>
            {_rowIndex === -1 && this.props.columns[_colIndex].name}
            
            {_rowIndex >= 0 && (

              <span>{this.props.rows[_rowIndex].arr[_colIndex]}
              {/* <br/>{_rowIndex}, {_colIndex} */}
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
      width,
      height,
      fixedTopCount: topCount,
      fixedBottomCount: bottomCount,
      fixedLeftCount: leftCount,
      fixedRightCount: rightCount,
      scrollbarWidth,
      guidelineStyle,
    } = this.props;

    // // console.log('render');

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

    contentWidth = contentWidth - (scrollbarY ? scrollbarWidth : 0);
    contentHeight = contentHeight - (scrollbarX ? scrollbarWidth : 0);

    if (overallHeight < contentHeight) {
      // console.log('case1');
      contentHeight = overallHeight;
    }

    if (scrollbarX && !scrollbarY && contentHeight < overallHeight) {
      // console.log('>>>>');
      scrollbarY = true;
      contentWidth = contentWidth - scrollbarWidth;
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


    const center = this.center(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, contentWidth, contentHeight);
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

const enhance = compose(
  defaultProps({
  width: 800,
  height: 400,
  fixedTopCount: 1,
  fixedLeftCount: 1,
  fixedRightCount: 1,
  fixedBottomCount: 1,
  scrollbarWidth: 24,
  columns: [],
  rows: null,
}),
withPropsOnChange(['columns', 'rows', 'rowHeight'], ({ columns, rows, rowHeight }) => {
  // // console.log(columns);
  // // console.log(rows);

  // if (rows === null || typeof rows !== 'object') {
  //   return;
  // }
  if (!Array.isArray(rows)) {
    return;
  }

  let ts = new Date();

  let getRowHeight;

  if (typeof rowHeight === 'function') {
    getRowHeight = (index) => {
      return rowHeight(index - 1);
    }
  } else if (typeof rowHeight === 'number') {
    getRowHeight = (index) => {
      return rowHeight;
    }
  } else {
    getRowHeight = (index) => {
      return 40;
    }
  }



  // rowHeight = index => {
  //   if (typeof this.props.rowHeight === 'function') {
  //     return this.props.rowHeight(index - 1);
  //   } else if (typeof this.props.rowHeight === 'number') {
  //     return this.props.rowHeight;
  //   }
  //   return 40;
  // }



  rows = rows.map(row => {
    let _row;
    if (Array.isArray(row)) {
      _row = columns.reduce((prev, e, i) => {
        return {
          ...prev,
          [e.name]: row[i]
        }
      }, {});
    } else {
      _row = { ...row };
    }

    // const 

    let data = {
      org: { ..._row },
      arr: columns.map(e => {
        let value = _row[e.name];
        if (typeof e.getValue === 'function') {
          value = e.getValue(value);
        }
        return value
      })
    };

    return data;
  })

  rows = [
    {
      org: {},
      arr: columns.map(e => e.name),
    },
    ...rows,
  ].map((e, i) => {

    return {
      ...e,
      _height: getRowHeight(i, e)
    }

  })

  // // console.log(rows);
  let te = new Date();
  console.info('data count', rows.length * columns.length, 'elapsed', te - ts);
  // // console.log(rows);

  return {rows}
  // return {
  
  // }
  // // console.log(rows)

})
);

export default enhance(WindowTable);
