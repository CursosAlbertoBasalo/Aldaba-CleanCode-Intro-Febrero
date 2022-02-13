import { Booking, BookingStatus } from "./booking";
import { DB } from "./db";
import { SMTP } from "./smtp";
import { Traveler } from "./traveler";
import { Trip, TripStatus } from "./trip";

export class Trips {
  public cancelTrip(tripId: string) {
    const trip: Trip = this.updateTripStatus(tripId);
    this.cancelBookings(tripId, trip);
  }

  private updateTripStatus(tripId: string) {
    const trip: Trip = DB.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    trip.status = TripStatus.CANCELLED;
    DB.update(trip);
    return trip;
  }

  private cancelBookings(tripId: string, trip: Trip) {
    const bookings: Booking[] = DB.select("SELECT * FROM bookings WHERE trip_id = " + tripId);
    if (this.hasNoBookings(bookings)) {
      return;
    }
    const smtp = new SMTP();
    for (const booking of bookings) {
      this.cancelBooking(booking, smtp, trip);
    }
  }

  private hasNoBookings(bookings: Booking[]) {
    return !bookings || bookings.length === 0;
  }

  private cancelBooking(booking: Booking, smtp: SMTP, trip: Trip) {
    this.updateBookingStatus(booking);
    this.notifyTraveler(booking, smtp, trip);
  }

  private notifyTraveler(booking: Booking, smtp: SMTP, trip: Trip) {
    const traveler = DB.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${booking.travelerId}'`);
    if (!traveler) {
      return;
    }
    smtp.sendMail(
      "trips@astrobookings.com",
      traveler.email,
      "Trip cancelled",
      `Sorry, your trip ${trip.destination} has been cancelled.`,
    );
  }

  private updateBookingStatus(booking: Booking) {
    booking.status = BookingStatus.CANCELLED;
    DB.update(booking);
  }
}
