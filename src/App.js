/* eslint-disable */
import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import WindowTable from './components/WindowTable';
import TmpTable from './components/TmpTable';
import Scrollarea from './components/Scrollarea';
import sampleImg from './sample.png';
import { columns, rows } from './examples/data/pokedex';

// const columns = [...Array(50)].map((e, i) => ({ name: `col-${i}`, width: 100 }));

// // const rows = [...Array(100)].map((e, i) => columns.reduce((prev, f, j) => ({
// //   ...prev,
// //   [f.name]: `rows ${i}_${j}`,
// // }), {}));
// columns[0].getValue = (e) => {
//   return '' + e;
// }
// columns[2].getValue = (e) => {
//   return '_' + e;
// }

// const rows = [...Array(5000)].map((e, i) => {

//   return columns.map((f, j) => {
//     if (j === 0) return i
//     return parseInt(Math.random() * 1000, 10);
//   })

// });

// columns[0] = {
//   name: 'img',
//   width: 60,
//   textAlign: 'center',
//   render: (src) => {
//     return (
//       <img src={src} height={40} />
//     )
//   }
// }

// columns[3].render = (src) => {
//   return (
//     <img src={src}  height={40} />
//   )
// }

// columns[3].textAlign = 'center';

const scrollbarTrackStyle = (base) => {
  return {
    ...base,
    background: 'yellow',
  }
}

const scrollbarHandleStyle = (base) => {
  return {
    ...base,
    background: 'transparent',

    '> div': {
      display: 'block',
      // content: '111',
      width: base.width - 6,
      height: base.height - 6,
      margin: 3,
      borderRadius: ((base.height - 6) / 2) + 'px',
      // background: 'red',
      transition: 'background 0.1s',
      // background: 'rgba(204,204,204,0.4)',
      // background: 'rgba(204,204,204,0.4)',
      background: 'rgba(0,0,0,0.25)',

      '&:hover': {
        // background: 'blue',
        // background: 'rgba(204,204,204,0.8)',
        background: 'rgba(0,0,0,0.5)',
        // boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)', 
      }
    },
    '&.dragging > div': {
      // background: 'blue',
      // background: 'rgba(204,204,204,0.8)',
      background: 'rgba(0,0,0,0.5)',
      // boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)',
    },
  }
}

const guidelineStyle = (base) => {
  return {
    ...base,
    width: 1,
    height: 1,
    background: 'black',
    opacity: '1 !important',
    // zIndex: 1,
  }
}

const cellStyle = (base) => {
  return {
    ...base,
    borderBottom: '1px solid silver'
  }
}

const headerStyle = (base) => {
  return {
    ...base,
    background: '#e8e8e8',
    // borderBottom: '1px solid silver'
  }
}

const rowHeight = (index) => {
  // console.log(index, index % 3, 40 + (index % 3) * 10)
  return 40 + (index % 3) * 10;
}

class App extends Component {
  render() {
    return (
      <div className="App" style={{ padding: 20 }}>
        {/* <Scrollarea contentHeight={1000}>
          <img src={sampleImg} />
        </Scrollarea> */}
                <TmpTable
                  // scrollbarTrackStyle={scrollbarTrackStyle}
                  // scrollbarHandleStyle={scrollbarHandleStyle}
                  // guidelineStyle={guidelineStyle}
                  // headerStyle={headerStyle}
                  // cellStyle={cellStyle}
                  // rowHeight={rowHeight}
                  columns={columns.slice(0, 15)} rows={rows.slice(0, 20000)} width={1000} height={516}
                  rowHeight={50}
                  columnWidth={200}
                  fixedLeftCount={1} 
                  fixedRightCount={1} 
                  fixedTopCount={1} 
                  fixedBottomCount={1} 
                  />
        {/* <table border={1} cellPadding={10}>
          <tbody>
            <tr>
              <td>
                <WindowTable columns={columns.slice(0, 3)} rows={rows.slice(0, 4)} fixedTopCount={0} fixedBottomCount={0} fixedLeftCount={0} fixedRightCount={0} width={500} height={300} />
              </td>
              <td>
                <WindowTable columns={columns.slice(0,3)} rows={rows} width={500} height={300} />
              </td>
            </tr>
            <tr>
              <td>
                <WindowTable
                  // scrollbarTrackStyle={scrollbarTrackStyle}
                  // scrollbarHandleStyle={scrollbarHandleStyle}
                  guidelineStyle={guidelineStyle}
                  headerStyle={headerStyle}
                  cellStyle={cellStyle}
                  rowHeight={rowHeight}
                  columns={columns} rows={rows.slice(0, 50)} width={500} height={300} />
              </td>
              <td>
                <WindowTable columns={columns} rows={rows.slice(0, 1000)}
                  rowHeight={30}
                  fixedLeftCount={2} fixedBottomCount={2} fixedRightCount={0} width={500} height={300} />
              </td>
            </tr>
          </tbody>
        </table> */}
        
        
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p> */}
      </div>
    );
  }
}

export default App;
