import React from 'react';
import './App.css';
import CalculatorInfo from './CalculatorInfo';
import Footer from './Footer';
import Header from './Header';
import IndividualResults from './IndividualResults';
import IndividualSearch from './IndividualSearch';
import { EventResultKey, IndividualEventResults, IndividualSearchResults } from './IndividualResultTypes';
import { getO2cmEventDetails } from './api';
import { MAX_COUPLES_PER_FINAL as YCN_MAX_COUPLES_PER_FINAL } from './ycn';

interface IAppProps {
}

interface IAppState {
    results: IndividualSearchResults | null;
    resultsByHeat: Record<string, IndividualEventResults>;
    isLoading: boolean;
    eventsToLoad: EventResultKey[];
    loadedEvents: Set<readonly [string, string]>;
    numFinalsToLoad: number;
}

class App extends React.Component<IAppProps, IAppState> {

    constructor(props: IAppProps) {
        super(props);
        this.state = {
            results: null,
            isLoading: false,
            eventsToLoad: [],
            loadedEvents: new Set(),
            resultsByHeat: {},
            numFinalsToLoad: 0
        };
    }

    render() {
        return (
            <div className="App">
                <Header />

                <div className="container">
                    <h1>YCN Calculator</h1>

                    <IndividualSearch prepareSearch={this.prepareSearch.bind(this)} onSearch={this.handleSearch.bind(this)} />

                    <IndividualResults isInitialLoading={this.state.isLoading} initialResults={this.state.results} numYcnRemaining={this.state.numFinalsToLoad} />

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
        const eventsToLoadWithPlacement: { key: EventResultKey, placement: number, date: Date }[] = [];
        searchResults.competitionResults.forEach(competition => {
            competition.eventResults.forEach(competitionEvent => {
                eventsByKey[getEventKey(competition.id, competitionEvent.id)] = competitionEvent;
                eventsToLoadWithPlacement.push({
                    key: { compId: competition.id, heatId: competitionEvent.id },
                    placement: competitionEvent.placement,
                    date: competition.date
                });
            });
        });

        // Load results that may be point-worthy first
        eventsToLoadWithPlacement.sort((a, b) => {
            return (a.placement <= YCN_MAX_COUPLES_PER_FINAL ? 0 : 1) - (b.placement <= YCN_MAX_COUPLES_PER_FINAL ? 0 : 1)
                || b.date.getTime() - a.date.getTime();
        });
        const eventsToLoad = eventsToLoadWithPlacement.map(event => event.key);
        const numFinalsToLoad = eventsToLoadWithPlacement.filter(e => e.placement <= YCN_MAX_COUPLES_PER_FINAL).length;

        this.setState({
            isLoading: false,
            results: searchResults,
            eventsToLoad: eventsToLoad,
            loadedEvents: new Set(),
            resultsByHeat: eventsByKey,
            numFinalsToLoad: numFinalsToLoad
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
            let numFinalsToLoad = this.state.numFinalsToLoad;
            if (storedResult.placement <= YCN_MAX_COUPLES_PER_FINAL) {
                --numFinalsToLoad;
            }
            this.setState(state => ({
                eventsToLoad: eventsToLoad,
                loadedEvents: loadedEvents,
                numFinalsToLoad: numFinalsToLoad
            }), this.loadEvent.bind(this));
        });
    }
}

function getEventKey(compId: string, heatId: string): string {
    return `${compId}_${heatId}`;
}

export default App;
