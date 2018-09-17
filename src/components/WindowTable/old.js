/* eslint-disable
  react/no-unused-state,
  no-underscore-dangle,
  react/forbid-prop-types,
*/
/* eslint-disable */
import React, { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import { compose, defaultProps, withPropsOnChange } from 'recompose';
import memoizeOne from 'memoize-one';
import entries from 'object.entries';
import { css } from 'emotion';
import withHOCs from 'with-hocs';
import Scrollarea from '../Scrollarea';
import Scrollbar from '../Scrollbar';
import Guideline from '../Guideline';

import { cellStyle, defaultCellClassNames } from '../../styles';

import template from './window-table.component.pug';
import styles from './window-table.component.scss';

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

    this.secRef = React.createRef();
  }

  // componentDidUpdate(prevProps, prevState) {
  //   const { scrollTop, scrollLeft } = this.state;

  //   if (prevState.scrollTop !== scrollTop || prevState.scrollLeft !== scrollLeft) {

  //   }
  // }

  findNearestItem = (itemType, offset) => {
    let high;
    if (itemType === 'column') {
      high = this.props._columns.length - 1;
    } else {
      high = this.props._rows.length - 1;
    }
    return this.findNearestItemBinarySearch(
      itemType,

      high,
      0,
      offset,
    );
  };

  getRowStartIndexForOffset = scrollTop => {
    const itemMetadata = this.getItemMetadata('row', this.props.fixedTopCount);

    return this.findNearestItem('row', scrollTop + itemMetadata.offset);
  };

  getRowStopIndexForStartIndex = (startIndex, scrollTop) =>
    this._getColumnStopIndexForStartIndex('row', startIndex, scrollTop);

  getColumnOffset = index => {};

  getColumnWidth = index => {};

  getColumnStartIndexForOffset = scrollLeft => {
    const itemMetadata = this.getItemMetadata(
      'column',
      this.props.fixedLeftCount,
    );

    return this.findNearestItem('column', scrollLeft + itemMetadata.offset);
  };

  getColumnStopIndexForStartIndex = (startIndex, scrollLeft) =>
    this._getColumnStopIndexForStartIndex('column', startIndex, scrollLeft);

  _getColumnStopIndexForStartIndex = (itemType, startIndex, offset) => {
    const {
      itemCount_,
      contentWidth: width,
      contentHeight: height,
    } = this.props;

    let itemCount = this.props._columns.length;
    if (itemType === 'row') {
      itemCount = this.props._rows.length;
    }

    const itemMetadata = this.getItemMetadata(itemType, startIndex);

    let maxOffset;

    if (itemType === 'row') {
      maxOffset = offset + height;
      if (this.props.fixedBottomCount > 0) {
        const rWidth = this.props._rows
          .slice(this.props.fixedBottomCount * -1)
          .reduce((prev, { meta }) => prev + meta.size, 0);

        maxOffset -= rWidth;
      }
    } else {
      maxOffset = offset + width;
      if (this.props.fixedRightCount > 0) {
        const rWidth = this.props._columns
          .slice(this.props.fixedRightCount * -1)
          .reduce((prev, { meta }) => prev + meta.size, 0);

        maxOffset -= rWidth;
      }
    }

    let currOffset = itemMetadata.offset + itemMetadata.size;
    let stopIndex = startIndex;

    while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
      stopIndex++;

      currOffset += this.getItemMetadata(itemType, stopIndex).size;
    }

    return stopIndex;
  };

  getItemMetadata = (itemType, index) => {
    if (itemType === 'column') {
      return this.props._columns[index].meta;
    }
    return this.props._rows[index].meta;
  };

  findNearestItemBinarySearch = (itemType, high, low, offset) => {
    while (low <= high) {
      const middle = low + Math.floor((high - low) / 2);
      const currentOffset = this.getItemMetadata(itemType, middle).offset;

      if (currentOffset === offset) {
        return middle;
      } else if (currentOffset < offset) {
        low = middle + 1;
      } else if (currentOffset > offset) {
        high = middle - 1;
      }
    }

    if (low > 0) {
      return low - 1;
    }
    return 0;
  };

  _getItemListCache = memoizeOne((_, __) => ({}));

  _getItemStyleCache = memoizeOne((_, __) => ({}));

  _getItemStyle = (rowIndex, columnIndex) => {
    const key = `${rowIndex}:${columnIndex}`;

    const itemStyleCache = this._getItemStyleCache(0, 0);

    if (!itemStyleCache.hasOwnProperty(key)) {
      const { offset: left, size: width } = this.getItemMetadata(
        'column',
        columnIndex,
      );
      const { offset: top, size: height } = this.getItemMetadata(
        'row',
        rowIndex,
      );
      itemStyleCache[key] = {
        position: 'absolute',
        left,
        top,
        height,
        width,
        background:
          (rowIndex + columnIndex) % 2 === 0
            ? 'rgba(0,0,0,.05)'
            : 'rgba(0,0,0,.1',
      };
    }
    return itemStyleCache[key];
  };

  scrollTo = ({ scrollTop, scrollLeft }) => {
    const _scrollTop =
      typeof scrollTop === 'number' ? scrollTop : this.state.scrollTop;
    const _scrollLeft =
      typeof scrollLeft === 'number' ? scrollLeft : this.state.scrollLeft;
    if (
      this.state.scrollTop !== scrollTop ||
      this.state.scrollLeft !== scrollLeft
    ) {
      this.setState(prevState => ({
        ...prevState,
        scrollTop: _scrollTop,
        scrollLeft: _scrollLeft,
        scrollY: _scrollTop / this.props.maxScrollY,
        scrollX: _scrollLeft / this.props.maxScrollX,
      }));
    }
  };

  headerStyle = memoizeOne((cellStyles, customStyle) => {
    let styleObj = {
      ...cellStyles,
      background: 'silver',
    };
    if (typeof customStyle === 'function') {
      styleObj = customStyle(styleObj, {});
    }
    return css({ ...styleObj });
  });

  _items = memoizeOne(
    (
      _rows,
      _rowStartIndex,
      _rowStopIndex,
      _columns,
      _columnStartIndex,
      _columnStopIndex,
      fixedTopCount,
      fixedBottomCount,
      fixedLeftCount,
      fixedRightCount,
    ) => {
      const __rows = [
        ['top', 0, fixedTopCount],
        ['middle', _rowStartIndex, _rowStopIndex + 1],
        ['bottom', _rows.length - fixedBottomCount, this.props._rows.length],
      ];

      const __columns = [
        ['left', 0, fixedLeftCount],
        ['center', _columnStartIndex, _columnStopIndex + 1],
        [
          'right',
          _columns.length - fixedRightCount,
          this.props._columns.length,
        ],
      ];

      let totalWidth = 0;
      for (let columnIndex = 0; columnIndex < _columns.length; columnIndex++) {
        totalWidth += _columns[columnIndex].meta.size;
      }

      let totalHeight = 0;
      for (let rowIndex = 0; rowIndex < _rows.length; rowIndex++) {
        totalHeight += _rows[rowIndex].meta.size;
      }

      const _rslt = {};

      const listStyleCache = this._getItemListCache(0, 0);

      const fixStyle = (type, styles, _row, _column) => {
        switch (type) {
          case 'top_right':
          case 'middle_right': {
            const newStyle = { ...styles };
            delete newStyle.left;
            newStyle.right =
              totalWidth - _column.meta.offset - _column.meta.size;
            return newStyle;
          }
          case 'bottom_left':
          case 'bottom_center': {
            const newStyle = { ...styles };
            delete newStyle.top;
            newStyle.bottom = totalHeight - _row.meta.offset - _row.meta.size;
            return newStyle;
          }

          case 'bottom_right': {
            const newStyle = { ...styles };
            delete newStyle.top;
            newStyle.bottom = totalHeight - _row.meta.offset - _row.meta.size;
            delete newStyle.left;
            newStyle.right =
              totalWidth - _column.meta.offset - _column.meta.size;
            return newStyle;
          }
        }
        return styles;
      };

      __rows.forEach(([rType, rowFr, rowTo]) => {
        __columns.forEach(([cType, colFr, colTo]) => {
          const key = `${rType}_${cType}`;
          const _key = `${rowFr}:${rowTo}:${colFr}:${colTo}`;

          if (listStyleCache[key] && listStyleCache[key][0] === _key) {
            _rslt[key] = listStyleCache[key][1];

            return;
          }

          _rslt[key] = [];

          for (let rowIndex = rowFr; rowIndex < rowTo; rowIndex++) {
            for (let columnIndex = colFr; columnIndex < colTo; columnIndex++) {
              _rslt[key].push(
                createElement(this.props.children, {
                  columnIndex,

                  key: `${rowIndex}:${columnIndex}`,
                  rowIndex,
                  style: fixStyle(
                    key,
                    this._getItemStyle(rowIndex, columnIndex),
                    _rows[rowIndex],
                    _columns[columnIndex],
                  ),
                }),
              );
            }
          }

          listStyleCache[key] = [_key, _rslt[key]];
        });
      });

      return _rslt;
    },
  );

  _getHorizontalRangeToRender = () => {
    const columnStartIndex = this.getColumnStartIndexForOffset(
      this.state.scrollLeft,
    );

    const columnStopIndex = this.getColumnStopIndexForStartIndex(
      columnStartIndex,
      this.state.scrollLeft,
    );
    return [columnStartIndex, columnStopIndex];
  };

  _getVerticalRangeToRender = () => {
    const rowStartIndex = this.getRowStartIndexForOffset(this.state.scrollTop);

    const rowStopIndex = this.getRowStopIndexForStartIndex(
      rowStartIndex,
      this.state.scrollTop,
    );
    return [rowStartIndex, rowStopIndex];
  };

  render() {
    const {
      containerStyle,
      contentHeight,
      contentWidth,
      guidelineStyle,

      overallHeight,
      overallWidth,

      scrollbarHandleStyle,
      scrollbarTrackStyle,
      scrollbarWidth,
      scrollbarX,
      scrollbarY,
    } = this.props;

    const [
      columnStartIndex,
      columnStopIndex,
    ] = this._getHorizontalRangeToRender();

    const [rowStartIndex, rowStopIndex] = this._getVerticalRangeToRender();

    const _items = this._items(
      this.props._rows,
      rowStartIndex,
      rowStopIndex,
      this.props._columns,
      columnStartIndex,
      columnStopIndex,
      this.props.fixedTopCount,
      this.props.fixedBottomCount,
      this.props.fixedLeftCount,
      this.props.fixedRightCount,
    );

    return template.call(this, {
      // variables
      unused__items: _items,
      unused_bottom: bottom,
      bottomOffset,
      unused_columnStartIndex: columnStartIndex,
      unused_columnStopIndex: columnStopIndex,
      containerStyle,
      contentHeight,
      contentWidth,
      guidelineStyle,
      items,
      unused_left: left,
      leftOffset,
      maxScrollX,
      maxScrollY,
      unused_overallHeight: overallHeight,
      unused_overallWidth: overallWidth,
      unused_right: right,
      rightOffset,
      unused_rowStartIndex: rowStartIndex,
      unused_rowStopIndex: rowStopIndex,
      scrollLeft,
      scrollTop,
      scrollbarHandleStyle,
      scrollbarTrackStyle,
      scrollbarWidth,
      scrollbarX,
      scrollbarY,
      unused_top: top,
      topOffset,
      totalHeight,
      totalWidth,
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

  withHOCs({ importAs: 'enhancer' }),

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

  withPropsOnChange(
    ['cellClassNames', 'cellStyle'],
    ({ cellClassNames, cellStyle: customStyle }) => ({
      cellStyle: cellStyle({ classNames: cellClassNames, customStyle }),
    }),
  ),

  // withPropsOnChange(['columns'], ({ columns }) => ({
  //   columns: (columns || [])
  //     .filter(column => column && (typeof column === 'string' || typeof column === 'object'))
  //     .map(column => (typeof column === 'string' ? { name: column } : { ...column }))
  //     .filter(column => column.name),
  // })),

  withPropsOnChange(['columns'], ({ columns, columnWidth }) => {
    let offset = 0;
    const _columns = (columns || [])
      .filter(
        column =>
          column && (typeof column === 'string' || typeof column === 'object'),
      )
      .map(
        column =>
          typeof column === 'string' ? { name: column } : { ...column },
      )
      .filter(column => column.name)
      .map((data, i) => {
        const meta = {
          offset,
          size: columnWidth,
        };
        offset += columnWidth;
        return {
          i,
          meta,
          data,
        };
      });
    return {
      _columns,
    };
  }),

  withPropsOnChange(
    ['columns', 'rows', 'rowHeight'],
    ({ columns, rows, rowHeight: _rowHeight }) => {
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

      rows = rows.map(row => {
        let _row;
        if (Array.isArray(row)) {
          _row = columns.reduce(
            (prev, e, i) => ({
              ...prev,
              [e.name]: row[i],
            }),
            {},
          );
        } else {
          _row = { ...row };
        }

        const data = {
          org: { ..._row },
          arr: columns.map(e => {
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

      const rowCount = (rows || []).length;

      const columnCount = (columns || []).length;

      const columnWidthFn = index => {
        let { width } = columns[index];

        width = isNaN(width) ? 80 : width;
        return width;
      };

      const rowHeightFn = index => rows[index]._height;

      const overallWidth = (columns || []).reduce(
        (prev, column, index) => prev + columnWidthFn(index, column),
        0,
      );

      const overallHeight = (rows || []).reduce(
        (prev, row, index) => prev + rowHeightFn(index, row),
        0,
      );

      const columnWidth = (from, limit = 1) => {
        limit = limit > 0 ? limit : 0;

        return new Array(limit)
          .fill(true)
          .map((e, i) => from + i)
          .reduce((prev, i) => prev + columnWidthFn(i), 0);
      };

      const rowHeight = (from, limit = 1) => {
        limit = limit > 0 ? limit : 0;

        return new Array(limit)
          .fill(true)
          .map((e, i) => from + i)
          .reduce((prev, i) => prev + rowHeightFn(i), 0);
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
    },
  ),

  withPropsOnChange(['rows'], ({ rows }) => {
    let offset = 0;
    const _rows = (rows || []).map((data, i) => {
      const size = data._height;
      const meta = {
        offset,
        size,
      };
      offset += size;
      return {
        i,
        meta,
        data,
      };
    });
    return {
      _rows,
    };
  }),

  withPropsOnChange(
    ['width', 'height', 'overallWidth', 'overallHeight', 'scrollbarWidth'],
    ({
      width: _width,
      height: _height,
      overallWidth,
      overallHeight,
      scrollbarWidth,
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
      });

      let contentWidth = width;
      let contentHeight = height;

      const scrollbarX = contentWidth < overallWidth;
      let scrollbarY = contentHeight < overallHeight;

      contentWidth -= scrollbarY ? scrollbarWidth : 0;
      contentHeight -= scrollbarX ? scrollbarWidth : 0;

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
    },
  ),

  withPropsOnChange(
    [
      'width',
      'overallWidth',
      'contentWidth',
      'contentHeight',
      'columnCount',
      'columnWidth',
      'rowCount',
      'rowHeight',
      'fixedTopCount',
      'fixedBottomCount',
      'fixedLeftCount',
      'fixedRightCount',
    ],
    ({
      width,
      overallWidth,
      contentWidth,
      contentHeight,
      columnCount,
      columnWidth,
      rowCount,
      rowHeight,
      fixedTopCount,
      fixedBottomCount,
      fixedLeftCount: leftCount,
      fixedRightCount: rightCount,
    }) => {
      let fixedLeftCount = leftCount;
      let fixedRightCount = rightCount;

      if (overallWidth <= width) {
        fixedLeftCount = 0;
        fixedRightCount = 0;
      }

      const center = {
        width:
          contentWidth -
          columnWidth(0, fixedLeftCount) -
          columnWidth(columnCount - fixedRightCount, fixedRightCount),
        height:
          contentHeight -
          rowHeight(0, fixedTopCount) -
          rowHeight(rowCount - fixedBottomCount, fixedBottomCount),
      };

      return {
        fixedTopCount,
        fixedBottomCount,
        fixedLeftCount,
        fixedRightCount,

        maxScrollX: Math.max(
          0,
          columnWidth(
            fixedLeftCount,
            columnCount - fixedLeftCount - fixedRightCount,
          ) - center.width,
        ),
        maxScrollY: Math.max(
          0,
          rowHeight(
            fixedTopCount,
            rowCount - fixedTopCount - fixedBottomCount,
          ) - center.height,
        ),
      };
    },
  ),
);

export default enhance(WindowTable);
