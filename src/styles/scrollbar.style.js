/* eslint-disable no-unused-vars */
import { Map } from 'immutable';
import { css } from 'emotion';

const defaultScrollbarClassNames = Map({
  // row
  // oddRow: 'rwtc-odd-row',
  // evenRow: 'rwtc-even-row',
  // // column
  // oddColumn: 'rwtc-odd-col',
  // evenColumn: 'rwtc-even-col',
  // // area
  // top: 'rwtc-top',
  // middle: 'rwtc-middle',
  // bottom: 'rwtc-bottom',
  // left: 'rwtc-left',
  // center: 'rwtc-center',
  // right: 'rwtc-right',
  // // location within the area
  // horizontalFirst: 'rwtc-h-first',
  // horizontalLast: 'rwtc-h-last',
  // verticalFirst: 'rwtc-v-first',
  // verticalLast: 'rwtc-v-last',
  dragging: 'rwts-dragging',
  dragend: 'rwts-dragend',
});

const baseTrackStyle = ({
  classNames,
  axis, handleLength, trackWidth,
  width, height,
}) => {
  const styles = {
    position: 'relative',
    width,
    height,
    // background: 'rgba(0, 0, 0, .1)',
    // background: '#f9f9f9',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };
  if (axis === 'x') {
    styles.borderTop = '1px solid #e5e5e5';
    styles.borderTop = '1px solid #cacaca';
  } else {
    styles.borderLeft = '1px solid #cacaca';
  }

  return styles;
};

const baseHandleStyle = ({
  classNames,
  axis, handleLength, trackWidth,
  width, height,
}) => {
  const baseStyle = {
    // ...base,
    background: 'transparent',
    // background: 'red',

    '> div': {
      position: 'absolute',
      display: 'block',
      top: 3,
      left: 3,
      right: axis === 'y' ? 4 : 3,
      // bottom: 4,
      bottom: axis === 'x' ? 4 : 3,
      pointerEvent: 'none',
      // margin: 3,
      // borderRadius: `${(height - 6) / 2}px`,
      // background: 'red',
      transition: 'background 0.2s',
      // background: 'rgba(204,204,204,0.4)',
      // background: 'rgba(204,204,204,0.4)',
      // background: 'rgba(0,0,0,0.25)',
      // background: '#c2c2c2',
      background: '#c0c0c0',

      '&:hover': {
        background: '#7b7b7b',
        // boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
      },
    },
    [`&.${classNames.dragging} > div`]: {
      // background: 'blue',
      // background: 'rgba(204,204,204,0.8)',
      // background: 'rgba(0,0,0,0.5)',
      background: '#7b7b7b',
      // boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
    },
  };
  return baseStyle;
};

const scrollbarTrackStyle = ({
  classNames, axis, trackLength, trackWidth, customStyleFn,
}) => {
  const width = axis === 'x' ? trackLength : trackWidth;
  const height = axis === 'x' ? trackWidth : trackLength;
  let styles = baseTrackStyle({
    classNames,
    axis,
    trackLength,
    trackWidth,
    width,
    height,
  });
  if (typeof customStyleFn === 'function') {
    styles = customStyleFn(styles, { axis, trackLength, trackWidth });
  }
  return css({
    ...styles,
    position: 'relative',
    width,
    height,
  });
};

const scrollbarHandleStyle = ({
  classNames, axis, handleLength, trackWidth, customStyleFn,
}) => {
  const width = axis === 'x' ? handleLength : trackWidth;
  const height = axis === 'x' ? trackWidth : handleLength;
  let styles = baseHandleStyle({
    classNames,
    axis,
    handleLength,
    trackWidth,
    width,
    height,
  });
  // const width = axis === 'x' ? handleLength : trackWidth;
  // const height = axis === 'x' ? trackWidth : handleLength;
  // let styles = {
  //   width,
  //   height,
  //   background: 'green',
  // };
  if (typeof customStyleFn === 'function') {
    styles = customStyleFn(styles, { axis, handleLength, trackWidth });
  }
  return css({
    ...styles,
    width,
    height,
  });
};


// const cellStyle = (classNames, customStyleFnFn) => {
//   let styleObj = {
//     boxSizing: 'border-box',
//     overflow: 'hidden',

//     display: 'flex',
//     // justifyContent: 'center',
//     padding: '0 8px',
//     alignItems: 'center',

//     borderBottom: '1px solid #cacaca',
//     // borderRight: '1px solid #cacaca',
//     // '&.cell-text-align-center': {
//     //   justifyContent: 'center',
//     // },
//     // '&.cell-right': {
//     //   borderLeft: '1px solid #cacaca',
//     //   borderRight: 'none',
//     // },
//     // '&.cell-bottom': {
//     [`&.${classNames.bottom}`]: {
//       borderTop: '1px solid #cacaca',
//       borderBottom: 'none',
//     },

//     // '&.cell-center': {
//     //   '&.cell-h-last': {
//     //     borderRight: 'none',
//     //   },

//     // },
//     [`&.${classNames.middle}`]: {
//       // '&.cell-v-last'
//       [`&.${classNames.verticalLast}`]: {
//         borderBottom: 'none',
//       },

//     },
//     [`&.${classNames.evenRow}`]: {

//       // background: 'lightyellow',
//       // background: '#f0f0f0',
//     },
//   };
//   if (typeof customStyleFnFn === 'function') {
//     styleObj = customStyleFnFn(styleObj, { classNames });
//   }

//   return css({ ...styleObj });
// };

// export default cellStyle;

export {
  defaultScrollbarClassNames,
  scrollbarTrackStyle,
  scrollbarHandleStyle,
};
