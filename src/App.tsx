import React from 'react';
import { Provider } from './components/ui/provider'
import './App.css';
import Greeting from '../src/components/Greeting';

function App() {
  return (
    <div className="App">
      
    <Provider>
      <Greeting name="Raya" />
    </Provider>

    </div>
  );
}

export default App;
