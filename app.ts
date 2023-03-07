import express from 'express';
import cors from 'cors'
import moment from 'moment';
import { Request, Response, Application } from 'express';
import { flightDetails } from './flights'


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



export default app;