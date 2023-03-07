

export interface Flights {
    route_id:             string;
    departureDestination: string;
    arrivalDestination:   string;
    itineraries:          Itinerary[];
}

export interface Itinerary {
    flight_id:      string;
    departureAt:    string;
    arrivalAt:      string;
    availableSeats: number;
    prices:         Prices;
}

export interface Prices {
    currency: string;
    adult:    number;
    child:    number;
}

