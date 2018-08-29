/* eslint-disable */
import React, { PureComponent } from 'react';

class Scrollbar extends PureComponent {
  state = { scrollTop: 0, scrollLeft: 0 }
  scrollTo = ({ scrollTop, scrollLeft }) => {
    this.setState(prevState => ({
      ...prevState,
      scrollTop,
      scrollLeft,
    }));
  }
  render() {
    const barWidth = this.props.width * this.props.width / this.props.overallWidth;
    const left = this.state.scrollLeft * this.props.width / this.props.overallWidth;

    const barHeight = this.props.height * this.props.height / this.props.overallHeight;
    const top = this.state.scrollTop * this.props.height / this.props.overallHeight;
    return (
      <div>
        {/* <div style={{ width: this.props.width, height: 20, background: 'blue' }}>
        </div> */}
        {this.props.type === 'x' && (
          <div style={{
 marginLeft: left, width: barWidth, height: this.props.scrollbarWidth, background: 'green',
}}
          />
        )}
        {this.props.type === 'y' && (
          <div style={{
 marginTop: top, height: barHeight, width: this.props.scrollbarWidth, background: 'green',
}}
          />
        )}


        {/* <pre>
        {JSON.stringify(this.props)}
        {JSON.stringify(this.state)}
        </pre> */}
      </div>
    );
  }
}

export default Scrollbar;
