/* eslint-disable
  no-underscore-dangle,
  react/no-unused-state,
  react/prop-types,
  react/no-unused-prop-types,
  no-prototype-builtins,
  no-unused-vars,
*/
/* eslint-disabl */
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

    // this.gridRef = {
    //   center: React.createRef(),
    //   top: React.createRef(),
    //   bottom: React.createRef(),
    //   left: React.createRef(),
    //   right: React.createRef(),
    // };

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

  componentDidUpdate(prevProps, prevState) {
    const { scrollTop, scrollLeft } = this.state;

    if (
      prevState.scrollTop !== scrollTop ||
      prevState.scrollLeft !== scrollLeft
    ) {
      // cancelAnimationFrame(this.animFrame);
      // this.animFrame = requestAnimationFrame(() => {
      // Object.keys(this.gridRef)
      //   .filter(key => this.gridRef[key].current)
      //   .forEach(key => this.gridRef[key].current.scrollTo(this.state));
      if (this.scrollbarRef.x.current) {
        this.scrollbarRef.x.current.scrollTo(this.state);
      }
      if (this.scrollbarRef.y.current) {
        this.scrollbarRef.y.current.scrollTo(this.state);
      }
      Object.keys(this.guidelineRef)
        .filter(key => this.guidelineRef[key].current)
        .forEach(key => this.guidelineRef[key].current.update(this.state));
      // });
    }
  }

  componentWillUnmount() {
    if (this.resetIsScrollingTimeoutId !== null) {
      clearTimeout(this.resetIsScrollingTimeoutId);
    }
  }

  getItemCount = itemType =>
    (itemType === 'row' ? this.props.rowCount : this.props.columnCount);

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
      getSize,
    } = this.props;

    let maxOffset =
      (itemType === 'row' ? contentHeight : contentWidth) + offset;
    const postfixCount =
      itemType === 'row' ? fixedBottomCount : fixedRightCount;
    if (postfixCount > 0) {
      maxOffset -= getSize(itemType, postfixCount * -1);
    }

    const itemMetadata = getItemMetadata(itemType, startIndex);
    let currOffset = itemMetadata.offset + itemMetadata.size;
    let stopIndex = startIndex;
    const itemCount = this.getItemCount(itemType);
    while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
      stopIndex += 1;
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

  itemCache = memoizeOne((_, __) => ({}));

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
            ? '#fff' : '#eee',
        // ? 'rgba(0,0,0,.05)'
        // : 'rgba(0,0,0,.1',
      };
    }
    // ? '#fff' // 'rgba(0,0,0,.05)'
    // : '#eee', // 'rgba(0,0,0,.1',
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
      this.setState(
        prevState => ({
          ...prevState,
          isScrolling: true,
          scrollTop: _scrollTop,
          scrollLeft: _scrollLeft,
          scrollY: _scrollTop / this.props.maxScrollY,
          scrollX: _scrollLeft / this.props.maxScrollX,
        }),
        this.resetIsScrollingDebounced,
      );
    }
  };

  resetIsScrollingDebounced = () => {
    if (this.resetIsScrollingTimeoutId !== null) {
      clearTimeout(this.resetIsScrollingTimeoutId);
    }

    this.resetIsScrollingTimeoutId = setTimeout(
      this.resetIsScrolling,
      IS_SCROLLING_DEBOUNCE_INTERVAL,
    );
  };

  resetIsScrolling = () => {
    this.resetIsScrollingTimeoutId = null;
    this.itemCache(-1);
    this.setState(prevState => ({ ...prevState, isScrolling: false }));
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

  itemStyle = (type, rowIndex, columnIndex, totalHeight, totalWidth) => {
    const styles = this._getItemStyle(rowIndex, columnIndex);
    const _row = this.props.getItemMetadata('row', rowIndex);
    const _column = this.props.getItemMetadata('column', columnIndex);
    // this.props.getItemMetadata('column', columnIndex),

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
      default:
        break;
    }
    return styles;
  };

  items = memoizeOne((
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
    const rowRanges = [
      ['top', 0, fixedTopCount],
      ['middle', rowStartIndex, rowStopIndex + 1],
      ['bottom', rowCount - fixedBottomCount, rowCount],
    ];
    const columnRanges = [
      ['left', 0, fixedLeftCount],
      ['center', columnStartIndex, columnStopIndex + 1],
      ['right', columnCount - fixedRightCount, columnCount],
    ];

    const items = {};

    const itemCache = this.itemCache(0, 0);

    rowRanges.forEach(([rType, rowFr, rowTo]) => {
      columnRanges.forEach(([cType, colFr, colTo]) => {
        const section = `${rType}_${cType}`;
        const rangeKey = `${rowFr}_${rowTo}_${colFr}_${colTo}`;

        if (itemCache[section] && itemCache[section][0] === rangeKey) {
          // [,items[section]] = itemCache[section][1];
          [, items[section]] = itemCache[section];

          return;
        }

        items[section] = [];

        for (let rowIndex = rowFr; rowIndex < rowTo; rowIndex += 1) {
          for (
            let columnIndex = colFr;
            columnIndex < colTo;
            columnIndex += 1
          ) {
            items[section].push(createElement(this.props.children, {
              columnIndex,
              isScrolling,
              key: `${rowIndex}_${columnIndex}`,
              rowIndex,
              style: this.itemStyle(
                section,
                rowIndex,
                columnIndex,
                totalHeight,
                totalWidth,
              ),
            }));
          }
        }

        itemCache[section] = [rangeKey, items[section]];
      });
    });

    return items;
  });

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
        leftOffset,
        rightOffset,
        topOffset,
        maxScrollX,
        maxScrollY,
        bottomOffset,
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
      bottomOffset,
      containerStyle,
      contentHeight,
      contentWidth,
      guidelineStyle,
      items,
      leftOffset,
      maxScrollX,
      maxScrollY,
      rightOffset,
      scrollLeft,
      scrollTop,
      scrollbarHandleStyle,
      scrollbarTrackStyle,
      scrollbarWidth,
      scrollbarX,
      scrollbarY,
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

