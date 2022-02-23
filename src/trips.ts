import { Booking, BookingStatus } from "./booking";
import { DateRangeVO } from "./dateRangeVO";
import { DB } from "./db";
import { FindTripsDTO } from "./findTripsDTO";
import { Notifications } from "./notifications";
import { SMTP } from "./smtp";
import { Traveler } from "./traveler";
import { Trip, TripStatus } from "./trip";

export class Trips {
  private tripId = "";
  private trip!: Trip;
  public cancelTrip(tripId: string) {
    // 🧼 Saved as a properties on the class to reduce method parameters
    this.tripId = tripId;
    this.trip = this.updateTripStatus();
    this.cancelBookings();
  }

  public findTrips(findTripsDTO: FindTripsDTO): Trip[] {
    // 🧼 date range ensures the range is valid
    const dates = new DateRangeVO(findTripsDTO.startDate, findTripsDTO.endDate);
    const trips: Trip[] = DB.select(
      `SELECT * FROM trips WHERE destination = '${findTripsDTO.destination}' AND start_date >= '${dates.start}' AND end_date <= '${dates.end}'`,
    );
    return trips;
  }

  private updateTripStatus() {
    const trip: Trip = DB.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${this.tripId}'`);
    trip.status = TripStatus.CANCELLED;
    DB.update(trip);
    return trip;
  }

  private cancelBookings() {
    const bookings: Booking[] = DB.select("SELECT * FROM bookings WHERE trip_id = " + this.tripId);
    if (this.hasNoBookings(bookings)) {
      return;
    }
    const smtp = new SMTP();
    for (const booking of bookings) {
      this.cancelBooking(booking, smtp, this.trip);
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
    const notifications = new Notifications();
    notifications.notifyTripCancellation({
      recipient: traveler.email,
      tripDestination: trip.destination,
      bookingId: booking.id,
    });
  }

  private updateBookingStatus(booking: Booking) {
    booking.status = BookingStatus.CANCELLED;
    DB.update(booking);
  }
}
