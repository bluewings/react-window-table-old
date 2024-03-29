/* eslint-disable
  no-underscore-dangle,
  react/no-unused-state,
  react/prop-types,
  react/no-unused-prop-types,
  no-prototype-builtins,
  no-unused-vars,
*/
/* eslint-disabl */
import React, { Fragment, PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import {
  compose,
  defaultProps,
  withPropsOnChange,
  withState,
  withHandlers,
} from 'recompose';
import { Map } from 'immutable';
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

const measureDiv = (className, width, height) => {
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

    // this.containerRef = React.createRef();

    this.gridRef = {
      center: React.createRef(),
      top: React.createRef(),
      bottom: React.createRef(),
      left: React.createRef(),
      right: React.createRef(),
    };
    // console.log('> class WindowTable extends PureComponent');

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
    // this.titleRef = React.createRef();

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

  // getItemCount = itemType =>
  //   (itemType === 'row' ? this.props.rowCount : this.props.columnCount);

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
    const itemCount = this.props.getItemCount(itemType);
    while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
      stopIndex += 1;
      currOffset += getItemMetadata(itemType, stopIndex).size;
    }

    return stopIndex;
  };

  // getRangeToRender = (scrollTop, scrollLeft) => {
  //   // const { scrollTop, scrollLeft } = this.state;
  //   const rowStartIndex = this.getStartIndexForOffset('row', scrollTop);
  //   const rowStopIndex = this.getStopIndexForStartIndex(
  //     'row',
  //     rowStartIndex,
  //     scrollTop,
  //   );
  //   const columnStartIndex = this.getStartIndexForOffset('column', scrollLeft);
  //   const columnStopIndex = this.getStopIndexForStartIndex(
  //     'column',
  //     columnStartIndex,
  //     scrollLeft,
  //   );
  //   return [rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex];
  // };

  // binary search
  findNearestItem = (itemType, offset) => {
    let low = 0;
    let high = this.props.getItemCount(itemType) - 1;
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
        // background: (rowIndex + columnIndex) % 2 === 0 ? '#fff' : '#eee',
        // ? 'rgba(0,0,0,.05)'
        // : 'rgba(0,0,0,.1',
      };
    }
    // ? '#fff' // 'rgba(0,0,0,.05)'
    // : '#eee', // 'rgba(0,0,0,.1',
    return itemStyleCache[key];
  };

  handleThrottledScroll = ({ scrollTop, scrollLeft }) => {
    this.props.updateScrollInfo({ scrollTop, scrollLeft });
    // this.props.updateScrollInfo({ scrollTop, scrollLeft });
  };

  scrollTo = ({ scrollTop, scrollLeft }) => {
    const translateXY = `translate3d(${scrollLeft * -1}px, ${scrollTop * -1}px, 0)`;
    const translateX = `translate3d(${scrollLeft * -1}px, 0, 0)`;
    const translateY = `translate3d(0, ${scrollTop * -1}px, 0)`;
    if (this.secRef.current) {
      this.secRef.current.style.transform = translateXY;
    }
    if (this.gridRef.top.current) {
      this.gridRef.top.current.style.transform = translateX;
    }
    if (this.gridRef.bottom.current) {
      this.gridRef.bottom.current.style.transform = translateX;
    }
    if (this.gridRef.right.current) {
      this.gridRef.right.current.style.transform = translateY;
    }
    if (this.gridRef.left.current) {
      this.gridRef.left.current.style.transform = translateY;
    }

    // transform: "translate3d(" + (scrollLeft * -1) + "px, " + (scrollTop * -1) + "px, 0)"
    // console.log(scrollTop, scrollLeft);
    // const random = parseInt(Math.random() * 9000 + 1000, 10);
    // console.log(`%c scroll ${random} `, 'background:red;color:#fff');
    // const _scrollTop =
    //   typeof scrollTop === 'number' ? scrollTop : this.state.scrollTop;
    // const _scrollLeft =
    //   typeof scrollLeft === 'number' ? scrollLeft : this.state.scrollLeft;
    // if (
    //   this.state.scrollTop !== scrollTop ||
    //   this.state.scrollLeft !== scrollLeft
    // ) {
    //   this.setState(
    //     prevState => ({
    //       ...prevState,
    //       isScrolling: true,
    //       scrollTop: _scrollTop,
    //       scrollLeft: _scrollLeft,
    //       scrollY: _scrollTop / this.props.maxScrollY,
    //       scrollX: _scrollLeft / this.props.maxScrollX,
    //     }),
    //     this.resetIsScrollingDebounced,
    //   );
    // }
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

  itemClassName = (
    classNames, vArea, hArea, rowEven, columnEven,
    horizontalFirst,
    verticalFirst,
    horizontalLast,
    verticalLast,
  ) => {
    return 'aaa';
    /* eslint-disable */
    // const cls = 'aaa';
    const className = [
      classNames.root,
      classNames[vArea],
      classNames[hArea],
      rowEven ? classNames.rowEven : classNames.rowOdd,
      columnEven ? classNames.columnEven : classNames.columnOdd,
      horizontalFirst && classNames.horizontalFirst,
      verticalFirst && classNames.verticalFirst,
      horizontalLast && classNames.horizontalLast,
      verticalLast && classNames.verticalLast,
    ].filter(e => e).join(' ');


    // const applyStyle = [
    //   this.props.cellStyle,
    //   sectionClass,
    //   columnIndex === 0 && classNames.horizontalFirst,
    //   rowIndex === 0 && classNames.verticalFirst,
    //   columnIndex === columnCount - 1 && classNames.horizontalLast,
    //   rowIndex === rowCount - 1 && classNames.verticalLast,
    //   _colIndex % 2 ? classNames.columnOdd : classNames.columnEven,
    //   _rowIndex % 2 ? classNames.rowOdd : classNames.rowEven,
    //   `cell-text-align-${column.textAlign}`,
    // ].join(' ');
    return className;
  }

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
      ['top', 0, fixedTopCount, 0, fixedTopCount],
      ['middle', rowStartIndex, rowStopIndex + 1, fixedTopCount, rowCount - fixedBottomCount],
      ['bottom', rowCount - fixedBottomCount, rowCount, rowCount - fixedBottomCount, rowCount],
    ];
    const columnRanges = [
      ['left', 0, fixedLeftCount, 0, fixedLeftCount],
      ['center', columnStartIndex, columnStopIndex + 1, fixedLeftCount, columnCount - fixedRightCount],
      ['right', columnCount - fixedRightCount, columnCount, columnCount - fixedRightCount, columnCount],
    ];

    const items = {};

    const itemCache = this.itemCache(0, 0);

    // const itemCache = this.itemCache(0, 0);
    itemCache._tmp = itemCache._tmp || {};
    let fromCache = 0;
    let noCache = 0;
    rowRanges.forEach(([rType, rowFr, rowTo, rowAllFr, rowAllTo]) => {
      columnRanges.forEach(([cType, colFr, colTo, colAllFr, colAllTo]) => {
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
            // let cell;
            const key = `${rowIndex}_${columnIndex}`;
            if (!itemCache._tmp[key]) {
              itemCache._tmp[key] = createElement(this.props.children, {
                columnIndex,
                isScrolling,
                key: `${rowIndex}_${columnIndex}`,
                rowIndex,
                className: this.itemClassName(
                  this.props.cellClassNames,
                  rType,
                  cType,
  
                  rowIndex % 2 === 0, // rowEven
                  columnIndex % 2 === 0, // columnEven
                  columnIndex === colAllFr,
                  rowIndex === rowAllFr,
                  columnIndex === colAllTo - 1,
                  rowIndex === rowAllTo - 1,
  
  
                ),
                style: this.itemStyle(
                  section,
                  rowIndex,
                  columnIndex,
                  totalHeight,
                  totalWidth,
                ),
              })
            //   console.log('not cached');
            noCache += 1;
            } else {
              fromCache += 1;
            //   console.log('use cached');
            }

            const cell = itemCache._tmp[key];


            items[section].push(cell);
          }
        }



        itemCache[section] = [rangeKey, items[section]];
      });
    });
    // console.log({ fromCache, noCache });
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
        // rowStartIndex,
        // rowStopIndex,
        // columnStartIndex,
        // columnStopIndex,

        overscanRowStartIndex: rowStartIndex,
        overscanRowStopIndex: rowStopIndex,
        overscanColumnStartIndex: columnStartIndex,
        overscanColumnStopIndex: columnStopIndex,
      },
      state: {
        scrollLeft,
        scrollTop,
        isScrolling,
        // rowStartIndex,
        // rowStopIndex,
        // columnStartIndex,
        // columnStopIndex,
      },
    } = this;

    // const [
    //   rowStartIndex,
    //   rowStopIndex,
    //   columnStartIndex,
    //   columnStopIndex,
    // ] = this.getRangeToRender(scrollTop, scrollLeft);
    let items;

    if (rowStartIndex !== rowStopIndex) {
      items = this.items(
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
    }

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
      unused_scrollbarHandleStyle: scrollbarHandleStyle,
      unused_scrollbarTrackStyle: scrollbarTrackStyle,
      unused_scrollbarWidth: scrollbarWidth,
      unused_scrollbarX: scrollbarX,
      unused_scrollbarY: scrollbarY,
      topOffset,
      totalHeight,
      totalWidth,
      unused_Fragment: Fragment,
      // components
      Guideline,
      Scrollarea,
      unused_Scrollbar: Scrollbar,
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
    overscanCount: 3,
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

      getItemCount: itemType => (itemType === 'row' ? rowCount : columnCount),

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
      // console.log(_width, _height);
      let containerStyle = css({
        border: '1px solid #c4c4c4',
        boxSizing: 'border-box',
        width: _width,
        height: _height,
        // maxHeight: _height,
      });

      const { width, height } = measureDiv(containerStyle, _width, _height);

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

  withState('scrollInfo', '_updateScrollInfo', ({ scrollTop, scrollLeft }) =>
    Map({
      scrollTop: scrollTop || 0,
      scrollLeft: scrollLeft || 0,
      vScrollDirection: 'neutral',
      hScrollDirection: 'neutral',
      isScrolling: false,
    })),

  withHandlers({
    updateScrollInfo: ({ scrollInfo, _updateScrollInfo }) => ({
      scrollTop: _scrollTop,
      scrollLeft: _scrollLeft,
    }) => {
      const prevScrollTop = scrollInfo.get('scrollTop');
      const prevScrollLeft = scrollInfo.get('scrollLeft');

      const scrollTop = typeof _scrollTop === 'number' ? _scrollTop : prevScrollTop;
      const scrollLeft = typeof _scrollLeft === 'number' ? _scrollLeft : prevScrollLeft;

      const DIRECTION_CRITERIA = 5;

      const deltaY = scrollTop - prevScrollTop;
      const deltaX = scrollLeft - prevScrollLeft;

      let vScrollDirection;
      if (deltaY > DIRECTION_CRITERIA) {
        vScrollDirection = 'forward';
      } else if (deltaY < DIRECTION_CRITERIA * -1) {
        vScrollDirection = 'backward';
      } else {
        vScrollDirection = 'neutral';
      }

      let hScrollDirection;
      if (deltaX > DIRECTION_CRITERIA) {
        hScrollDirection = 'forward';
      } else if (deltaX < DIRECTION_CRITERIA * -1) {
        hScrollDirection = 'backward';
      } else {
        hScrollDirection = 'neutral';
      }

      const nextScrollInfo = scrollInfo
        .set('scrollTop', scrollTop)
        .set('scrollLeft', scrollLeft)
        .set('vScrollDirection', vScrollDirection)
        .set('hScrollDirection', hScrollDirection);
      if (scrollInfo !== nextScrollInfo) {
        _updateScrollInfo(nextScrollInfo);
      }
    },
  }),

  withPropsOnChange(
    ['fixedTopCount', 'fixedBottomCount', 'fixedLeftCount', 'fixedRightCount',
    'contentWidth',
    'contentHeight',
  ],
    ({
      fixedTopCount,
      fixedBottomCount,
      fixedLeftCount,
      fixedRightCount,
      getItemCount,
      getItemMetadata,
      contentWidth,
      contentHeight,
      getSize,
    }) => {
      // binary search
      const findNearestItem = (itemType, offset) => {
        let low = 0;
        let high = getItemCount(itemType) - 1;
        while (low <= high) {
          const middle = low + Math.floor((high - low) / 2);
          const currentOffset = getItemMetadata(itemType, middle).offset;
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

      const getStartIndexForOffset = (itemType, offset) => {
        // const { fixedTopCount, fixedLeftCount, getItemMetadata } = this.props;
        const itemIndex = itemType === 'row' ? fixedTopCount : fixedLeftCount;
        const itemMetadata = getItemMetadata(itemType, itemIndex);
        return findNearestItem(itemType, offset + itemMetadata.offset);
      };

      const getStopIndexForStartIndex = (itemType, startIndex, offset) => {
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
        const itemCount = getItemCount(itemType);
        while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
          stopIndex += 1;
          currOffset += getItemMetadata(itemType, stopIndex).size;
        }

        return stopIndex;
      };

      const getOverscanCount = (
        direction,
        startIndex,
        stopIndex,
        minIndex,
        maxIndex,
        _overscanCount,
      ) => {
        const overscanBackward =
          direction === 'backward' ? Math.max(1, _overscanCount) : 1;
        const overscanForward =
          direction === 'forward' ? Math.max(1, _overscanCount) : 1;
        return {
          overscanStartIndex: Math.max(0, minIndex, startIndex - overscanBackward),
          overscanStopIndex: Math.max(
            0,
            Math.min(maxIndex, stopIndex + overscanForward),
          ),
        };
      };

      return {
        getStartIndexForOffset,
        getStopIndexForStartIndex,
        getOverscanCount,
      };
    },
  ),

  withPropsOnChange(
    ['scrollInfo', 'getStartIndexForOffset', 'getStopIndexForStartIndex'],
    ({
      scrollInfo,
      getStartIndexForOffset: getStartIndex,
      getStopIndexForStartIndex: getStopIndex,
      overscanCount,
      columnCount,
      rowCount,
      fixedTopCount,
      fixedBottomCount,
      fixedLeftCount,
      fixedRightCount,
      getOverscanCount,
    }) => {
      const scrollTop = scrollInfo.get('scrollTop');
      const scrollLeft = scrollInfo.get('scrollLeft');
      const vScrollDirection = scrollInfo.get('vScrollDirection');
      const hScrollDirection = scrollInfo.get('hScrollDirection');
      const rowStartIndex = getStartIndex('row', scrollTop);
      const rowStopIndex = getStopIndex('row', rowStartIndex, scrollTop);
      const columnStartIndex = getStartIndex('column', scrollLeft);
      const columnStopIndex = getStopIndex(
        'column',
        columnStartIndex,
        scrollLeft,
      );

      // const getOverscanCount = (
      //   direction,
      //   startIndex,
      //   stopIndex,
      //   minIndex,
      //   maxIndex,
      //   _overscanCount,
      // ) => {
      //   const overscanBackward =
      //     direction === 'backward' ? Math.max(1, _overscanCount) : 1;
      //   const overscanForward =
      //     direction === 'forward' ? Math.max(1, _overscanCount) : 1;
      //   return {
      //     overscanStartIndex: Math.max(0, minIndex, startIndex - overscanBackward),
      //     overscanStopIndex: Math.max(
      //       0,
      //       Math.min(maxIndex, stopIndex + overscanForward),
      //     ),
      //   };
      // };

      const {
        overscanStartIndex: overscanRowStartIndex,
        overscanStopIndex: overscanRowStopIndex,
      } = getOverscanCount(
        vScrollDirection,
        rowStartIndex,
        rowStopIndex,
        fixedTopCount,
        rowCount - fixedBottomCount - 1,
        overscanCount,
      );

      const {
        overscanStartIndex: overscanColumnStartIndex,
        overscanStopIndex: overscanColumnStopIndex,
      } = getOverscanCount(
        hScrollDirection,
        columnStartIndex,
        columnStopIndex,
        fixedLeftCount,
        columnCount - fixedRightCount - 1,
        overscanCount,
      );

      // getOverscanCount

      // Overscan by one item in each direction so that tab/focus works.
      // If there isn't at least one extra item, tab loops back around.
      // const overscanBackward =
      //   horizontalScrollDirection === 'backward'
      //     ? Math.max(1, overscanCount)
      //     : 1;
      // const overscanForward =
      //   horizontalScrollDirection === 'forward'
      //     ? Math.max(1, overscanCount)
      //     : 1;

      // return [
      //   Math.max(0, startIndex - overscanBackward),
      //   Math.max(0, Math.min(columnCount - 1, stopIndex + overscanForward)),
      //   startIndex,
      //   stopIndex,
      // ];

      return {
        overscanRowStartIndex,
        overscanRowStopIndex,
        overscanColumnStartIndex,
        overscanColumnStopIndex,
        visibleRowStartIndex: rowStartIndex,
        visibleRowStopIndex: rowStopIndex,
        visibleColumnStartIndex: columnStartIndex,
        visibleColumnStopIndex: columnStopIndex,
        rangeToRender: {
          overscanRowStartIndex,
          overscanRowStopIndex,
          overscanColumnStartIndex,
          overscanColumnStopIndex,
          visibleRowStartIndex: rowStartIndex,
          visibleRowStopIndex: rowStopIndex,
          visibleColumnStartIndex: columnStartIndex,
          visibleColumnStopIndex: columnStopIndex,
        },
      };
    },
  ),

  // getRangeToRender = (scrollTop, scrollLeft) => {
  //   // const { scrollTop, scrollLeft } = this.state;
  //   const rowStartIndex = this.getStartIndexForOffset('row', scrollTop);
  //   const rowStopIndex = this.getStopIndexForStartIndex(
  //     'row',
  //     rowStartIndex,
  //     scrollTop,
  //   );
  //   const columnStartIndex = this.getStartIndexForOffset('column', scrollLeft);
  //   const columnStopIndex = this.getStopIndexForStartIndex(
  //     'column',
  //     columnStartIndex,
  //     scrollLeft,
  //   );
  //   return [rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex];
  // };
);

// export default enhance(WindowTable);

const Enhance = enhance(WindowTable);

/* eslint-disable */
class Tmp extends PureComponent {
  render() {
    return <Enhance {...this.props} />;
  }
}

Tmp.propTypes = {
  /**
   * Description of prop "bar" (a custom validation function).
   */

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  /**
   * Description of prop "bar" (a custom validation function).
   */
  columnCount: PropTypes.number.isRequired,
  columnWidth: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
  rowHeight: PropTypes.number.isRequired,
  fixedLeftCount: PropTypes.number,
  fixedRightCount: PropTypes.number,
  fixedTopCount: PropTypes.number,
  fixedBottomCount: PropTypes.number,
};

Tmp.defaultProps = {
  fixedLeftCount: 0,
  fixedRightCount: 0,
  fixedTopCount: 0,
  fixedBottomCount: 0,
};

export default Tmp;
