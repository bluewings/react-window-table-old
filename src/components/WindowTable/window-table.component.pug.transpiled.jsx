import React from 'react';
import styles from '/Users/naver/misc/react-widget-table-2/src/components/WindowTable/window-table.component.scss';

export default function (params = {}) {
  const {
    bottom,
    center,
    colSpan,
    left,
    overallHeight,
    overallWidth,
    right,
    rowSpan,
    scrollbarProps,
    top,
    Scrollbar,
  } = params;
  return (
    <div>
      <pre>{rowSpan + ' x ' + colSpan}</pre>
      <pre>{overallWidth + ' x ' + overallHeight}</pre>
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
            <td rowSpan={rowSpan}>
              <Scrollbar {...scrollbarProps} ref={this.scrollbarRef.y} type="y" />
            </td>
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
            <td rowSpan={rowSpan}>
              <Scrollbar {...scrollbarProps} ref={this.scrollbarRef.y} type="y" />
            </td>
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
            <td colSpan={colSpan}>
              <Scrollbar {...scrollbarProps} ref={this.scrollbarRef.x} type="x" />
            </td>
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
//        overallHeight,
//        overallWidth,
//        right,
//        rowSpan,
//        scrollbarProps,
//        top,
//      } = this;
//
//      return template.call(this, {
//        // variables
//        bottom,
//        center,
//        colSpan,
//        left,
//        overallHeight,
//        overallWidth,
//        right,
//        rowSpan,
//        scrollbarProps,
//        top,
//        // components
//        Scrollbar,
//      });
//    }
//
//  }
//  /* // USAGE EXAMPLE */
