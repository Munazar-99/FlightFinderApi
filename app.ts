import { Flights } from './type';
import express from 'express';
import cors from 'cors'
import moment from 'moment';
import { Request, Response, Application } from 'express';
import { flightDetails } from './flights'
import { getTimeDiff, generateTicket } from './utility';


const app: Application = express();

app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: false }));

app.get('/available-flights', (req: Request, res: Response) => {
    const { departure, destination }: { departure: string, destination: string } = req.body;
    const availableFlights = flightDetails
        .find(
            flight => flight.departureDestination === departure
                && flight.arrivalDestination === destination
        )
    return res.status(200).json(availableFlights);
});

app.get('/specified-flight', (req: Request, res: Response) => {
    const {
        departure,
        destination,
        specifiedDate
    }: {
        departure: string,
        destination: string,
        specifiedDate: string
    } = req.body;
    const selectedRoute = flightDetails
        .find(
            flight => flight.departureDestination.toLowerCase() === departure.toLowerCase()
                && flight.arrivalDestination.toLowerCase() === destination.toLowerCase()
        )
    const validDate = moment(specifiedDate, 'MM/DD/YYYY');
    if (selectedRoute && validDate) {
        const availableFlights = selectedRoute?.itineraries
            .filter(flight => moment.utc(flight.departureAt).format('MM/DD/YYYY') === specifiedDate)
        if (availableFlights.length > 0) {
            return res.status(200).json(availableFlights);
        }
        return res.status(404).json('no available flights on this date and check your date format');
    }
    return res.status(404).json('route not available');
});

app.patch('/book/:flightId', (req: Request, res: Response) => {
    const flightId = req.params.flightId;
    flightDetails.forEach(route => {
        route.itineraries.forEach(flight => {
            if (flight.flight_id === flightId) {
                if (flight.availableSeats > 0) {
                    flight.availableSeats--
                    return res.status(200).json(flightDetails);
                }
                return res.status(404).json('no more bookings left');
            }
        })
    })
});

app.get('/calculate', (req: Request, res: Response) => {
    const {
        departure,
        destination,
        specifiedDate
    }: {
        departure: string,
        destination: string,
        specifiedDate: string
    } = req.body;

    const validDate = moment(specifiedDate, 'MM/DD/YYYY');
    let possibleConnections: Flights[] = [];
    let ListofDestinations = [destination];


    for (let index = 0; index < 3; index++) {
        if (!ListofDestinations[index]) {
            return  possibleConnections.length > 1 
            ? res.status(200).json(possibleConnections.reverse()) 
            : res.status(404).json('plane doesnt go here');
 
        }
        const routesToDestination = flightDetails
            .filter(
                flight => flight.arrivalDestination.toLowerCase() === ListofDestinations[index].toLowerCase()
            )
        if (routesToDestination.length < 1) {
            return res.status(404).json('plane doesnt go here');
        }
        possibleConnections = [...possibleConnections, routesToDestination[0]]

        routesToDestination.forEach(flight => {
            const directRoutestoDeparture = flightDetails.filter((route =>
                route.departureDestination.toLowerCase() === departure.toLowerCase()
                && route.arrivalDestination.toLowerCase() === flight.departureDestination.toLowerCase()
            ))

            if (directRoutestoDeparture.length < 1) {
                return ListofDestinations.push(flight.departureDestination)
            }
            directRoutestoDeparture.forEach(route => {
                possibleConnections = [...possibleConnections, route,]
            })

        })
    }
    generateTicket(specifiedDate, possibleConnections.reverse())

    return possibleConnections.length > 2 
    ?  res.status(200).json(possibleConnections.reverse())
    : res.status(404).json('you might need to add more stops');

});

export default app;