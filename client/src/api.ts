export interface O2cmEventResults {
    placement: number,
    name: string,
    eventUrl: string
}

export interface O2cmEventDetails {
    name: string,
    compId: string,
    heatId: string,
    dances: string[],
    numRounds: number,
    numCouples: number,
    finalSize: number
}

export interface O2cmCompResults {
    name: string,
    date: Date,
    id: string,
    eventResults: O2cmEventResults[]
}

interface raw_o2cm_comp_results {
    name: string,
    date: string,
    id: string,
    events: O2cmEventResults[]
}

export function getO2cmResults(firstName: string, lastName: string): Promise<O2cmCompResults[]> {
    // TODO: Sanitize inputs
    return fetch(`/api/o2cm/results?fname=${firstName}&lname=${lastName}`)
        .then(res => res.json())
        .then((res: raw_o2cm_comp_results[]) => {
            return res.map(rawResult => {
                return {
                    name: rawResult.name,
                    date: new Date(rawResult.date), // TODO: Verify/actually do the proper conversion
                    id: rawResult.id,
                    eventResults: rawResult.events
                } as O2cmCompResults;
            });
        });
}

export function getO2cmEventDetails(compId: string, heatId: string): Promise<O2cmEventDetails> {
    // TODO: Sanitize inputs
    return fetch(`/api/o2cm/events?compId=${compId}&heatId=${heatId}`)
        .then(res => res.json())
        .then(res => { return res as O2cmEventDetails; });
}