export interface o2cm_event {
    placement: number,
    event: string,
    eventUrl: string
}

export interface o2cm_result {
    name: string,
    date: Date,
    id: string,
    events: o2cm_event[]
}

interface raw_o2cm_result {
    name: string,
    date: string,
    id: string,
    events: o2cm_event[]
}

export function getO2cmResults(firstName: string, lastName: string): Promise<o2cm_result[]> {
    // TODO: Sanitize inputs
    return fetch(`/api/o2cm/results?fname=${firstName}&lname=${lastName}`)
        .then(res => res.json())
        .then((res: raw_o2cm_result[]) => {
            return res.map(rawResult => {
                return {
                    name: rawResult.name,
                    date: new Date(rawResult.date), // TODO: Verify/actually do the proper conversion
                    id: rawResult.id,
                    events: rawResult.events
                } as o2cm_result;
            });
        });
}