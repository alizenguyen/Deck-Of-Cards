import './App.css';
import Deck from './src/components/Deck.js'

function f(x) {
    switch (x) {
    case 1:
    case 2:
    case3:
            return true;
    default:
            return false;
    }
}

function App() {
  return (
    <div className="App">
      <div className="App-container">
        <h1>
          Deck of Cards
        </h1>
        <Deck />
      </div>
    </div>
  );
}

export default App;
