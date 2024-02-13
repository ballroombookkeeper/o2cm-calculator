import React, { ReactHTML } from "react";

import { getO2cmResults, o2cm_result } from "./api";
import "./IndividualSearch.css";

interface IProps {
    prepareSearch: () => void;
    onSearch: (results: IndividualSearchResults) => void;
}

interface IState {

}

export interface IndividualSearchResults {
    firstName: string,
    lastName: string,
    results: o2cm_result[]
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
                const ret = {
                    firstName: fname,
                    lastName: lname,
                    results
                };
                this.props.onSearch(ret);
            });
        }
    }
};

export default IndividualSearch;