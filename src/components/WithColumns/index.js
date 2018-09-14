/* eslint-disable react/jsx-filename-extension */
/* eslint-disable */
import React, { PureComponent } from 'react';
import { withPropsOnChange } from 'recompose';
import WindowTable from '../HungryJacks';

const enhance = [
  withPropsOnChange(['children'], ({ children }) => {
    return null;
    if (typeof children === 'function') {
      return {
        children: props => {
          let nextProps = { ...props };
          nextProps.style = { ...nextProps.style, background: '#fff' };
          return React.createElement(children, nextProps);
        },
      };
    }
  }),

  withPropsOnChange(['columns'], ({ columns }) => ({
    columns: (columns || [])
      .filter(
        column =>
          column && (typeof column === 'string' || typeof column === 'object'),
      )
      .map(
        column =>
          typeof column === 'string' ? { name: column } : { ...column },
      )
      .filter(column => column.name),
  })),
];

class WithColumns extends PureComponent {
  render() {
    return <WindowTable {...this.props} enhancer={enhance} />;
  }
}

export default WithColumns;
