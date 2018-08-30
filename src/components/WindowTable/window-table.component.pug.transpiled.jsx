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
    scrollbar,
    scrollbarX,
    scrollbarY,
    top,
    Scrollbar,
  } = params;
  return (
    <div>
      <table border={0} cellPadding={0} cellSpacing={0} className={styles.table}>
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
            <td className={styles.bg_50}>
              {this.renderGrid({ ...top, ...right })}
            </td>
            )}
            {(scrollbarY) && (
            <td rowSpan={rowSpan}>
              <Scrollbar axis="y" {...scrollbar.y} ref={this.scrollbarRef.y} />
            </td>
            )}
          </tr>
          )}
          <tr>
            {(left) && (
            <td className={styles.bg_100}>
              {this.renderGrid({ section: 'left', ...center, ...left })}
            </td>
            )}
            <td className={styles.bg_50}>
              {this.renderGrid({ section: 'center', ...center })}
            </td>
            {(right) && (
            <td className={styles.bg_100}>
              {this.renderGrid({ section: 'right', ...center, ...right })}
            </td>
            )}
            {(scrollbarY && !top) && (
            <td rowSpan={rowSpan}>
              <Scrollbar axis="y" {...scrollbar.y} ref={this.scrollbarRef.y} />
            </td>
            )}
          </tr>
          {(bottom) && (
          <tr>
            {(left) && (
            <td className={styles.bg_50}>
              {this.renderGrid({ ...bottom, ...left })}
            </td>
            )}
            <td className={styles.bg_100}>
              {this.renderGrid({ section: 'bottom', ...center, ...bottom })}
            </td>
            {(right) && (
            <td className={styles.bg_50}>
              {this.renderGrid({ ...bottom, ...right })}
            </td>
            )}
          </tr>
          )}
          <tr>
            {(scrollbarX) && (
            <td colSpan={colSpan}>
              <Scrollbar axis="x" {...scrollbar.x} ref={this.scrollbarRef.x} />
            </td>
            )}
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

//  /* USAGE EXAMPLE */
//  // Components
//  import Scrollbar from '__modulePath__/Scrollbar';
//
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
//        scrollbar,
//        scrollbarX,
//        scrollbarY,
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
//        scrollbar,
//        scrollbarX,
//        scrollbarY,
//        top,
//        // components
//        Scrollbar,
//      });
//    }
//
//  }
//  /* // USAGE EXAMPLE */
