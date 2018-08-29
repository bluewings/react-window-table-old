/* eslint-disable */
import React, { PureComponent } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, defaultProps } from 'recompose';
import memoize from 'memoize-one';
import Scrollbar from '../Scrollbar';

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
  }

  columnWidth = index => this.props.columns[index].width || 80

  rowHeight = index => 40

  handleScroll = (event, section) => {
    if (event.scrollUpdateWasRequested === false) {
      const { scrollTop, scrollLeft } = event;
      const scrollTo = { scrollTop, scrollLeft };

      Object.keys(this.gridRef)
        .filter(key => key !== section && this.gridRef[key].current)
        .forEach((key) => {
          if (key === 'left' || key === 'right') {
            this.gridRef[key].current.scrollTo({ scrollTop, scrollLeft: 0 });
          } else if (key === 'top' || key === 'bottom') {
            this.gridRef[key].current.scrollTo({ scrollTop: 0, scrollLeft });
          } else {
            this.gridRef[key].current.scrollTo(scrollTo);
          }
        });

      if (this.scrollbarRef.x.current) {
        this.scrollbarRef.x.current.scrollTo(scrollTo);
      }
      if (this.scrollbarRef.y.current) {
        this.scrollbarRef.y.current.scrollTo(scrollTo);
      }
    }
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

  overallWidth = memoize(columns =>
    (columns || []).reduce((prev, column, index) => prev + this.columnWidth(index, column), 0))

  overallHeight = memoize(rows =>
    (rows || []).reduce((prev, row, index) => prev + this.rowHeight(index, row), 0))

  renderGrid = ({ section, width, height, columnCount, columnOffset, rowCount, rowOffset }) => {
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
        onScroll: event => this.handleScroll(event, section),
      };
    }
    return (
      <Grid {...gridProps} >
        {({ columnIndex, rowIndex, style }) => (
          <div style={style}>
            {rowOffset + rowIndex}, {columnOffset + columnIndex}
          </div>
          )}
      </Grid>
    );
  }

  render() {
    let {
      width,
      height,
      fixedTopCount: topCount,
      fixedBottomCount: bottomCount,
      fixedLeftCount: leftCount,
      fixedRightCount: rightCount,
      scrollbarWidth,
    } = this.props;

    console.log('render');

    const columnCount = this.rowCount(this.props.columns);
    const rowCount = this.rowCount(this.props.rows);

    const overallWidth = this.overallWidth(this.props.columns);
    const overallHeight = this.overallHeight(this.props.rows);


    if (overallWidth <= this.props.width) {
      leftCount = 0;
      rightCount = 0;
    }


    const fullWidth = this.gridWidth(0, columnCount);
    const fullHeight = this.gridHeight(0, (this.props.rows || []).length);

    const center = this.center(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height);
    const top = this.top(topCount, rightCount, bottomCount, leftCount, width, height);
    const right = this.right(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height);
    const bottom = this.bottom(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height);
    const left = this.left(topCount, rightCount, bottomCount, leftCount, rowCount, columnCount, width, height);

    const rowSpan = [top, center, bottom].filter(e => e).length;
    const colSpan = [left, center, right].filter(e => e).length;



    return template.call(this, {
      // variables
      bottom,
      center,
      colSpan,
      unused_fullHeight: fullHeight,
      unused_fullWidth: fullWidth,
      left,
      overallHeight,
      overallWidth,
      right,
      rowSpan,
      scrollbarProps: {
        width,
        height,
        overallWidth,
        overallHeight,
        scrollbarWidth,
      },
      top,
      // components
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
  scrollbarWidth: 10,
  columns: [],
  rows: null,
}));

export default enhance(WindowTable);
