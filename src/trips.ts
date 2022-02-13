/* eslint-disable max-lines-per-function */
/* eslint-disable max-depth */
/* eslint-disable max-statements */
import { Booking, BookingStatus } from "./booking";
import { DB } from "./db";
import { SMTP } from "./smtp";
import { Traveler } from "./traveler";
import { Trip, TripStatus } from "./trip";

export class Trips {
  public cancelTrip(tripId: string) {
    const trip: Trip = DB.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    trip.status = TripStatus.CANCELLED;
    DB.update(trip);
    const bookings: Booking[] = DB.select("SELECT * FROM bookings WHERE trip_id = " + tripId);
    if (bookings.length > 0) {
      const smtp = new SMTP();
      for (const booking of bookings) {
        booking.status = BookingStatus.CANCELLED;
        DB.update(booking);
        const traveler = DB.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${booking.travelerId}'`);
        if (traveler) {
          smtp.sendMail(
            "trips@astrobookings.com",
            traveler.email,
            "Trip cancelled",
            `Sorry, your trip ${trip.destination} has been cancelled.`,
          );
        }
      }
    }
  }
}
