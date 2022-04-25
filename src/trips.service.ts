import { Booking } from "./booking";
import { BookingStatus } from "./booking_status.enum";
import { DataBase } from "./data_base";
import { DateRangeVo } from "./date_range.vo";
import { FindTripsDto } from "./find_trips.dto";
import { NotificationsService } from "./notifications.service";
import { SmtpService } from "./smtp.service";
import { Traveler } from "./traveler";
import { Trip, TripStatus } from "./trip";

export class TripsService {
  private tripId = "";
  private trip!: Trip;
  public cancelTrip(tripId: string) {
    // 🧼 Saved as a properties on the class to reduce method parameters
    this.tripId = tripId;
    this.trip = this.updateTripStatus();
    this.cancelBookings();
  }

  public findTrips(findTripsDTO: FindTripsDto): Trip[] {
    // 🧼 date range ensures the range is valid
    const dates = new DateRangeVo(findTripsDTO.startDate, findTripsDTO.endDate);
    const trips: Trip[] = DataBase.select(
      `SELECT * FROM trips WHERE destination = '${findTripsDTO.destination}' AND start_date >= '${dates.start}' AND end_date <= '${dates.end}'`,
    );
    return trips;
  }

  private updateTripStatus() {
    const trip: Trip = DataBase.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${this.tripId}'`);
    trip.status = TripStatus.CANCELLED;
    DataBase.update(trip);
    return trip;
  }

  private cancelBookings() {
    const bookings: Booking[] = DataBase.select("SELECT * FROM bookings WHERE trip_id = " + this.tripId);
    if (this.hasNoBookings(bookings)) {
      return;
    }
    const smtp = new SmtpService();
    for (const booking of bookings) {
      this.cancelBooking(booking, smtp, this.trip);
    }
  }

  private hasNoBookings(bookings: Booking[]) {
    return !bookings || bookings.length === 0;
  }

  private cancelBooking(booking: Booking, smtp: SmtpService, trip: Trip) {
    this.updateBookingStatus(booking);
    this.notifyTraveler(booking, smtp, trip);
  }

  private notifyTraveler(booking: Booking, smtp: SmtpService, trip: Trip) {
    const traveler = DataBase.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${booking.travelerId}'`);
    if (!traveler) {
      return;
    }
    const notifications = new NotificationsService();
    notifications.notifyTripCancellation({
      recipient: traveler.email,
      tripDestination: trip.destination,
      bookingId: booking.id,
    });
  }

  private updateBookingStatus(booking: Booking) {
    booking.status = BookingStatus.CANCELLED;
    DataBase.update(booking);
  }
}
