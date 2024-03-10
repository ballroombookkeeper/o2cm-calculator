import React from "react";
import queryString from "query-string";

import { O2cmCompResults, getO2cmResults } from "./api";
import "./IndividualSearch.css";
import { IndividualCompetitionResults, IndividualEventResults, IndividualSearchResults } from "./IndividualResultTypes";

interface IProps {
    prepareSearch: () => void;
    onSearch: (results: IndividualSearchResults) => void;
}

interface IState {

}

class IndividualSearch extends React.Component<IProps, IState> {

    render() {
        return (
            <div className="individual-search">
                <form id="individualSearch" onSubmit={this.handleSubmit.bind(this)}>
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="First Name" name="fname" />
                        <input type="text" className="form-control" placeholder="Last Name" name="lname" />
                        <div className="input-group-append">
                            <button type="submit" className="btn btn-primary">Search</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    private handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const fname = event.currentTarget.fname.value;
        const lname = event.currentTarget.lname.value;

        if (fname && lname) {
            this.props.prepareSearch();
            getO2cmResults(fname, lname)
            .then((results) => {
                const ret = o2cmResultsToSearchType(fname, lname, results);
                this.props.onSearch(ret);
            });
        }
    }
};

function o2cmResultsToSearchType(firstName: string, lastName: string, results: O2cmCompResults[]): IndividualSearchResults {
    return {
        firstName: firstName,
        lastName: lastName,
        competitionResults: results.map(comp => {
            return {
                name: comp.name,
                id: comp.id,
                url: `https://results.o2cm.com/event3.asp?event=${comp.id}`,
                date: comp.date,
                eventResults: comp.eventResults.map(eventResult => {
                    const urlParams = queryString.parseUrl(eventResult.eventUrl);
                    const compId = urlParams.query.event;
                    const heatId = urlParams.query.heatid;
                    return {
                        name: eventResult.name,
                        compId: compId,
                        id: heatId,
                        url: eventResult.eventUrl,
                        placement: eventResult.placement,
                    } as IndividualEventResults;
                })
            } as IndividualCompetitionResults;
        })
    } as IndividualSearchResults;
}

export default IndividualSearch;