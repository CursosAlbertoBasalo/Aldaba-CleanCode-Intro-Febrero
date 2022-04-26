import { Booking, BookingStatus } from "./booking";
import { DataBase } from "./data_base";
import { NotificationsService } from "./notifications.service";
import { SmtpService } from "./smtp.service";
import { Traveler } from "./traveler";
import { Trip, TripStatus } from "./trip";

export class Trips {
  public cancelTrip(tripId: string) {
    const trip: Trip = this.updateTripStatus(tripId);
    this.cancelBookings(tripId, trip);
  }

  public findTrips(destination: string, startDate: string, endDate: string): Trip[] {
    if (startDate < endDate) {
      throw new Error("Start date must be before end date");
    }
    const trips: Trip[] = DataBase.select(
      `SELECT * FROM trips WHERE destination = '${destination}' AND start_date >= '${startDate}' AND end_date <= '${endDate}'`,
    );
    return trips;
  }

  private updateTripStatus(tripId: string) {
    const trip: Trip = DataBase.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    trip.status = TripStatus.CANCELLED;
    DataBase.update(trip);
    return trip;
  }

  private cancelBookings(tripId: string, trip: Trip) {
    const bookings: Booking[] = DataBase.select("SELECT * FROM bookings WHERE trip_id = " + tripId);
    if (this.hasNoBookings(bookings)) {
      return;
    }
    const smtp = new SmtpService();
    for (const booking of bookings) {
      this.cancelBooking(booking, smtp, trip);
    }
  }

  private hasNoBookings(bookings: Booking[]) {
    return !bookings || bookings.length === 0;
  }

  private cancelBooking(booking: Booking, smtp: SmtpService, trip: Trip) {
    this.updateBookingStatus(booking);
    this.notifyTraveler(booking, trip);
  }

  private notifyTraveler(booking: Booking, trip: Trip) {
    const traveler = DataBase.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${booking.travelerId}'`);
    if (!traveler) {
      return;
    }
    const notifications = new NotificationsService();
    notifications.notifyTripCancellation(traveler.email, trip.destination);
  }

  private updateBookingStatus(booking: Booking) {
    booking.status = BookingStatus.CANCELLED;
    DataBase.update(booking);
  }
}