WindowTable.propTypes = {
  scrollTop: PropTypes.number,
  scrollLeft: PropTypes.number,
  // maxScrollY: PropTypes.number,
  // maxScrollX: PropTypes.number,

  cellStyle: PropTypes.string,

  // columns: PropTypes.array.isRequired,
  // columnWidth: PropTypes.func.isRequired,
  containerStyle: PropTypes.string,
  contentHeight: PropTypes.number.isRequired,
  contentWidth: PropTypes.number.isRequired,
  guidelineStyle: PropTypes.func,

  // left: PropTypes.object,
  // right: PropTypes.object,
  // center: PropTypes.object.isRequired,
  // top: PropTypes.object,
  // bottom: PropTypes.object,

  // rowHeight: PropTypes.func.isRequired,
  // rows: PropTypes.array.isRequired,
  scrollbarHandleStyle: PropTypes.func,
  scrollbarTrackStyle: PropTypes.func,
  scrollbarWidth: PropTypes.number.isRequired,
  scrollbarX: PropTypes.bool.isRequired,
  scrollbarY: PropTypes.bool.isRequired,
};

WindowTable.defaultProps = {
  scrollTop: 0,
  scrollLeft: 0,
  // maxScrollY: 1,
  // maxScrollX: 1,

  cellStyle: undefined,
  containerStyle: undefined,
  guidelineStyle: undefined,
  scrollbarHandleStyle: undefined,
  scrollbarTrackStyle: undefined,

  // left: undefined,
  // right: undefined,

  // top: undefined,
  // bottom: undefined,
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
    ({
      columnMetadataMap, rowMetadataMap, columnCount, rowCount,
    }) => ({
      getItemMetadata: (itemType, itemIndex) =>
        (itemType === 'column' ? columnMetadataMap : rowMetadataMap)[itemIndex],
      getSize: (itemType, count) => {
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
      // getSize: (itemType, startIndex, stopIndex) => {
      //   const itemMetadataMap =
      //     itemType === 'column' ? columnMetadataMap : rowMetadataMap;
      //   let size = 0;
      //   for (
      //     let itemIndex = startIndex;
      //     itemIndex < stopIndex + 1;
      //     itemIndex += 1
      //   ) {
      //     size += itemMetadataMap[itemIndex].size;
      //   }
      //   return size;
      // },
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
      // 'contentWidth',
      // 'contentHeight',
      // 'columnCount',
      'columnWidth',
      // 'rowCount',
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
      totalHeight,
      contentWidth,
      contentHeight,
      // columnCount,

      // rowCount,

      fixedTopCount: topCount,
      fixedBottomCount: bottomCount,
      fixedLeftCount,
      fixedRightCount,
      getSize,
      // getSize,
      // getSize,
    }) => {
      let leftCount = fixedLeftCount;
      let rightCount = fixedRightCount;

      if (totalWidth <= width) {
        leftCount = 0;
        rightCount = 0;
      }

      const leftOffset = getSize('column', leftCount);
      const rightOffset = getSize('column', rightCount * -1);
      const topOffset = getSize('row', topCount);
      const bottomOffset = getSize('row', bottomCount * -1);

      // const center = {
      //   // width:
      //   //   contentWidth -
      //   //   getSize('column', leftCount) -
      //   //   getSize('column', rightCount * -1),
      //   height:
      //     contentHeight -
      //     getSize('row', topCount) -
      //     getSize('row', bottomCount * -1),
      // };

      return {
        topCount,
        bottomCount,
        leftCount,
        rightCount,
        leftOffset,
        rightOffset,
        topOffset,
        bottomOffset,
        maxScrollX: totalWidth - contentWidth,
        maxScrollY: totalHeight - contentHeight,
        // maxScrollX: 0,
        // _maxScrollX: Math.max(
        //   0,
        //   getSize('column', leftCount, columnCount - leftCount - rightCount) -
        //     // center.width,

        //     (contentWidth -
        //       getSize('column', leftCount) -
        //       getSize('column', rightCount * -1)),
        // ),
        // maxScrollY: 0,
        // _maxScrollY: Math.max(
        //   0,
        //   getSize('row', topCount, rowCount - topCount - bottomCount) -
        //     // center.height,
        //     (contentHeight -
        //       getSize('row', topCount) -
        //       getSize('row', bottomCount * -1)),
        // ),
      };
    },
  ),
);

export default enhance(WindowTable);
