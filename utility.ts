import moment from 'moment';
import { Flights } from './type';


export const getTimeDiff = (timeB:string, timeA:string) => {
    const laterTime = moment(timeB);
    const earlierTime = moment(timeA);
    const diff_s = laterTime.diff(earlierTime, 'seconds'); 
    return moment.utc(moment.duration(diff_s, "seconds").asMilliseconds()).format("h:mm:ss")
}

export const generateTicket = (specifiedDate: string, possibleConnections: Flights[]) => {
    const flightsInQuestion = possibleConnections.map(route => 
         route.itineraries.filter(flight => 
         moment.utc(flight.departureAt).format('MM/DD/YYYY') === specifiedDate
         || moment.utc(flight.arrivalAt).format('MM/DD/YYYY') === specifiedDate
        ))
        console.log(flightsInQuestion)
    return flightsInQuestion
}