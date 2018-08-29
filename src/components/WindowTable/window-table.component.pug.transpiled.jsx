import React from 'react';
import styles from '/Users/naver/misc/react-widget-table-2/src/components/WindowTable/window-table.component.scss';

export default function (params = {}) {
  const {
    bottom,
    center,
    colSpan,
    left,
    right,
    rowSpan,
    tableHeight,
    tableWidth,
    top,
  } = params;
  return (
    <div>
      <pre>{rowSpan + ' x ' + colSpan}</pre>
      <pre>{tableWidth + ' x ' + tableHeight}</pre>
      <pre>{this.props.width + ' x ' + this.props.height}</pre>
      <table border={1} className={styles.table}>
        <tbody>
          {(top) && (
          <tr>
            {(left) && (
            <td className={styles.bg_50}>
              {this.renderGrid({ ...top, ...left })}
            </td>
            )}
            <td className={styles.bg_100}>
              {this.renderGrid({ section: 'top', ...center, ...top })}
            </td>
            {(right) && (
            <td className={styles.bg_200}>
              {this.renderGrid({ ...top, ...right })}
            </td>
            )}
            <td rowSpan={rowSpan}>y</td>
          </tr>
          )}
          <tr>
            {(left) && (
            <td className={styles.bg_100}>
              {this.renderGrid({ section: 'left', ...center, ...left })}
            </td>
            )}
            <td className={styles.bg_200}>
              {this.renderGrid({ section: 'center', ...center })}
            </td>
            {(right) && (
            <td className={styles.bg_300}>
              {this.renderGrid({ section: 'right', ...center, ...right })}
            </td>
            )}
            {(!top) && (
            <td rowSpan={rowSpan}>y</td>
            )}
          </tr>
          {(bottom) && (
          <tr>
            {(left) && (
            <td className={styles.bg_200}>
              {this.renderGrid({ ...bottom, ...left })}
            </td>
            )}
            <td className={styles.bg_300}>
              {this.renderGrid({ section: 'bottom', ...center, ...bottom })}
            </td>
            {(right) && (
            <td className={styles.bg_400}>
              {this.renderGrid({ ...bottom, ...right })}
            </td>
            )}
          </tr>
          )}
          <tr>
            <td colSpan={colSpan}>x</td>
            <td>.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

//  /* USAGE EXAMPLE */
//  // jsx
//  import template from './window-table.component.pug';
//
//  class Report extends React.Component {
//
//    render() {
//      const {
//        bottom,
//        center,
//        colSpan,
//        left,
//        right,
//        rowSpan,
//        tableHeight,
//        tableWidth,
//        top,
//      } = this;
//
//      return template.call(this, {
//        // variables
//        bottom,
//        center,
//        colSpan,
//        left,
//        right,
//        rowSpan,
//        tableHeight,
//        tableWidth,
//        top
//      });
//    }
//
//  }
//  /* // USAGE EXAMPLE */
