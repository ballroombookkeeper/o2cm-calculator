import React, { ReactHTML } from "react";

import { getO2cmResults, o2cm_result } from "./api";
import "./IndividualSearch.css";

interface IProps {
    onSearch: (results: o2cm_result[]) => void;
}

interface IState {

}

class IndividualSearch extends React.Component<IProps, IState> {

    render() {
        return (
            <div className="individual-search">
                <form id="individualSearch" onSubmit={this.handleSubmit}>
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
            getO2cmResults(fname, lname)
                .then(console.log);  // TODO: Use handler passed in from props
        }
    }
};

export default IndividualSearch;