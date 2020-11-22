import React from 'react';
import './App.css';
import { useMHub } from './hooks/useMHub';

function App() {
  let [lastMsg, send] = useMHub('ws://' + window.location.hostname + ':13900','cards');
  return (
    <div className="App">
      <header className="App-header">
          {lastMsg}
      </header>
    </div>
  );
}

export default App;
