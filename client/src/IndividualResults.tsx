import React from "react";

import "./IndividualResults.css";
import { IndividualEventResults, IndividualSearchResults } from "./IndividualResultTypes";
import { calculateYcnPoints } from "./ycn";
import { STYLE_MAP, Skill, Style } from "./ballroom";

interface IIndividualSearchProps {
    initialResults: IndividualSearchResults | null;
    isLoading: boolean;
}

interface IIndividualSearchState {
    initialResults: IndividualSearchResults | null;
    isLoading: boolean;
}

function capitalizeFirstLetter(inp: string): string {
    return inp.charAt(0).toUpperCase() + inp.slice(1);
}

class IndividualSearch extends React.Component<IIndividualSearchProps, IIndividualSearchState> {

    constructor(props: IIndividualSearchProps) {
        super(props);
        this.state = {
            initialResults: null,
            isLoading: false
        };
    }

    static getDerivedStateFromProps(props: IIndividualSearchProps, state: IIndividualSearchState) {
        // TODO: There are probably better ways to check if things have changed
        if (props.isLoading !== state.isLoading) {
            return {
                isLoading: props.isLoading
            };
        }

        if (props.initialResults) {
            return {
                initialResults: props.initialResults
            };
        }
        return null;
    }

    render() {
        if (this.props.isLoading) {
            return (
                <div className="individual-results">
                    <progress value="null" />
                </div>
            );
        }

        if (!this.props.initialResults) {
            return <div className="individual-results"></div>;
        }

        const firstName = this.props.initialResults.firstName;
        const lastName = this.props.initialResults.lastName;

        const firstNameCapped = capitalizeFirstLetter(firstName);
        const lastNameCapped = capitalizeFirstLetter(lastName);

        // TODO: Sanitize search criteria
        const url = `http://results.o2cm.com/individual.asp?szFirst=${firstName}&szLast=${lastName}`;

        // Fetch and format all details
        const resultsRows: React.ReactElement<any, React.JSXElementConstructor<any>>[] = [];
        const ycnEvents: IndividualEventResults[] = [];
        const results = this.props.initialResults.competitionResults;
        results.forEach(competition => {
            let competitionName = competition.name;
            let competitionDate = competition.date.toDateString();
            for (let eventIdx = 0; eventIdx < competition.eventResults.length; ++eventIdx) {
                const event = competition.eventResults[eventIdx];
                const spinner = <div className="spinner-border spinner-border-sm" role="status" />;
                const numInFinal = event.finalSize;
                const isInFinal = numInFinal && event.placement <= numInFinal;
                const isYcn = isInFinal && event.numRounds && ((event.numRounds >= 2 && event.placement <= 3) || (event.numRounds >= 3 && event.placement <= 6));  // TODO: Will need to calculate how many points
                if (isYcn) {
                    ycnEvents.push(event);
                }
                const placementFormatted = isInFinal ? `${event.placement}*` + (isYcn ? "*" : "") : event.placement;  // TODO: do more with this than just an asterisk
                const numCouplesFormatted = event.numCouples ? event.numCouples : spinner;
                const numRoundsFormatted = event.numRounds ? event.numRounds : spinner;
                resultsRows.push(
                    <tr>
                        <td><a href={competition.url}>{competitionName}</a></td>
                        <td>{competitionDate}</td>
                        <td><a href={event.url}>{event.name}</a></td>
                        <td>{placementFormatted}</td>
                        <td>{numCouplesFormatted}</td>
                        <td>{numRoundsFormatted}</td>
                    </tr>
                );
                competitionName = "";
                competitionDate = "";
            }
        });

        // Calculate and format results
        const ycnResults = calculateYcnPoints(ycnEvents);
        const summaryRows: React.ReactElement<any, React.JSXElementConstructor<any>>[] = [];
        Object.entries(Style).forEach(([_, style]) => {
            STYLE_MAP[style].forEach((dance, idx) => {
                const summaryCells: React.ReactElement<any, React.JSXElementConstructor<any>>[] = [];
                const styleCell = <td>{idx === 0 ? <b>{style}</b> : ""}</td>;
                summaryCells.push(styleCell);
                summaryCells.push(<td>{dance}</td>);
                Object.entries(Skill).forEach(([_, skill]) => {
                    const skillMap = ycnResults[style][dance];
                    if (typeof skill !== "string"
                            && skillMap
                            && skill !== Skill.Newcomer) {
                        summaryCells.push(<td>{skillMap[skill]}</td>);
                    }
                });

                summaryRows.push(<tr>{summaryCells}</tr>);
            });
        });

        return (
            <div className="individual-results">
                <h2>Results for <a href={url}>{firstNameCapped + " " + lastNameCapped}</a></h2>
                <table className='table' id="summary-table">
                    <thead><tr><th>Totals</th><th></th><th>Bronze</th><th>Silver</th><th>Gold</th><th>Novice</th><th>Pre-champ</th><th>Champ</th></tr></thead>
                    {summaryRows}
                </table>

                <table className='table' id="results-table">
                    <thead><tr><th>Competition</th><th>Date</th><th>Event</th><th>Placement</th><th>Couples</th><th>Rounds</th></tr></thead>
                    {resultsRows}
                </table>
            </div>
        );
    }
};

export default IndividualSearch;