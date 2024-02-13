import React from 'react';
import './App.css';
import CalculatorInfo from './CalculatorInfo';
import Footer from './Footer';
import Header from './Header';
import IndividualResults from './IndividualResults';
import IndividualSearch, { IndividualSearchResults } from './IndividualSearch';

interface IAppProps {
}

interface IAppState {
    results: IndividualSearchResults | null;
}

class App extends React.Component<IAppProps, IAppState> {

    constructor(props: IAppProps) {
        super(props);
        this.state = {
            results: null
        };
    }

    render() {
        return (
            <div className="App">
                <Header />

                <div className="container">
                    <h1>YCN Calculator</h1>

                    <IndividualSearch onSearch={this.handleSearch.bind(this)} />

                    <IndividualResults initialResults={this.state.results}/>

                    <CalculatorInfo />
                </div>

                <Footer />
            </div>
          );
    }

    private handleSearch(searchResults: IndividualSearchResults) {
        this.setState(state => ({
            results: searchResults
        }));
    }
}

export default App;
