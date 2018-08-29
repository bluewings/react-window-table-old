import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
/* eslint-disable */
import { VariableSizeGrid as Grid } from 'react-window';
import { Map } from 'immutable';
import { compose,
  withState,
  withHandlers,
  defaultProps, withPropsOnChange } from 'recompose';
// import ScrollBar from '../ScrollBar';

// const columns = [...Array(100)].map((e, i) => {
//   return { name: 'col-' + i, width: 60 }
// })

// const data = [...Array(100)].map((e, i) => {
//   return columns.reduce((prev, f, j) => {
//     return {
//       ...prev,
//       [f.name]: i + ',' + j
//     }
//   }, {})
// })

// // console.log(data);

// const data =

class WindowTable extends PureComponent {
  constructor(props) {
    super(props);
    // this.gridRef = React.createRef();
    this.gridRef = {
      top: React.createRef(),
      right: React.createRef(),
      bottom: React.createRef(),
      left: React.createRef(),
      center: React.createRef(),
    };
    this.scrollbarRef = {
      x: React.createRef(),
      y: React.createRef(),
    };
  }

  columnWidth = index => this.props.columns[index].width || 80

  rowHeight = index => 40
  // handleScroll = (event) => {
  //   // // console.log(event);
  //   const { scrollLeft, scrollTop } = event;
  //   if (this.gridRef.current) {
  //     // // console.log(this.gridRef.current);
  //     // requestAnimationFrame(() => {
  //     this.gridRef.current.scrollTo({
  //       scrollLeft, scrollTop
  //     })
  //     // })

  //   }
  // }
  handleScroll = (event, type) => {
    if (event.scrollUpdateWasRequested !== false) {
      return;
    }

    const { scrollTop, scrollLeft } = event;

    Object.keys(this.gridRef)
      .filter(key => key !== type && this.gridRef[key].current)
      .forEach((key) => {
        this.gridRef[key].current.scrollTo({ scrollTop, scrollLeft });
      });


    // if (type !== 'left' && this.gridRef.left.current) {
    //   this.gridRef.left.current.scrollTo({
    //     scrollLeft: 0,
    //     scrollTop: event.scrollTop,
    //   });
    // }
    // type !== 'right' && this.gridRef.right.current && this.gridRef.right.current.scrollTo({
    //   scrollLeft: 0,
    //   scrollTop: event.scrollTop,
    // });
    // type !== 'top' && this.gridRef.top.current && this.gridRef.top.current.scrollTo({
    //   scrollLeft: event.scrollLeft,
    //   scrollTop: 0,
    // });
    // type !== 'bottom' && this.gridRef.bottom.current && this.gridRef.bottom.current.scrollTo({
    //   scrollLeft: event.scrollLeft,
    //   scrollTop: 0,
    // });
    // type !== 'center' && this.gridRef.center.current && this.gridRef.center.current.scrollTo({
    //   scrollLeft: event.scrollLeft,
    //   scrollTop: event.scrollTop,
    // });

    this.scrollbarRef.x.current && this.scrollbarRef.x.current.scrollTo({
      scrollLeft: event.scrollLeft,
      scrollTop: event.scrollTop,
    });

    this.scrollbarRef.y.current && this.scrollbarRef.y.current.scrollTo({
      scrollLeft: event.scrollLeft,
      scrollTop: event.scrollTop,
    });
  }
  _renderGrid = ({
    type, width, height, columnOffset, columnCount,
    rowOffset, rowCount,
  }) => {
    let gridProps = {};
    // if (type === 'center' || type === 'right') {
    if (type) { // // console.log(type);
      gridProps = {
        ...gridProps,
        ref: this.gridRef[type],
        onScroll: (event) => {
          // // console.log(event);
          this.handleScroll(event, type);
        },
      };
    }
    return (
      <Grid

        columnCount={columnCount}
        // columnWidth={100}
        height={height || 300}
        rowCount={rowCount || 100}
        // rowHeight={35}
        width={width || 300}
        // scrollTop={100}
        columnWidth={this.columnWidth}
        rowHeight={this.rowHeight}
        // overscanCount={5}

        {...gridProps}
        // onScroll={this.handleScroll}
      >
        {({ columnIndex, rowIndex, style }) => (
          <div style={style}>
            {/* row {rowIndex}, column {columnIndex} */}
            {rowOffset + rowIndex}, {columnOffset + columnIndex}
            {/* {소ㅑㄴ. */}
          </div>
        )}
      </Grid>
    );
  }

  gridWidth = (from, limit) => this.props.columns.slice(from, from + limit).reduce((prev, e) => prev + e.width, 0)

  gridHeight = (from, limit) =>

    new Array(limit)
      .fill(true).reduce((prev, i) => prev + this.rowHeight(from + i), 0)
  // return
  // return this.props.columns.slice(from, from + limit).reduce((prev, e) => {
  //   return prev + e.width;
  // }, 0 )


