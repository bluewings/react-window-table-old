import { Map } from 'immutable';
import { css } from 'emotion';

const defaultCellClassNames = Map({
  // row
  oddRow: 'rwtc-odd-row',
  evenRow: 'rwtc-even-row',
  // column
  oddColumn: 'rwtc-odd-col',
  evenColumn: 'rwtc-even-col',
  // area
  top: 'rwtc-top',
  middle: 'rwtc-middle',
  bottom: 'rwtc-bottom',
  left: 'rwtc-left',
  center: 'rwtc-center',
  right: 'rwtc-right',
  // location within the area
  horizontalFirst: 'rwtc-h-first',
  horizontalLast: 'rwtc-h-last',
  verticalFirst: 'rwtc-v-first',
  verticalLast: 'rwtc-v-last',
});

const cellStyle = ({ classNames, customStyleFn }) => {
  let styleObj = {
    boxSizing: 'border-box',
    overflow: 'hidden',

    display: 'flex',
    // justifyContent: 'center',
    padding: '0 8px',
    alignItems: 'center',

    borderBottom: '1px solid #cacaca',
    // borderRight: '1px solid #cacaca',
    // '&.cell-text-align-center': {
    //   justifyContent: 'center',
    // },
    // '&.cell-right': {
    //   borderLeft: '1px solid #cacaca',
    //   borderRight: 'none',
    // },
    // '&.cell-bottom': {
    [`&.${classNames.bottom}`]: {
      borderTop: '1px solid #cacaca',
      borderBottom: 'none',
    },

    // '&.cell-center': {
    //   '&.cell-h-last': {
    //     borderRight: 'none',
    //   },

    // },
    [`&.${classNames.middle}`]: {
      // '&.cell-v-last'
      [`&.${classNames.verticalLast}`]: {
        borderBottom: 'none',
      },
    },
    [`&.${classNames.evenRow}`]: {
      // background: 'lightyellow',
      // background: '#f0f0f0',
    },
  };
  if (typeof customStyleFn === 'function') {
    styleObj = customStyleFn(styleObj, { classNames });
  }

  return css({ ...styleObj });
};

export { cellStyle, defaultCellClassNames };
