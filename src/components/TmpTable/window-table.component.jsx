/* eslint-disable
  react/no-unused-state,
  no-underscore-dangle,
  react/forbid-prop-types,
*/
/* eslint-disable */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, defaultProps, withPropsOnChange } from 'recompose';
import memoize from 'memoize-one';
import entries from 'object.entries';
import { css } from 'emotion';
import Scrollarea from '../Scrollarea';
import Scrollbar from '../Scrollbar';
import Guideline from '../Guideline';
// import cellStyle, { defaultClassNames as defaultCellClassNames } from '../../styles/cell.style';
import { cellStyle, defaultCellClassNames } from '../../styles';

import template from './window-table.component.pug';
import styles from './window-table.component.scss';

// const defaultCellClassNames = Map({
//   // row
//   oddRow: 'rwtc-odd-row',
//   evenRow: 'rwtc-even-row',
//   // column
//   oddColumn: 'rwtc-odd-col',
//   evenColumn: 'rwtc-even-col',
//   // area
//   top: 'rwtc-top',
//   middle: 'rwtc-middle',
//   bottom: 'rwtc-bottom',
//   left: 'rwtc-left',
//   center: 'rwtc-center',
//   right: 'rwtc-right',
//   // location within the area
//   horizontalFirst: 'rwtc-h-first',
//   horizontalLast: 'rwtc-h-last',
//   verticalFirst: 'rwtc-v-first',
//   verticalLast: 'rwtc-v-last',
// });

class WindowTable extends PureComponent {
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();

    this.gridRef = {
      center: React.createRef(),
      top: React.createRef(),
      bottom: React.createRef(),
      left: React.createRef(),
      right: React.createRef(),
    };

    this.scrollbarRef = {
      x: React.createRef(),
      y: React.createRef(),
    };

    this.guidelineRef = {
      top: React.createRef(),
      bottom: React.createRef(),
      left: React.createRef(),
      right: React.createRef(),
    };

    this.state = {
      scrollTop: props.scrollTop || 0,
      scrollLeft: props.scrollLeft || 0,
      scrollX: props.scrollLeft / props.maxScrollX,
      scrollY: props.scrollTop / props.maxScrollY,
    };

