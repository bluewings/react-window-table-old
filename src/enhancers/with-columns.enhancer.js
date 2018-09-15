import { compose, withPropsOnChange } from 'recompose';

const withColumns = compose(
  withPropsOnChange(['columns'], ({ columns }) => ({
    columns: (columns || [])
      .filter(column =>
        column && (typeof column === 'string' || typeof column === 'object'))
      .map(column =>
        (typeof column === 'string' ? { name: column } : { ...column }))
      .filter(column => column.name),
  })),
  withPropsOnChange(['columns'], ({ columns }) => {
    console.log('>>>', columns);
    return {
      message: 'hello',
      columnCount: columns.length,
    };
  }),
);

export default withColumns;
