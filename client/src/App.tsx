import './App.css';
import Header from './Header';
import Footer from './Footer';
import IndividualSearch from './IndividualSearch';
import CalculatorInfo from './CalculatorInfo';

function App() {
  return (
    <div className="App">
        <Header />

        <div className="container">
            <h1>YCN Calculator</h1>

            <IndividualSearch />

            <CalculatorInfo />
        </div>

        <Footer />
    </div>
  );
}

export default App;