    this.tableRef = React.createRef();
    this.titleRef = React.createRef();
  }

  // componentDidMount() {
  //   this.timer = setInterval(() => {
  //     if (this.containerRef.current) {
  //       const tRect = this.containerRef.current.getBoundingClientRect();
  //       this.titleRef.current.innerText = `${tRect.width} x ${tRect.height}`;
  //       // this.titleRef.current.innerText = this.metric.scrollLeft
  //       // + ' , ' + this.metric.maxScrollX
  //       // + ' , ' + this.metric.scrollTop
  //       // + ' , ' + this.metric.maxScrollY
  //     }
  //   }, 10);
  // }

  componentDidUpdate(prevProps, prevState) {
    const { scrollTop, scrollLeft } = this.state;

    if (prevState.scrollTop !== scrollTop || prevState.scrollLeft !== scrollLeft) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = requestAnimationFrame(() => {
        Object.keys(this.gridRef)
          .filter(key => this.gridRef[key].current)
          .forEach(key => this.gridRef[key].current.scrollTo(this.state));
        if (this.scrollbarRef.x.current) {
          this.scrollbarRef.x.current.scrollTo(this.state);
        }
        if (this.scrollbarRef.y.current) {
          this.scrollbarRef.y.current.scrollTo(this.state);
        }
        Object.keys(this.guidelineRef)
          .filter(key => this.guidelineRef[key].current)
          .forEach(key => this.guidelineRef[key].current.update(this.state));
      });
    }
  }

  // componentWillUnmount() {
  //   clearInterval(this.timer);
  // }

  scrollTo = ({ scrollTop, scrollLeft }) => {
    const _scrollTop = typeof scrollTop === 'number' ? scrollTop : this.state.scrollTop;
    const _scrollLeft = typeof scrollLeft === 'number' ? scrollLeft : this.state.scrollLeft;
    if (this.state.scrollTop !== scrollTop || this.state.scrollLeft !== scrollLeft) {
      this.setState(prevState => ({
        ...prevState,
        scrollTop: _scrollTop,
        scrollLeft: _scrollLeft,
        scrollY: _scrollTop / this.props.maxScrollY,
        scrollX: _scrollLeft / this.props.maxScrollX,
      }));
    }
  }

  headerStyle = memoize((cellStyles, customStyle) => {
    let styleObj = {
      ...cellStyles,
      background: 'silver',
    };
    if (typeof customStyle === 'function') {
      styleObj = customStyle(styleObj, { });
    }
    return css({ ...styleObj });
  })

  renderGrid = ({
    section, width, height, columnCount, columnOffset, rowCount, rowOffset,
  }) => {
    let gridProps = {
      width,
      height,
      columnCount,
      columnWidth: index => this.props.columnWidth(index + columnOffset),
      rowCount,
      rowHeight: index =>
        this.props.rowHeight(index + rowOffset)
      ,
    };
    let aaa;
    if (section) {
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

      gridProps = {
        ...gridProps,
        ref: this.gridRef[aaa],

      };
    }

    const classNames = this.props.cellClassNames;

    // const cellStyle = this.cellStyle(classNames, this.props.cellStyle);
    const sectionClass = (Array.isArray(section) ? section : [section]).map(e => classNames[e]).join(' ');

    // console.log(sectionClass);
    return (

      <div className={styles.gridWrap} style={{ width, height }}>
        <h4 style={{ position:'absolute', margin:0, padding: 5, top: 0, left: 0, background:'yellow', zIndex: 10 }}>{section.join('-')}</h4>
        <Grid {...gridProps} >
          {({ columnIndex, rowIndex, style }) => {
          const _colIndex = columnOffset + columnIndex;
          const _rowIndex = rowOffset + rowIndex;
          const column = this.props.columns[_colIndex];
          const row = this.props.rows[_rowIndex];
          const applyStyle = [
            this.props.cellStyle,
            sectionClass,
            columnIndex === 0 && classNames.horizontalFirst,
            rowIndex === 0 && classNames.verticalFirst,
            columnIndex === columnCount - 1 && classNames.horizontalLast,
            rowIndex === rowCount - 1 && classNames.verticalLast,
            _colIndex % 2 ? classNames.oddColumn : classNames.evenColumn,
            _rowIndex % 2 ? classNames.oddRow : classNames.evenRow,
            `cell-text-align-${column.textAlign}`,
          ].join(' ');
          // if (_rowIndex === -1) {
          //   return (
          //     <div className={applyStyle} style={style}>
          //       {this.props.columns[_colIndex].name}
          //     </div>
          //   )
          // }

          if (_rowIndex >= 0) {
            const renderFn = this.props.columns[_colIndex].render;
            const val = this.props.rows[_rowIndex].arr[_colIndex];
            if (row._isHeader) {
              return (
                <div className={applyStyle} style={style}>
                  {val}
                </div>
              );
            }
            return (
              <div className={applyStyle} style={style}>
                {renderFn ? renderFn(val) : val}
              </div>
            );
          }
          return null;

          // return (
          //   <div className={applyStyle} style={style}>
          //     {/* <div style={newStyle}> */}
          //     {_rowIndex === -1 && this.props.columns[_colIndex].name}

          //     {_rowIndex >= 0 && (

          //     <span>{this.props.rows[_rowIndex].arr[_colIndex]}
          //     </span>
          //   )}

          //   </div>
          // );
        }}
        </Grid>
      </div>
    );
  }

  render() {
    const {
      bottom,
      center,
      containerStyle,
      contentHeight,
      contentWidth,
      guidelineStyle,
      left,
      overallHeight,
      overallWidth,
      right,
      scrollbarHandleStyle,
      scrollbarTrackStyle,
      scrollbarWidth,
      scrollbarX,
      scrollbarY,
      top,
    } = this.props;

    return template.call(this, {
      // variables
      bottom,
      center,
      containerStyle,
      contentHeight,
      contentWidth,
      guidelineStyle,
      left,
      overallHeight,
      overallWidth,
      right,
      scrollbarHandleStyle,
      scrollbarTrackStyle,
      scrollbarWidth,
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

const measure = (containerStyle, width, height) => {
  const divEl = document.createElement('div');
  divEl.classList.add(containerStyle);
  document.body.appendChild(divEl);
  const computed = window.getComputedStyle(divEl);
  const borderTop = parseInt(computed.borderTopWidth, 10);
  const borderBottom = parseInt(computed.borderBottomWidth, 10);
  const borderLeft = parseInt(computed.borderLeftWidth, 10);
  const borderRight = parseInt(computed.borderRightWidth, 10);
  document.body.removeChild(divEl);
  return {
    width: width - borderLeft - borderRight,
    height: height - borderTop - borderBottom,
  };
};


WindowTable.propTypes = {
  scrollTop: PropTypes.number,
  scrollLeft: PropTypes.number,
  maxScrollY: PropTypes.number,
  maxScrollX: PropTypes.number,

  cellStyle: PropTypes.string,

  columns: PropTypes.array.isRequired,
  columnWidth: PropTypes.func.isRequired,
  containerStyle: PropTypes.string,
  contentHeight: PropTypes.number.isRequired,
  contentWidth: PropTypes.number.isRequired,
  guidelineStyle: PropTypes.func,

  overallHeight: PropTypes.number.isRequired,
  overallWidth: PropTypes.number.isRequired,
  // priority: PropTypes.number.isRequired,

  left: PropTypes.object,
  right: PropTypes.object,
  center: PropTypes.object.isRequired,
  top: PropTypes.object,
  bottom: PropTypes.object,


  rowHeight: PropTypes.func.isRequired,
  rows: PropTypes.array.isRequired,
  scrollbarHandleStyle: PropTypes.func,
  scrollbarTrackStyle: PropTypes.func,
  scrollbarWidth: PropTypes.number.isRequired,
  scrollbarX: PropTypes.bool.isRequired,
  scrollbarY: PropTypes.bool.isRequired,

};

WindowTable.defaultProps = {
  scrollTop: 0,
  scrollLeft: 0,
  maxScrollY: 1,
  maxScrollX: 1,

  cellStyle: undefined,
  containerStyle: undefined,
  guidelineStyle: undefined,
  scrollbarHandleStyle: undefined,
  scrollbarTrackStyle: undefined,

  left: undefined,
  right: undefined,

  top: undefined,
  bottom: undefined,
};

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
    scrollTop: 0,
    scrollLeft: 0,
    rows: null,
  }),

  withPropsOnChange(['cellClassNames'], ({ cellClassNames: classNames }) => {
    let cellClassNames = defaultCellClassNames;
    if (classNames && typeof classNames === 'object') {
      entries(classNames)
        .filter(([key]) => cellClassNames.has(key))
        .forEach(([key, className]) => {
          cellClassNames = cellClassNames.set(key, className);
        });
    }
    return { cellClassNames: cellClassNames.toJS() };
  }),

  withPropsOnChange(['cellClassNames', 'cellStyle'], ({ cellClassNames, cellStyle: customStyle }) => ({
    cellStyle: cellStyle({ classNames: cellClassNames, customStyle }),
  })),

  withPropsOnChange(['columns'], ({ columns }) => ({
    columns: (columns || [])
      .filter(column => column && (typeof column === 'string' || typeof column === 'object'))
      .map(column => (typeof column === 'string' ? { name: column } : { ...column }))
      .filter(column => column.name),
  })),

  withPropsOnChange(['columns', 'rows', 'rowHeight'], ({ columns, rows, rowHeight: _rowHeight }) => {
    if (!Array.isArray(rows)) {
      return;
    }

    let getRowHeight;

    if (typeof _rowHeight === 'function') {
      getRowHeight = index => _rowHeight(index - 1);
    } else if (typeof _rowHeight === 'number') {
      getRowHeight = () => _rowHeight;
    } else {
      getRowHeight = () => 50;
    }

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

      const data = {
        org: { ..._row },
        arr: columns.map((e) => {
          let value = _row[e.name];
          if (typeof e.getValue === 'function') {
            value = e.getValue(value);
          }
          if (typeof value === 'string' || typeof value === 'number') {
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
        _isHeader: true,
        arr: columns.map(e => e.name),
      },
      ...rows,
    ].map((e, i) => ({
      ...e,
      _height: getRowHeight(i, e),
    }));

    // const te = new Date();
    // console.info('data count', rows.length * columns.length, 'elapsed', te - ts);

    const rowCount = (rows || []).length;

    const columnCount = (columns || []).length;

    const columnWidthFn = (index) => {
      let { width } = columns[index];
      width = isNaN(width) ? 120 : width;
      return width;
    };

    const rowHeightFn = index => rows[index]._height;

    const overallWidth = (columns || [])
      .reduce((prev, column, index) => prev + columnWidthFn(index, column), 0);

    const overallHeight = (rows || [])
      .reduce((prev, row, index) => prev + rowHeightFn(index, row), 0);

    const columnWidth = (from, limit = 1) => {
      limit = limit > 0 ? limit : 0;

      return new Array(limit)
        .fill(true)
        .map((e, i) => from + i)
        .reduce(
          (prev, i) =>

            prev + columnWidthFn(i)
          , 0,
        );
    };

    const rowHeight = (from, limit = 1) => {
      limit = limit > 0 ? limit : 0;

      return new Array(limit)
        .fill(true)
        .map((e, i) => from + i)
        .reduce(
          (prev, i) =>

            prev + rowHeightFn(i)
          , 0,
        );
    };

    return {
      rows,
      rowCount,
      columnCount,
      columnWidth,
      rowHeight,
      overallWidth,
      overallHeight,
    };
  }),
  withPropsOnChange(['width', 'height',
    'overallWidth', 'overallHeight', 'scrollbarWidth'], ({
    width: _width, height: _height, overallWidth, overallHeight, scrollbarWidth,
  }) => {
    let containerStyle = css({
      border: '1px solid #c4c4c4',
      boxSizing: 'border-box',
      width: _width,
      height: _height,
    });

    const { width, height } = measure(containerStyle, _width, _height);

    containerStyle = css({
      border: '1px solid #c4c4c4',
      boxSizing: 'border-box',
      width: _width,
      // height: _height,
    });

    let contentWidth = width;
    let contentHeight = height;

    const scrollbarX = contentWidth < overallWidth;
    let scrollbarY = contentHeight < overallHeight;

    // scrollbarX = contentWidth < overallWidth;
    // scrollbarY = contentHeight < overallHeight;

    contentWidth -= (scrollbarY ? scrollbarWidth : 0);
    contentHeight -= (scrollbarX ? scrollbarWidth : 0);

    if (overallHeight < contentHeight) {
      contentHeight = overallHeight;
    }

    if (scrollbarX && !scrollbarY && contentHeight < overallHeight) {
      scrollbarY = true;
      contentWidth -= scrollbarWidth;
    }

    return {
      containerStyle,
      width,
      height,
      scrollbarX,
      scrollbarY,
      contentWidth,
      contentHeight,
    };
  }),

  withPropsOnChange([
    'width', 'overallWidth',
    'contentWidth', 'contentHeight',
    'columnCount', 'columnWidth', 'rowCount', 'rowHeight',
    'fixedTopCount', 'fixedBottomCount', 'fixedLeftCount', 'fixedRightCount',
  ], ({
    width, overallWidth,
    contentWidth, contentHeight,
    columnCount, columnWidth, rowCount, rowHeight,
    fixedTopCount, fixedBottomCount, fixedLeftCount: leftCount, fixedRightCount: rightCount,
  }) => {
    let fixedLeftCount = leftCount;
    let fixedRightCount = rightCount;

    if (overallWidth <= width) {
      fixedLeftCount = 0;
      fixedRightCount = 0;
    }

    const center = {
      width: contentWidth -
        columnWidth(0, fixedLeftCount) -
        columnWidth(columnCount - fixedRightCount, fixedRightCount),
      height: contentHeight -
        rowHeight(0, fixedTopCount) -
        rowHeight(rowCount - fixedBottomCount, fixedBottomCount),
      rowOffset: fixedTopCount,
      rowCount: rowCount - fixedTopCount - fixedBottomCount,
      columnOffset: fixedLeftCount,
      columnCount: columnCount - fixedLeftCount - fixedRightCount,
    };

    const top = fixedTopCount <= 0 ? null : {
      height: rowHeight(0, fixedTopCount),
      rowOffset: 0,
      rowCount: fixedTopCount,
    };

    const bottom = fixedBottomCount <= 0 ? null : {
      height: rowHeight(rowCount - fixedBottomCount, fixedBottomCount),
      rowOffset: rowCount - fixedBottomCount,
      rowCount: fixedBottomCount,
    };

    const left = fixedLeftCount <= 0 ? null : {
      width: columnWidth(0, fixedLeftCount),
      columnOffset: 0,
      columnCount: fixedLeftCount,
    };

    const right = fixedRightCount <= 0 ? null : {
      width: columnWidth(columnCount - fixedRightCount, fixedRightCount),
      columnOffset: columnCount - fixedRightCount,
      columnCount: fixedRightCount,
    };

    return {
      fixedTopCount,
      fixedBottomCount,
      fixedLeftCount,
      fixedRightCount,
      center,
      top,
      bottom,
      left,
      right,
      maxScrollX: Math.max(
        0,
        columnWidth(fixedLeftCount, columnCount - fixedLeftCount - fixedRightCount) - center.width,
      ),
      maxScrollY: Math.max(
        0,
        rowHeight(fixedTopCount, rowCount - fixedTopCount - fixedBottomCount) - center.height,
      ),
    };
  }),
);

export default enhance(WindowTable);
