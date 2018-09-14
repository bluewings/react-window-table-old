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

const IS_SCROLLING_DEBOUNCE_INTERVAL = 150;

const measure = (className, width, height) => {
  const divEl = document.createElement('div');
  divEl.classList.add(className);
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
      isScrolling: false,
      scrollTop: props.scrollTop || 0,
      scrollLeft: props.scrollLeft || 0,
      scrollX: props.scrollLeft / props.maxScrollX,
      scrollY: props.scrollTop / props.maxScrollY,
    };

    this.tableRef = React.createRef();
    this.titleRef = React.createRef();

    this.secRef = React.createRef();
  }

  componentWillUnmount() {
    if (this._resetIsScrollingTimeoutId !== null) {
      clearTimeout(this._resetIsScrollingTimeoutId);
    }
  }

  _resetIsScrollingDebounced = () => {
    if (this._resetIsScrollingTimeoutId !== null) {
      clearTimeout(this._resetIsScrollingTimeoutId);
    }

    this._resetIsScrollingTimeoutId = setTimeout(
      this._resetIsScrolling,
      IS_SCROLLING_DEBOUNCE_INTERVAL
    );
  };

  _resetIsScrolling = () => {
    this._resetIsScrollingTimeoutId = null;
    this._getItemListCache(-1);
    this.setState({ isScrolling: false }, () => {
      // Clear style cache after state update has been committed.
      // This way we don't break pure sCU for items that don't use isScrolling param.
      // this._getItemStyleCache(-1);
      // this._getItemListCache(-1);
    });
  };

  getItemCount = itemType =>
    itemType === 'row' ? this.props.rowCount : this.props.columnCount;

  getStartIndexForOffset = (itemType, offset) => {
    const { fixedTopCount, fixedLeftCount, getItemMetadata } = this.props;
    const itemIndex = itemType === 'row' ? fixedTopCount : fixedLeftCount;
    const itemMetadata = getItemMetadata(itemType, itemIndex);
    return this.findNearestItem(itemType, offset + itemMetadata.offset);
  };

  getStopIndexForStartIndex = (itemType, startIndex, offset) => {
    const {
      contentWidth,
      contentHeight,
      fixedBottomCount,
      fixedRightCount,
      getItemMetadata,
      _getSize,
    } = this.props;

    let maxOffset =
      (itemType === 'row' ? contentHeight : contentWidth) + offset;
    const postfixCount =
      itemType === 'row' ? fixedBottomCount : fixedRightCount;
    if (postfixCount > 0) {
      maxOffset -= _getSize(itemType, postfixCount * -1);
    }

    const itemMetadata = getItemMetadata(itemType, startIndex);
    let currOffset = itemMetadata.offset + itemMetadata.size;
    let stopIndex = startIndex;
    const itemCount = this.getItemCount(itemType);
    while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
      stopIndex++;
      currOffset += getItemMetadata(itemType, stopIndex).size;
    }

    return stopIndex;
  };

  getRangeToRender = () => {
    const { scrollTop, scrollLeft } = this.state;
    const rowStartIndex = this.getStartIndexForOffset('row', scrollTop);
    const rowStopIndex = this.getStopIndexForStartIndex(
      'row',
      rowStartIndex,
      scrollTop,
    );
    const columnStartIndex = this.getStartIndexForOffset('column', scrollLeft);
    const columnStopIndex = this.getStopIndexForStartIndex(
      'column',
      columnStartIndex,
      scrollLeft,
    );
    return [rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex];
  };

  // binary search
  findNearestItem = (itemType, offset) => {
    let low = 0;
    let high = this.getItemCount(itemType) - 1;
    while (low <= high) {
      const middle = low + Math.floor((high - low) / 2);
      const currentOffset = this.props.getItemMetadata(itemType, middle).offset;
      if (currentOffset === offset) {
        return middle;
      } else if (currentOffset < offset) {
        low = middle + 1;
      } else if (currentOffset > offset) {
        high = middle - 1;
      }
    }
    return low > 0 ? low - 1 : 0;
  };

  _getItemListCache = memoizeOne((_, __) => ({}));

  _getItemStyleCache = memoizeOne((_, __) => ({}));

  _getItemStyle = (rowIndex, columnIndex) => {
    const key = `${rowIndex}:${columnIndex}`;

    const itemStyleCache = this._getItemStyleCache(0, 0);

    if (!itemStyleCache.hasOwnProperty(key)) {
      const { offset: left, size: width } = this.props.getItemMetadata(
        'column',
        columnIndex,
      );
      const { offset: top, size: height } = this.props.getItemMetadata(
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
        isScrolling: true,
        scrollTop: _scrollTop,
        scrollLeft: _scrollLeft,
        scrollY: _scrollTop / this.props.maxScrollY,
        scrollX: _scrollLeft / this.props.maxScrollX,
      }), this._resetIsScrollingDebounced);
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

  items = memoizeOne(
    (
      totalHeight,
      totalWidth,
      rowCount,
      rowStartIndex,
      rowStopIndex,
      columnCount,
      columnStartIndex,
      columnStopIndex,
      fixedTopCount,
      fixedBottomCount,
      fixedLeftCount,
      fixedRightCount,
      isScrolling,
    ) => {

      const ranges = {
        row: [
          ['top', 0, fixedTopCount],
          ['middle', rowStartIndex, rowStopIndex + 1],
          ['bottom', rowCount - fixedBottomCount, rowCount],
        ],
        column: [
          ['left', 0, fixedLeftCount],
          ['center', columnStartIndex, columnStopIndex + 1],
          ['right', columnCount - fixedRightCount, columnCount],
        ]
      }
      // const ranges.;

      // const ranges.column = [
      //   ['left', 0, fixedLeftCount],
      //   ['center', columnStartIndex, columnStopIndex + 1],
      //   ['right', columnCount - fixedRightCount, columnCount],
      // ];

      const _rslt = {};

      const listStyleCache = this._getItemListCache(0, 0);

      const fixStyle = (type, styles, _row, _column) => {
        switch (type) {
          case 'top_right':
          case 'middle_right': {
            const newStyle = { ...styles };
            delete newStyle.left;
            newStyle.right = totalWidth - _column.offset - _column.size;
            return newStyle;
          }
          case 'bottom_left':
          case 'bottom_center': {
            const newStyle = { ...styles };
            delete newStyle.top;
            newStyle.bottom = totalHeight - _row.offset - _row.size;
            return newStyle;
          }

          case 'bottom_right': {
            const newStyle = { ...styles };
            delete newStyle.top;
            newStyle.bottom = totalHeight - _row.offset - _row.size;
            delete newStyle.left;
            newStyle.right = totalWidth - _column.offset - _column.size;
            return newStyle;
          }
        }
        return styles;
      };

      ranges.row.forEach(([rType, rowFr, rowTo]) => {
        ranges.column.forEach(([cType, colFr, colTo]) => {
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
                  isScrolling,
                  key: `${rowIndex}:${columnIndex}`,
                  rowIndex,
                  style: fixStyle(
                    key,
                    this._getItemStyle(rowIndex, columnIndex),
                    this.props.getItemMetadata('row', rowIndex),
                    this.props.getItemMetadata('column', columnIndex),
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

  render() {
    const {
      props: {
        columnCount,
        containerStyle,
        contentHeight,
        contentWidth,
        fixedBottomCount,
        fixedLeftCount,
        fixedRightCount,
        fixedTopCount,
        guidelineStyle,
        rowCount,
        scrollbarHandleStyle,
        scrollbarTrackStyle,
        scrollbarWidth,
        scrollbarX,
        scrollbarY,
        totalHeight,
        totalWidth,
      },
      state: { scrollLeft, scrollTop, isScrolling },
    } = this;

    const [
      rowStartIndex,
      rowStopIndex,
      columnStartIndex,
      columnStopIndex,
    ] = this.getRangeToRender();

    const items = this.items(
      totalHeight,
      totalWidth,
      rowCount,
      rowStartIndex,
      rowStopIndex,
      columnCount,
      columnStartIndex,
      columnStopIndex,
      fixedTopCount,
      fixedBottomCount,
      fixedLeftCount,
      fixedRightCount,
      isScrolling,
    );

    return template.call(this, {
      // variables
      containerStyle,
      contentHeight,
      contentWidth,
      unused_guidelineStyle: guidelineStyle,
      items,
      scrollLeft,
      scrollTop,
      scrollbarHandleStyle,
      scrollbarTrackStyle,
      scrollbarWidth,
      scrollbarX,
      scrollbarY,
      totalHeight,
      totalWidth,
      unused_Guideline: Guideline,
      // components
      Scrollarea,
      Scrollbar,
    });
  }
}

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

  withPropsOnChange(
    ['columnCount', 'columnWidth'],
    ({ columnCount, columnWidth }) => {
      const itemMetadataMap = {};
      let offset = 0;
      const getSize =
        typeof columnWidth === 'function' ? columnWidth : () => columnWidth;
      for (let itemIndex = 0; itemIndex < columnCount; itemIndex += 1) {
        const size = getSize(itemIndex);
        itemMetadataMap[itemIndex] = { size, offset };
        offset += size;
      }
      return { columnMetadataMap: itemMetadataMap, totalWidth: offset };
    },
  ),

  withPropsOnChange(['rowCount', 'rowHeight'], ({ rowCount, rowHeight }) => {
    const itemMetadataMap = {};
    let offset = 0;
    const getSize =
      typeof rowHeight === 'function' ? rowHeight : () => rowHeight;
    for (let itemIndex = 0; itemIndex < rowCount; itemIndex += 1) {
      const size = getSize(itemIndex);
      itemMetadataMap[itemIndex] = { size, offset };
      offset += size;
    }
    return { rowMetadataMap: itemMetadataMap, totalHeight: offset };
  }),

  withPropsOnChange(
    ['columnMetadataMap', 'rowMetadataMap'],
    ({ columnMetadataMap, rowMetadataMap, columnCount, rowCount }) => ({
      getItemMetadata: (itemType, itemIndex) =>
        (itemType === 'column' ? columnMetadataMap : rowMetadataMap)[itemIndex],
      _getSize: (itemType, count) => {
        const itemMetadataMap =
          itemType === 'column' ? columnMetadataMap : rowMetadataMap;
        const itemCount = itemType === 'column' ? columnCount : rowCount;
        let size = 0;
        if (count > 0) {
          for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
            size += itemMetadataMap[itemIndex].size;
          }
        } else {
          for (
            let itemIndex = itemCount - 1;
            itemIndex >= itemCount + count;
            itemIndex -= 1
          ) {
            size += itemMetadataMap[itemIndex].size;
          }
        }
        return size;
      },
      getSize: (itemType, startIndex, stopIndex) => {
        const itemMetadataMap =
          itemType === 'column' ? columnMetadataMap : rowMetadataMap;
        let size = 0;
        for (
          let itemIndex = startIndex;
          itemIndex < stopIndex + 1;
          itemIndex += 1
        ) {
          size += itemMetadataMap[itemIndex].size;
        }
        return size;
      },
    }),
  ),

  withPropsOnChange(
    ['width', 'height', 'totalWidth', 'totalHeight', 'scrollbarWidth'],
    ({
      width: _width,
      height: _height,
      totalWidth,
      totalHeight,
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

      const scrollbarX = contentWidth < totalWidth;
      let scrollbarY = contentHeight < totalHeight;

      contentWidth -= scrollbarY ? scrollbarWidth : 0;
      contentHeight -= scrollbarX ? scrollbarWidth : 0;

      if (totalHeight < contentHeight) {
        contentHeight = totalHeight;
      }

      if (scrollbarX && !scrollbarY && contentHeight < totalHeight) {
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
      'totalWidth',
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
      'getItemMetadata',
    ],
    ({
      width,

      totalWidth,
      contentWidth,
      contentHeight,
      columnCount,
      
      rowCount,
      
      fixedTopCount: topCount,
      fixedBottomCount: bottomCount,
      fixedLeftCount,
      fixedRightCount,
      getSize,
      _getSize,
    }) => {
      let leftCount = fixedLeftCount;
      let rightCount = fixedRightCount;

      if (totalWidth <= width) {
        leftCount = 0;
        rightCount = 0;
      }

      const center = {
        width:
          contentWidth -
          _getSize('column', leftCount) -
          _getSize('column', rightCount * -1),
        height:
          contentHeight -
          _getSize('row', topCount) -
          _getSize('row', bottomCount * -1),
      };

      return {
        topCount,
        bottomCount,
        leftCount,
        rightCount,
        maxScrollX: 0,
        _maxScrollX: Math.max(
          0,
          getSize('column', leftCount, columnCount - leftCount - rightCount) -
            center.width,
        ),
        maxScrollY: Math.max(
          0,
          getSize('row', topCount, rowCount - topCount - bottomCount) -
            center.height,
        ),
      };
    },
  ),
);

export default enhance(WindowTable);
