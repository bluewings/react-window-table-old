/* eslint-disable */
import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import WindowTable from './components/WindowTable';

const columns = [...Array(10)].map((e, i) => ({ name: `col-${i}`, width: 120 }));

const data = [...Array(100)].map((e, i) => columns.reduce((prev, f, j) => ({
  ...prev,
  [f.name]: `${i},${j}`,
}), {}));

class App extends Component {
  render() {
    return (
      <div className="App" style={{ padding: 100 }}>
        <table border={1}>
          <tbody>
            <tr>
              <td>
                <WindowTable columns={columns.slice(0,50)} fixedTopCount={0} fixedBottomCount={0} rows={data} width={500} height={300} />
              </td>
              <td>
                <WindowTable columns={columns.slice(0,3)} rows={data} width={500} height={300} />
              </td>
            </tr>
            <tr>
              <td>
                <WindowTable columns={columns} rows={data} width={500} height={300} />
              </td>
              <td>
                <WindowTable columns={columns} fixedLeftCount={2} fixedBottomCount={0} fixedRightCount={0} rows={data} width={500} height={300} />
              </td>
            </tr>
          </tbody>
        </table>
        
        
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
