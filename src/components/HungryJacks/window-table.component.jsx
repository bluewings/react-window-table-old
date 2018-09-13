/* eslint-disable
  react/no-unused-state,
  no-underscore-dangle,
  react/forbid-prop-types,
*/
/* eslint-disable */
import React, { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import { VariableSizeGrid as Grid } from 'react-window';
import { compose, defaultProps, withPropsOnChange } from 'recompose';
import memoizeOne from 'memoize-one';
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

    this.secRef = React.createRef();
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
      // cancelAnimationFrame(this.animFrame);
      // this.animFrame = requestAnimationFrame(() => {
        // Object.keys(this.gridRef)
        //   .filter(key => this.gridRef[key].current)
        //   .forEach(key => this.gridRef[key].current.scrollTo(this.state));
        // if (this.scrollbarRef.x.current) {
        //   this.scrollbarRef.x.current.scrollTo(this.state);
        // }
        // if (this.scrollbarRef.y.current) {
        //   this.scrollbarRef.y.current.scrollTo(this.state);
        // }
        // Object.keys(this.guidelineRef)
        //   .filter(key => this.guidelineRef[key].current)
        //   .forEach(key => this.guidelineRef[key].current.update(this.state));
      // });
    }
  }

  findNearestItem = (itemType, offset) => {
    let high;
    if (itemType === 'column') {
      high = this.props._columns.length - 1;
    } else {
      high = this.props._rows.length - 1;
    }
    return this.findNearestItemBinarySearch(
      itemType,
      // lastMeasuredIndex,
      // this.props._columns.length,
      high,
      0,
      offset
    );
  }


  getRowStartIndexForOffset = (scrollTop) => {

    const itemMetadata = this.getItemMetadata('row', this.props.fixedTopCount);
    // console.log(itemMetadata);

    return this.findNearestItem('row', scrollTop + itemMetadata.offset);
  }

  getRowStopIndexForStartIndex = (startIndex, scrollTop) => {
    return this._getColumnStopIndexForStartIndex('row', startIndex, scrollTop);
  }

  getColumnOffset = (index) => {
    
  }

  getColumnWidth = (index) => {}

  getColumnStartIndexForOffset = (scrollLeft) => {

    

    const itemMetadata = this.getItemMetadata('column', this.props.fixedLeftCount);
    // console.log(itemMetadata);

    return this.findNearestItem('column', scrollLeft + itemMetadata.offset);
  }

  getColumnStopIndexForStartIndex = (startIndex, scrollLeft) => {
    return this._getColumnStopIndexForStartIndex('column', startIndex, scrollLeft);
  }

  _getColumnStopIndexForStartIndex = (itemType, startIndex, offset) => {
    const { itemCount_, contentWidth: width, contentHeight: height } = this.props;
    // let itemType = 'column';
    let itemCount = this.props._columns.length;
    if (itemType === 'row') {
      itemCount = this.props._rows.length;
    }

    // console.log(startIndex);

    const itemMetadata = this.getItemMetadata(itemType, startIndex);

    let maxOffset

    if (itemType === 'row') {
      maxOffset = offset + height;
      if (this.props.fixedBottomCount > 0) {
        const rWidth = this.props._rows.slice(this.props.fixedBottomCount * -1)
          .reduce((prev, {meta}) => {

            return prev + meta.size;
          }, 0)


          maxOffset = maxOffset - rWidth;

      }
    } else {
      maxOffset = offset + width;
      if (this.props.fixedRightCount > 0) {
        const rWidth = this.props._columns.slice(this.props.fixedRightCount * -1)
          .reduce((prev, {meta}) => {

            return prev + meta.size;
          }, 0)


          maxOffset = maxOffset - rWidth;

      }
      
      // for (let i = i)
      // this.props.fixedBottomCount
    }

    

    let currOffset = itemMetadata.offset + itemMetadata.size;
    let stopIndex = startIndex;

    while (stopIndex < itemCount - 1 && currOffset < maxOffset) {
      stopIndex++;
      // currOffset += getItemMetadata('column', props, stopIndex, instanceProps).size;
      currOffset += this.getItemMetadata(itemType, stopIndex).size;
    }

    return stopIndex;
  }


  getItemMetadata = (itemType, index) => {
    if (itemType === 'column') {
      return this.props._columns[index].meta;
    }
    return this.props._rows[index].meta;
    
  }

  // const getItemMetadata = (
  //   itemType: ItemType,
  //   props: Props,
  //   index: number,
  //   instanceProps: InstanceProps
  // ): ItemMetadata => {
  //   let itemMetadataMap, itemSize, lastMeasuredIndex;
  //   if (itemType === 'column') {
  //     itemMetadataMap = instanceProps.columnMetadataMap;
  //     itemSize = ((props.columnWidth: any): itemSizeGetter);
  //     lastMeasuredIndex = instanceProps.lastMeasuredColumnIndex;
  
  findNearestItemBinarySearch = (itemType, high, low, offset)  => {

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
    } else {
      return 0;
    }
  }


  // _getVerticalRangeToRender = () => {
  //   const { columnCount, overscanCount } = this.props;
  //   const { horizontalScrollDirection, scrollLeft } = this.state;

  //   const startIndex = this.getColumnStartIndexForOffset(
  //     // this.props,
  //     scrollLeft,
  //     // this._instanceProps
  //   );
  //   const stopIndex = this.getColumnStopIndexForStartIndex(
  //     // this.props,
  //     startIndex,
  //     scrollLeft,
  //     // this._instanceProps
  //   );

  //   // Overscan by one item in each direction so that tab/focus works.
  //   // If there isn't at least one extra item, tab loops back around.
  //   const overscanBackward =
  //     horizontalScrollDirection === 'backward'
  //       ? Math.max(1, overscanCount)
  //       : 1;
  //   const overscanForward =
  //     horizontalScrollDirection === 'forward'
  //       ? Math.max(1, overscanCount)
  //       : 1;

  //   return [
  //     Math.max(0, startIndex - overscanBackward),
  //     Math.max(0, Math.min(columnCount - 1, stopIndex + overscanForward)),
  //     startIndex,
  //     stopIndex,
  //   ];
  // }
  // getColumnStartIndexForOffset: (
  //   props: Props,
  //   scrollLeft: number,
  //   instanceProps: InstanceProps
  // ): number => findNearestItem('column', props, instanceProps, scrollLeft),

  // componentWillUnmount() {
  //   clearInterval(this.timer);
  // }

  _getItemStyleCache = memoizeOne((_, __) => ({}));

  _getItemStyle = (rowIndex, columnIndex) => {
    const key = `${rowIndex}:${columnIndex}`;

    // const itemStyleCache = this._getItemStyleCache(
    //   shouldResetStyleCacheOnItemSizeChange && this.props.columnWidth,
    //   shouldResetStyleCacheOnItemSizeChange && this.props.rowHeight
    // );

    const itemStyleCache = this._getItemStyleCache(0, 0);
    // let style;
    if (!itemStyleCache.hasOwnProperty(key)) {


      const { offset: left, size: width } = this.getItemMetadata('column', columnIndex);
      const { offset: top, size: height } = this.getItemMetadata('row', rowIndex);
      itemStyleCache[key] = {
        position: 'absolute',
        left,
        top,
        height,
        width,
        background: (rowIndex + columnIndex) % 2 === 0 ? 'rgba(0,0,0,.05)' : 'rgba(0,0,0,.1'
        // left: getColumnOffset(this.props, columnIndex, this._instanceProps),
        // top: getRowOffset(this.props, rowIndex, this._instanceProps),
        // height: getRowHeight(this.props, rowIndex, this._instanceProps),
        // width: getColumnWidth(this.props, columnIndex, this._instanceProps),
      };
    }
    return itemStyleCache[key];

    // return style;
  }

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

  headerStyle = memoizeOne((cellStyles, customStyle) => {
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

  items = memoizeOne((_rowStartIndex, _rowStopIndex, _columnStartIndex, _columnStopIndex,
    fixedTopCount,
    fixedBottomCount,
    fixedLeftCount,
    fixedRightCount
    ) => {

    const items = [];

    const topItems = [];
    const topLeftItems = [];

    const leftItems = [];

    const rightItems = [];

    const bottomItems = [];

    const rowStartIndex = Math.max(_rowStartIndex, fixedTopCount);
    const rowStopIndex = _rowStopIndex;

    const columnStartIndex = Math.max(_columnStartIndex, fixedLeftCount);
    const columnStopIndex = _columnStopIndex;

    let totalWidth = 0;
    for (
      let columnIndex = 0;
      columnIndex < this.props._columns.length;
      columnIndex++
    ) {
      totalWidth += this.props._columns[columnIndex].meta.size;
    }

    let totalHeight = 0;
    for (
      let rowIndex = 0;
      rowIndex < this.props._rows.length;
      rowIndex++
    ) {
      totalHeight += this.props._rows[rowIndex].meta.size;
    }
    for (
      let columnIndex = 0;
      columnIndex <= columnStopIndex;
      columnIndex++
    ) {


      if (columnIndex < columnStartIndex) {
        if (columnIndex < fixedLeftCount) {
        for (
          let rowIndex = 0;
          rowIndex < fixedTopCount;
          rowIndex++
        ) {
          topLeftItems.push(
            <div
              key={rowIndex + ':' + columnIndex}
              style={{
                ...this._getItemStyle(rowIndex, columnIndex),
                // top: 0,
                // background: 'lightyellow',
                // border: '1px solid black',
                // zIndex: 1,
              }}
            >
              {rowIndex + ' , ' + columnIndex}
            </div>
          )
        }
        }

      } else if (columnIndex <= columnStopIndex) {


      for (
        let rowIndex = 0;
        rowIndex < fixedTopCount;
        rowIndex++
      ) {
        topItems.push(
          <div
            key={rowIndex + ':' + columnIndex}
            style={{
              ...this._getItemStyle(rowIndex, columnIndex),
              // top: 0,
              // background: 'lightyellow',
              // border: '1px solid black',
              // zIndex: 1,
            }}
          >
            {rowIndex + ' , ' + columnIndex}
          </div>
        )
      }


      for (
        let rowIndex = this.props._rows.length - fixedBottomCount;
        rowIndex < this.props._rows.length;
        rowIndex++
      ) {
        const styles = { ...this._getItemStyle(rowIndex, columnIndex) };
        delete styles.top;
        styles.bottom = totalHeight - this.props._rows[rowIndex].meta.offset
        - this.props._rows[rowIndex].meta.size;
        bottomItems.push(
          <div
            key={rowIndex + ':' + rowIndex}
            style={styles}
          >
            {rowIndex + ' , ' + rowIndex}
          </div>
        )
      }
      }
    }



    for (
      let rowIndex = rowStartIndex;
      rowIndex <= rowStopIndex;
      rowIndex++
    ) {
      for (
        let columnIndex = 0;
        columnIndex < fixedLeftCount;
        columnIndex++
      ) {
        leftItems.push(
          <div
            key={rowIndex + ':' + columnIndex}
            style={{ ...this._getItemStyle(rowIndex, columnIndex),
              // border: '1px solid black',
              // background: 'lightblue'
            }}
          >
            {rowIndex + ' , ' + columnIndex}
          </div>
        )
      }
      for (
        let columnIndex = this.props._columns.length - fixedRightCount;
        columnIndex < this.props._columns.length;
        columnIndex++
      ) {
        const styles = { ...this._getItemStyle(rowIndex, columnIndex) };
        delete styles.left;
        styles.right = totalWidth - this.props._columns[columnIndex].meta.offset
        - this.props._columns[columnIndex].meta.size;
        rightItems.push(
          <div
            key={rowIndex + ':' + columnIndex}
            style={styles}
          >
            {rowIndex + ' , ' + columnIndex}
          </div>
        )
      }
      for (
        let columnIndex = columnStartIndex;
        columnIndex <= columnStopIndex;
        columnIndex++
      ) {
        items.push(
          <div
            key={rowIndex + ':' + columnIndex}
            style={this._getItemStyle(rowIndex, columnIndex)}
          >
            {rowIndex + ' , ' + columnIndex}


          </div>
          // createElement(this.props.children, {
          //   rowIndex,
          //   columnIndex,
          //   // data: itemData,
          //   // isScrolling: useIsScrolling ? isScrolling : undefined,
          //   // key: itemKey({ columnIndex, rowIndex }),
          //   key: rowIndex + ':' + columnIndex,
          //   // itemKey({ columnIndex, rowIndex }),
          //   style: this._getItemStyle(rowIndex, columnIndex),
          // })
        )

      }
    }
    return {
      topItems,
      topLeftItems,
      leftItems,
      items,
      rightItems,
      bottomItems,
    };
  })

  _getHorizontalRangeToRender = () => {
    const columnStartIndex = this.getColumnStartIndexForOffset(
      this.state.scrollLeft
    );
  
    const columnStopIndex = this.getColumnStopIndexForStartIndex(
      columnStartIndex,
      this.state.scrollLeft,
      
    );
    return [columnStartIndex, columnStopIndex];
  }

  _getVerticalRangeToRender = () => {
    const rowStartIndex = this.getRowStartIndexForOffset(
      this.state.scrollTop
    );
  
    const rowStopIndex = this.getRowStopIndexForStartIndex(
      rowStartIndex,
      this.state.scrollTop,
      
    );
    return [rowStartIndex, rowStopIndex];
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



    const [columnStartIndex, columnStopIndex] = this._getHorizontalRangeToRender();


    const [rowStartIndex, rowStopIndex] = this._getVerticalRangeToRender();

    const items = this.items(rowStartIndex, rowStopIndex, columnStartIndex, columnStopIndex,
      this.props.fixedTopCount,
      this.props.fixedBottomCount,
      this.props.fixedLeftCount,
      this.props.fixedRightCount
      );


    return template.call(this, {
      // variables
      unused_bottom: bottom,
      unused_center: center,
      columnStartIndex,
      columnStopIndex,
      containerStyle,
      contentHeight,
      contentWidth,
      unused_guidelineStyle: guidelineStyle,
      items,
      unused_left: left,
      overallHeight,
      overallWidth,
      unused_right: right,
      rowStartIndex,
      rowStopIndex,
      scrollbarHandleStyle,
      scrollbarTrackStyle,
      scrollbarWidth,
      scrollbarX,
      scrollbarY,
      unused_top: top,
      unused_Guideline: Guideline,
      // components
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

  withPropsOnChange(['columns'], ({ columns, columnWidth }) => {
    let offset = 0;
    const _columns = (columns || [])
    .filter(column => column && (typeof column === 'string' || typeof column === 'object'))
    .map(column => (typeof column === 'string' ? { name: column } : { ...column }))
    .filter(column => column.name)
    .map((data, i) => {
      let meta = {
        offset,
        size: columnWidth,
      }
      offset += columnWidth;
      return {
        i,
        meta,
        data,
      }
    })
    return {
      _columns
    };
  }),

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
      // width = isNaN(width) ? 120 : width;
      width = isNaN(width) ? 80 : width;
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

  withPropsOnChange(['rows'], ({ rows }) => {
    let offset = 0;
    const _rows = (rows || [])
    // .filter(row => row && (typeof row === 'string' || typeof row === 'object'))
    // .map(row => (typeof row === 'string' ? { name: row } : { ...row }))
    // .filter(row => row.name)
    .map((data, i) => {
      let size = data._height;
      let meta = {
        offset,
        size,
      }
      offset += size;
      return {
        i,
        meta,
        data,
      }
    })
    return {
      _rows
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
