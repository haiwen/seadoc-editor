import logo from './logo.svg';
import './App.css';
import { add } from '@seafile/sdoc-editor';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
          {add(4, 5)}
        </p>
      </header>
    </div>
  );
}

export default App;
