import React from 'react';
import './App.css';
import CalculatorInfo from './CalculatorInfo';
import Footer from './Footer';
import Header from './Header';
import IndividualResults from './IndividualResults';
import IndividualSearch from './IndividualSearch';
import { EventResultKey, IndividualEventResults, IndividualSearchResults } from './IndividualResultTypes';
import { getO2cmEventDetails } from './api';

interface IAppProps {
}

interface IAppState {
    results: IndividualSearchResults | null;
    resultsByHeat: Record<string, IndividualEventResults>;
    isLoading: boolean;
    eventsToLoad: EventResultKey[];
    loadedEvents: Set<readonly [string, string]>;
}

class App extends React.Component<IAppProps, IAppState> {

    constructor(props: IAppProps) {
        super(props);
        this.state = {
            results: null,
            isLoading: false,
            eventsToLoad: [],
            loadedEvents: new Set(),
            resultsByHeat: {}
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
        searchResults.competitionResults.sort((comp1, comp2) => comp2.date.getTime() - comp1.date.getTime());
        const eventsByKey: Record<string, IndividualEventResults> = {};
        const eventsToLoad: EventResultKey[] = [];
        searchResults.competitionResults.forEach(competition => {
            competition.eventResults.forEach(competitionEvent => {
                eventsByKey[getEventKey(competition.id, competitionEvent.id)] = competitionEvent;
                eventsToLoad.push({ compId: competition.id, heatId: competitionEvent.id });
            });
        });

        this.setState({
            isLoading: false,
            results: searchResults,
            eventsToLoad: eventsToLoad,
            loadedEvents: new Set(),
            resultsByHeat: eventsByKey
        }, this.loadEvent.bind(this));  // TODO: Worth doing more than one at a times
    }

    private loadEvent() {
        const eventsToLoad = this.state.eventsToLoad;
        const loadedEvents = this.state.loadedEvents;
        const event = eventsToLoad.shift();
        if (!event) {
            return;
        }

        const compId = event.compId;
        const heatId = event.heatId;
        loadedEvents.add([compId, heatId]);

        getO2cmEventDetails(compId, heatId)
        .then(eventDetails => {
            const storedResult = this.state.resultsByHeat[getEventKey(compId, heatId)];
            storedResult.dances = eventDetails.dances;
            storedResult.finalSize = eventDetails.finalSize;
            storedResult.numCouples = eventDetails.numCouples;
            storedResult.numRounds = eventDetails.numRounds;
            this.setState(state => ({
                eventsToLoad: eventsToLoad,
                loadedEvents: loadedEvents,
            }), this.loadEvent.bind(this));
        });
    }
}

function getEventKey(compId: string, heatId: string): string {
    return `${compId}_${heatId}`;
}

export default App;
