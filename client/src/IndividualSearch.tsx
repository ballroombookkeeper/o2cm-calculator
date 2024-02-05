import React from "react";

import "./IndividualSearch.css";

interface IProps {

}

interface IState {

}

class IndividualSearch extends React.Component<IProps, IState> {

    render() {
        return (
            <div className="individual-search">
                <form method="GET" id="individualSearch">
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
};

export default IndividualSearch;