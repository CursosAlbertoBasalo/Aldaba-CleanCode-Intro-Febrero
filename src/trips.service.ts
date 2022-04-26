import { Booking, BookingStatus } from "./booking";
import { DataBase } from "./data_base";
import { SmtpService } from "./smtp.service";
import { Traveler } from "./traveler";
import { Trip, TripStatus } from "./trip";

export class TripsService {
  public cancelTrip(tripId: string) {
    // 🧼 🚿 same level of abstraction statements
    const trip: Trip = this.selectTrip(tripId);
    trip.status = TripStatus.CANCELLED;
    this.updateTrip(trip);
    const bookings: Booking[] = this.selectBookings(tripId);
    // 🧼 🚿 reduce nesting
    if (bookings.length > 0) {
      this.cancelBookings(bookings, trip);
    }
  }

  private cancelBookings(bookings: Booking[], trip: Trip) {
    const smtp = new SmtpService();
    // 🧼 🚿 no nested structures nor complex blocks
    for (const booking of bookings) {
      this.cancelBooking(booking, smtp, trip);
    }
  }

  private cancelBooking(booking: Booking, smtp: SmtpService, trip: Trip) {
    booking.status = BookingStatus.CANCELLED;
    this.updateBooking(booking);
    this.notifyCancellation(booking, smtp, trip);
  }

  private notifyCancellation(booking: Booking, smtp: SmtpService, trip: Trip) {
    const traveler = this.selectTraveler(booking.travelerId);
    if (!traveler) {
      return;
    }
    this.sendCancellationEmail(smtp, traveler, trip);
  }

  // 🧼 🚿 same level of abstraction functions
  private sendCancellationEmail(smtp: SmtpService, traveler: Traveler, trip: Trip) {
    smtp.sendMail(
      "trips@astrobookings.com",
      traveler.email,
      "Trip cancelled",
      `Sorry, your trip ${trip.destination} has been cancelled.`,
    );
  }

  private selectTrip(tripId: string) {
    return DataBase.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`) as Trip;
  }
  private selectBookings(tripId: string) {
    return DataBase.select("SELECT * FROM bookings WHERE trip_id = " + tripId) as Booking[];
  }
  private selectTraveler(travelerId: string) {
    return DataBase.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`) as Traveler;
  }
  private updateTrip(trip: Trip) {
    DataBase.update(trip);
  }
  private updateBooking(booking: Booking) {
    DataBase.update(booking);
  }
}
