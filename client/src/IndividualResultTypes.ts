export interface IndividualEventResults {
    name: string,
    compId: string,
    id: string,
    url: string,
    placement: number,
    dances?: string[],
    numRounds?: number,
    numCouples?: number,
    finalSize?: number
}

export interface IndividualCompetitionResults {
    name: string,
    id: string,
    url: string,
    date: Date,
    eventResults: IndividualEventResults[]
}

export interface IndividualSearchResults {
    firstName: string,
    lastName: string,
    competitionResults: IndividualCompetitionResults[]
}