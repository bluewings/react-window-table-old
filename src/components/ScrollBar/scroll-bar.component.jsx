import React, { PureComponent } from 'react';

class ScrollBar extends PureComponent {
  state = { scrollTop: 0, scrollLeft: 0 }
  scrollTo = ({ scrollTop, scrollLeft }) => {
    this.setState(prevState => {
      return {
        ...prevState,
        scrollTop,
        scrollLeft,
      }
    })
  }
  render() {
    const barWidth = this.props.width * this.props.width / this.props.fullWidth;
    const left = this.state.scrollLeft * this.props.width / this.props.fullWidth;

    const barHeight = this.props.height * this.props.height / this.props.fullHeight;
    const top = this.state.scrollTop * this.props.height / this.props.fullHeight;
    return (
      <div>
        {/* <div style={{ width: this.props.width, height: 20, background: 'blue' }}>
        </div> */}
        {this.props.type === 'x' && (
          <div style={{ marginLeft: left, width: barWidth, height: 20, background: 'green' }}></div>
        )}
        {this.props.type === 'y' && (
          <div style={{ marginTop: top, height: barHeight, width: 20, background: 'green' }}></div>
        )}
        
        
        
        {/* <pre>
        {JSON.stringify(this.props)}
        {JSON.stringify(this.state)}
        </pre> */}
        </div>
    )
  }
}

export default ScrollBar;
