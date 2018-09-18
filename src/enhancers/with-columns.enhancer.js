/* eslint-disable */
import React, { createElement } from 'react';
import { compose, withPropsOnChange } from 'recompose';

const withColumns = compose(
  withPropsOnChange(
    ['columns', 'columnWidth'],
    ({ columns: _columns, columnWidth: _columnWidth, children: _children }) => {
      const columns = (_columns || [])
        .filter(
          column =>
            column &&
            (typeof column === 'string' || typeof column === 'object'),
        )
        .map(
          column =>
            typeof column === 'string' ? { name: column } : { ...column },
        )
        .filter(column => column.name);
      console.log('>>>', columns);

      const children = props => {
        if (props.rowIndex === 0) {
          const name = columns[props.columnIndex].name;
          return <div style={props.style}>{name}</div>;
        }
        return createElement(_children, props);
      };

      return {
        // children,
        columns,
        columnCount: columns.length,
        columnWidth: columnIndex => {
          const column = columns[columnIndex];
          return typeof _columnWidth === 'function'
            ? _columnWidth(columnIndex, column)
            : column.width || _columnWidth;
        },
      };
    },
  ),

  withPropsOnChange(
    ['columns', 'rows', 'rowHeight'],
    ({ columns, rows, rowHeight: _rowHeight }) => {
      if (!Array.isArray(rows)) {
        return;
      }

      console.log('> rows', rows);

      // let getRowHeight;

      // if (typeof _rowHeight === 'function') {
      //   getRowHeight = index => _rowHeight(index - 1);
      // } else if (typeof _rowHeight === 'number') {
      //   getRowHeight = () => _rowHeight;
      // } else {
      //   getRowHeight = () => 50;
      // }

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
        // _height: getRowHeight(i, e),
      }));

      // const te = new Date();
      // console.info('data count', rows.length * columns.length, 'elapsed', te - ts);

      const rowCount = (rows || []).length;

      // const columnCount = (columns || []).length;

      // const columnWidthFn = index => {
      //   let { width } = columns[index];
      //   width = isNaN(width) ? 120 : width;
      //   return width;
      // };

      // const rowHeightFn = index => rows[index]._height;

      // const overallWidth = (columns || []).reduce(
      //   (prev, column, index) => prev + columnWidthFn(index, column),
      //   0,
      // );

      // const overallHeight = (rows || []).reduce(
      //   (prev, row, index) => prev + rowHeightFn(index, row),
      //   0,
      // );

      // const columnWidth = (from, limit = 1) => {
      //   limit = limit > 0 ? limit : 0;

      //   return new Array(limit)
      //     .fill(true)
      //     .map((e, i) => from + i)
      //     .reduce((prev, i) => prev + columnWidthFn(i), 0);
      // };

      // const rowHeight = (from, limit = 1) => {
      //   limit = limit > 0 ? limit : 0;

      //   return new Array(limit)
      //     .fill(true)
      //     .map((e, i) => from + i)
      //     .reduce((prev, i) => prev + rowHeightFn(i), 0);
      // };

      console.log(rows);

      return {
        rows,
        rowCount,

        rowCount: rows.length,
        rowHeight: rowIndex => {
          const row = rows[rowIndex];
          return typeof _rowHeight === 'function'
            ? _rowHeight(rowIndex, row)
            : row.width || _rowHeight;
        },
        // columnCount,
        // columnWidth,
        // rowHeight,
        // overallWidth,
        // overallHeight,
      };
    },
  ),

  withPropsOnChange(
    ['columns', 'rows', 'children'],
    ({ columns, rows, children: _children }) => {
      const children = props => {
        const { rowIndex, columnIndex } = props;
        // if (rowIndex === 0) {
        // const name = columns[props.columnIndex].name;
        let content = rows[rowIndex].arr[columnIndex];
        if (typeof columns[columnIndex].render === 'function') {
          content = columns[columnIndex].render(content);
        } else {
          content = rows[rowIndex].arr[columnIndex];
        }
        return (
          <div style={props.style} key={props.key}>
            {content}
          </div>
        );

        // }
        // return createElement(_children, props);
      };
      return {
        children,
      };
    },
  ),
);

export default withColumns;
