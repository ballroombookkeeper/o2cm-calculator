import React from "react";

import "./IndividualResults.css";
import { IndividualEventResults, IndividualSearchResults } from "./IndividualResultTypes";
import { calculateYcnPoints, getMaxDanceableLevelByStyle } from "./ycn";
import { STYLE_MAP, Skill, Style } from "./ballroom";

interface IIndividualSearchState {
    initialResults: IndividualSearchResults | null;
    isInitialLoading: boolean;
    numYcnRemaining: number;
}

const SPINNER = <div className="spinner-border spinner-border-sm" role="status" />;

function capitalizeFirstLetter(inp: string): string {
    return inp.charAt(0).toUpperCase() + inp.slice(1);
}

class IndividualSearch extends React.Component<IIndividualSearchState, IIndividualSearchState> {

    constructor(props: IIndividualSearchState) {
        super(props);
        this.state = {
            initialResults: null,
            isInitialLoading: false,
            numYcnRemaining: 0
        };
    }

    static getDerivedStateFromProps(props: IIndividualSearchState, state: IIndividualSearchState) {
        // TODO: There are probably better ways to check if things have changed
        if (props.isInitialLoading !== state.isInitialLoading) {
            return {
                isLoading: props.isInitialLoading
            };
        }

        if (props.initialResults) {
            return {
                initialResults: props.initialResults,
                numYcnRemaining: props.numYcnRemaining
            };
        }
        return null;
    }

    render() {
        if (this.props.isInitialLoading) {
            return (
                <div className="individual-results">
                    <span className="ycn-loading-indicator-text">Fetching results from o2cm...</span>
                    {SPINNER}
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
        const firstNameUrlSafe = encodeURIComponent(firstName.replace("'", "`"));
        const lastNameUrlSafe = encodeURIComponent(lastName.replace("'", "`"))

        const url = `http://results.o2cm.com/individual.asp?szFirst=${firstNameUrlSafe}&szLast=${lastNameUrlSafe}`;

        // Fetch and format all details
        const resultsRows: React.ReactElement<any, React.JSXElementConstructor<any>>[] = [];
        const ycnEvents: IndividualEventResults[] = [];
        const results = this.props.initialResults.competitionResults;
        results.forEach(competition => {
            let competitionName = competition.name;
            let competitionDate = competition.date.toDateString();
            for (let eventIdx = 0; eventIdx < competition.eventResults.length; ++eventIdx) {
                const event = competition.eventResults[eventIdx];
                const numInFinal = event.finalSize;
                const isInFinal = numInFinal && event.placement <= numInFinal;
                const isYcn = isInFinal && event.numRounds && ((event.numRounds >= 2 && event.placement <= 3) || (event.numRounds >= 3 && event.placement <= 6));  // TODO: Will need to calculate how many points
                if (isYcn) {
                    ycnEvents.push(event);
                }
                const placementFormatted = isInFinal ? `${event.placement}*` + (isYcn ? "*" : "") : event.placement;  // TODO: do more with this than just an asterisk
                const numCouplesFormatted = event.numCouples ? event.numCouples : SPINNER;
                const numRoundsFormatted = event.numRounds ? event.numRounds : SPINNER;
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

        const styleSummaryTableHeaderCells: React.ReactElement<any, React.JSXElementConstructor<any>>[] = [];
        const styleSummaryTableCells: React.ReactElement<any, React.JSXElementConstructor<any>>[] = [];
        const styleSummary = getMaxDanceableLevelByStyle(ycnResults);
        Object.entries(Style).forEach(([_, style]) => {
            styleSummaryTableHeaderCells.push(<th>{style}</th>);
            styleSummaryTableCells.push(<td>{Skill[styleSummary[style]]}</td>);
        });
        const styleSummaryTable = (<table className='table table-hover' id="style-summary-table">
            <thead><tr>{styleSummaryTableHeaderCells}</tr></thead>
            <tbody>
                <tr>{styleSummaryTableCells}</tr>
            </tbody>
            </table>);

        const eventsToCalculateRemaining = this.state.numYcnRemaining;
        const calculatingYcnPointsIndicator = <div className="ycn-loading-indicator">
            <span className="ycn-loading-indicator-text">Calculating YCN Points ({eventsToCalculateRemaining} remaining)...</span>
            {SPINNER}
        </div>;

        return (
            <div className="individual-results">
                <h2>Results for <a href={url}>{firstNameCapped + " " + lastNameCapped}</a></h2>

                {eventsToCalculateRemaining > 0 ? calculatingYcnPointsIndicator : ""}

                {styleSummaryTable}

                <div className="table-responsive">
                    <table className='table table-hover' id="summary-table">
                        <thead><tr><th>Totals</th><th></th><th>Bronze</th><th>Silver</th><th>Gold</th><th>Novice</th><th>Pre-champ</th><th>Champ</th></tr></thead>
                        <tbody>
                            {summaryRows}
                        </tbody>
                    </table>
                </div>

                <div className="table-responsive">
                    <table className='table table-hover' id="results-table">
                        <thead><tr><th>Competition</th><th>Date</th><th>Event</th><th>Placement</th><th>Couples</th><th>Rounds</th></tr></thead>
                        <tbody>
                            {resultsRows}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
};

export default IndividualSearch;