import './App.css';
import CalculatorInfo from './CalculatorInfo';
import Footer from './Footer';
import Header from './Header';
import IndividualResults from './IndividualResults';
import IndividualSearch from './IndividualSearch';

function App() {
  return (
    <div className="App">
        <Header />

        <div className="container">
            <h1>YCN Calculator</h1>

            <IndividualSearch onSearch={(results) => { console.log(results); }} />

            <IndividualResults />

            <CalculatorInfo />
        </div>

        <Footer />
    </div>
  );
}

export default App;