  render() {
    console.log('render');
    // console.log(this.props);

    const fullWidth = this.gridWidth(0, this.props.columns.length);
    const fullHeight = this.gridHeight(0, (this.props.data || []).length);
    return (
      <div>
        <pre>{JSON.stringify(this.props.scrollPos)}</pre>
        <table border={1}>
          <tbody>
            {this.props._top && (
            <tr>
              {this.props._left && (
              <td>{this._renderGrid({
                // columnWidth: this
                width: this.gridWidth(0, this.props.fixedLeftCount),
                height: this.gridHeight(0, this.props.fixedTopCount),
                rowOffset: this.props.__top.rowOffset,
                rowCount: this.props.__top.rowCount,
                columnOffset: this.props.__left.columnOffset,
                columnCount: this.props.__left.columnCount,
              })}
              </td>
            )}
              {/* <td>top</td> */}


              <td>{this._renderGrid({
                // columnWidth: this
                type: 'top',
                width: this.props.width -
                this.gridWidth(0, this.props.fixedLeftCount) -
                this.gridWidth(this.props.columns.length - this.props.fixedRightCount, this.props.fixedRightCount),
                height: this.gridHeight(0, this.props.fixedTopCount),
                rowOffset: this.props.__top.rowOffset,
                rowCount: this.props.__top.rowCount,
                columnOffset: this.props.__center.columnOffset,
                columnCount: this.props.__center.columnCount,
              })}
              </td>

              {this.props._right && (
              <td>{this._renderGrid({
                // columnWidth: this
                width: this.gridWidth(this.props.columns.length - this.props.fixedRightCount, this.props.fixedRightCount),
                height: this.gridHeight(0, this.props.fixedTopCount),
                rowOffset: this.props.__top.rowOffset,
                rowCount: this.props.__top.rowCount,
                columnOffset: this.props.__right.columnOffset,
                columnCount: this.props.__right.columnCount,
              })}
              </td>
            )}
              <td rowSpan={3} vAlign="top">
                {/* <ScrollBar
                  type="y"
                  ref={this.scrollbarRef.y}
                  width={this.props.width}
                  height={this.props.height}
                  fullWidth={fullWidth}
                  fullHeight={fullHeight}
                /> */}
              </td>
            </tr>
          )}
            <tr>
              {this.props._left && (
              <td>{this._renderGrid({
                // columnWidth: this
                type: 'left',
                width: this.gridWidth(0, this.props.fixedLeftCount),
                height: this.props.height -
                this.gridHeight(0, this.props.fixedTopCount) -
                this.gridHeight(this.props.data.length - this.props.fixedBottomCount, this.props.fixedBottomCount),

                rowOffset: this.props.__center.rowOffset,
                rowCount: this.props.__center.rowCount,
                columnOffset: this.props.__left.columnOffset,
                columnCount: this.props.__left.columnCount,
              })}
              </td>
            )}
              <td>{this._renderGrid({
              type: 'center',
              width: this.props.width -
                this.gridWidth(0, this.props.fixedLeftCount) -
                this.gridWidth(this.props.columns.length - this.props.fixedRightCount, this.props.fixedRightCount),
              height: this.props.height -
                this.gridHeight(0, this.props.fixedTopCount) -
                this.gridHeight(this.props.data.length - this.props.fixedBottomCount, this.props.fixedBottomCount),
              rowOffset: this.props.__center.rowOffset,
              rowCount: this.props.__center.rowCount,
              columnOffset: this.props.__center.columnOffset,
              columnCount: this.props.__center.columnCount,
            })}
              </td>
              {this.props._right && (
              <td>{this._renderGrid({
                // columnWidth: this
                type: 'right',
                width: this.gridWidth(this.props.columns.length - this.props.fixedRightCount, this.props.fixedRightCount),
                height: this.props.height -
                this.gridHeight(0, this.props.fixedTopCount) -
                this.gridHeight(this.props.data.length - this.props.fixedBottomCount, this.props.fixedBottomCount),

                rowOffset: this.props.__center.rowOffset,
                rowCount: this.props.__center.rowCount,
                columnOffset: this.props.__right.columnOffset,
                columnCount: this.props.__right.columnCount,
              })}
              </td>
            )}
            </tr>
            {this.props._bottom && (
            <tr>
              {this.props._left && (
              <td>{this._renderGrid({
                width: this.gridWidth(0, this.props.fixedLeftCount),
                height: this.gridHeight(this.props.data.length - this.props.fixedBottomCount, this.props.fixedBottomCount),
                rowOffset: this.props.__bottom.rowOffset,
                rowCount: this.props.__bottom.rowCount,
                columnOffset: this.props.__left.columnOffset,
                columnCount: this.props.__left.columnCount,
              })}
              </td>
            )}
              <td>{this._renderGrid({
              type: 'bottom',
              width: this.props.width -
              this.gridWidth(0, this.props.fixedLeftCount) -
              this.gridWidth(this.props.columns.length - this.props.fixedRightCount, this.props.fixedRightCount),
              height: this.gridHeight(this.props.data.length - this.props.fixedBottomCount, this.props.fixedBottomCount),
              // rowOffset: this.props.data.length - this.props.fixedBottomCount,
              // rowCount: this.props.fixedBottomCount,
              rowOffset: this.props.__bottom.rowOffset,
              rowCount: this.props.__bottom.rowCount,
              columnOffset: this.props.__center.columnOffset,
              columnCount: this.props.__center.columnCount,
            })}
              </td>
              {this.props._right && (
              <td>{this._renderGrid({
                width: this.gridWidth(this.props.columns.length - this.props.fixedRightCount, this.props.fixedRightCount),
                height: this.gridHeight(this.props.data.length - this.props.fixedBottomCount, this.props.fixedBottomCount),
                rowOffset: this.props.__bottom.rowOffset,
                rowCount: this.props.__bottom.rowCount,
                columnOffset: this.props.__right.columnOffset,
                columnCount: this.props.__right.columnCount,
              })}
              </td>
            )}
            </tr>
          )}
            <tr>
              <td colSpan={3}>
                {/* <ScrollBar
                  ref={this.scrollbarRef.x}
                  type="x"
                  width={this.props.width}
                  height={this.props.height}
                  fullWidth={fullWidth}
                  fullHeight={fullHeight}
                /> */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      // <table>
      //   <tbody>
      //     <tr>
      //       <td>
      //       <Grid
      //   columnCount={1000}
      //   // columnWidth={100}
      //   height={300}
      //   rowCount={100}
      //   // rowHeight={35}
      //   width={300}
      //   // scrollTop={100}
      //   columnWidth={this.columnWidth}
      //   rowHeight={this.rowHeight}
      //   // overscanCount={5}

    //   onScroll={this.handleScroll}
    // >
    //   {({ columnIndex, rowIndex, style }) => (
    //     <div style={style}>
    //       {/* row {rowIndex}, column {columnIndex} */}
    //       {rowIndex}, {columnIndex}
    //     </div>
    //   )}
    // </Grid>
    //       </td>

    //       <td>

    // <Grid
    //   ref={this.gridRef}
    //   columnCount={1000}
    //   // columnWidth={100}
    //   height={300}
    //   rowCount={100}
    //   // rowHeight={35}
    //   columnWidth={this.columnWidth}
    //   rowHeight={this.rowHeight}
    //   // overscanCount={1}
    //   width={300}
    // >
    //   {({ columnIndex, rowIndex, style }) => (
    //     <div style={style}>
    //       {rowIndex}, {columnIndex}
    //     </div>
    //   )}
    // </Grid>
    //       </td>
    //     </tr>
    //   </tbody>

    // </table>
    );
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
    columns: [],
    // data: [],
  }),
  withState('scrollPos', '_updateScrollPos', Map({
    left: 0,
    top: 0,
  })),
  withHandlers({
    scrollTo: ({ scrollPos, _updateScrollPos }) => (top, left) => {
      const next = scrollPos
        .set('top', top)
        .set('left', left);

      if (next !== scrollPos) {
        _updateScrollPos(next);
      }

      // props.updateValue(event.target.value)
    },
  }),
  // withState('_sTop', 'update_sTop', 0),
  // withHandlers({})
  withPropsOnChange(['columns', 'data'], ({
    columns, data,
  }) => ({
    _columnCount: (columns || []).length,
    _rowCount: (data || []).length,
  })),
  withPropsOnChange(['fixedTopCount', 'fixedLeftCount', 'fixedRightCount', 'fixedBottomCount', '_columnCount', '_rowCount'], ({
    fixedTopCount, fixedLeftCount, fixedRightCount, fixedBottomCount,
    _columnCount, _rowCount,
  }) => ({
    __top: {
      // height: this.gridHeight(0, this.props.fixedTopCount),
      rowOffset: 0,
      rowCount: fixedTopCount,
    },
    __bottom: {
      // height: this.gridHeight(0, this.props.fixedTopCount),
      // rowOffset: 0,
      // rowCount: fixedTopCount,
      rowOffset: _rowCount - fixedBottomCount,
      rowCount: fixedBottomCount,
    },
    __left: {
      columnOffset: 0,
      columnCount: fixedLeftCount,
    },
    __right: {
      columnOffset: _columnCount - fixedRightCount,
      columnCount: fixedRightCount,
    },
    __center: {
      rowOffset: fixedTopCount,
      rowCount: _rowCount - fixedTopCount - fixedBottomCount,
      columnOffset: fixedLeftCount,
      columnCount: _columnCount - fixedLeftCount - fixedRightCount,
    },
    _topLeft: fixedTopCount > 0 && fixedLeftCount > 0,
    _top: fixedTopCount > 0,
    // _top: fixedTopCount > 0,
    _topRight: fixedTopCount > 0 && fixedRightCount > 0,
    _left: fixedLeftCount > 0,
    _right: fixedRightCount > 0,
    _bottomLeft: fixedBottomCount > 0 && fixedLeftCount > 0,
    _bottom: fixedBottomCount > 0,
    _bottomRight: fixedBottomCount > 0 && fixedRightCount > 0,
  })),
);

// const Enhance = enhance(WindowTable);

// Enhance.propTypes = {
//   name: PropTypes.string,
// }

// Enhance.defaultProps = {
//   name: 'aaa',
// }

export default enhance(WindowTable);
