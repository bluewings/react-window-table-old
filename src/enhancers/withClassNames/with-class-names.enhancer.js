// import React, { createElement } from 'react';
import entries from 'object.entries';
import { compose, withPropsOnChange } from 'recompose';
import { cellStyle, defaultCellClassNames } from '../../styles';

const withClassNames = compose(
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
);

export default withClassNames;
