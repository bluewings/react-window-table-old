/* eslint-disable */
import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import WindowTable from './components/WindowTable';

const columns = [...Array(100)].map((e, i) => ({ name: `col-${i}`, width: 120 }));

const data = [...Array(30)].map((e, i) => columns.reduce((prev, f, j) => ({
  ...prev,
  [f.name]: `${i},${j}`,
}), {}));

class App extends Component {
  render() {
    return (
      <div className="App">
        <WindowTable columns={columns} data={data} />
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
