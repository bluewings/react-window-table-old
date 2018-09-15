/* eslint-disable */
import React, { createElement } from 'react';
import { compose, withPropsOnChange } from 'recompose';

const withColumns = compose(
  withPropsOnChange(
    ['columns', 'columnWidth'],
    ({ columns: _columns, columnWidth: _columnWidth, children: _children }) => {
      const columns = (_columns || [])
        .filter(column =>
          column &&
            (typeof column === 'string' || typeof column === 'object'))
        .map(column =>
          (typeof column === 'string' ? { name: column } : { ...column }))
        .filter(column => column.name);
      console.log('>>>', columns);

      const children = (props) => {
        if (props.rowIndex === 0) {
          const name = columns[props.columnIndex].name;
          return <div style={props.style}>{name}</div>;
        }
        return createElement(_children, props);
      };

      return {
        children,
        columns,
        columnCount: columns.length,
        columnWidth: (columnIndex) => {
          const column = columns[columnIndex];
          return typeof _columnWidth === 'function'
            ? _columnWidth(columnIndex, column)
            : column.width || _columnWidth;
          // if (typeof _columnWidth === 'function') {
          //   return _columnWidth(columnIndex, column);
          // }
          // return column.width || _columnWidth;
        },
      };
    },
  ),
  withPropsOnChange(['columns'], ({ columns }) => ({ columns })),
);

export default withColumns;
