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
    isLoading: boolean;
}

class App extends React.Component<IAppProps, IAppState> {

    constructor(props: IAppProps) {
        super(props);
        this.state = {
            results: null,
            isLoading: false
        };
    }

    render() {
        return (
            <div className="App">
                <Header />

                <div className="container">
                    <h1>YCN Calculator</h1>

                    <IndividualSearch prepareSearch={this.prepareSearch.bind(this)} onSearch={this.handleSearch.bind(this)} />

                    <IndividualResults isLoading={this.state.isLoading} initialResults={this.state.results}/>

                    <CalculatorInfo />
                </div>

                <Footer />
            </div>
          );
    }

    private prepareSearch() {
        this.setState(state => ({
            isLoading: true
        }));
    }

    private handleSearch(searchResults: IndividualSearchResults) {
        this.setState(state => ({
            isLoading: false,
            results: searchResults
        }));
    }
}

export default App;
