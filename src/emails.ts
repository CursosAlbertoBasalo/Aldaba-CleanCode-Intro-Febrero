import { Booking, BookingStatus } from "./booking";
import { Payment } from "./payment";
import { Traveler } from "./traveler";

export class Emails {
  private newLine = "\n";

  public constructor(private traveler: Traveler, private booking: Booking, private payment: Payment) {}

  public getSalutation(): string {
    switch (this.booking.status) {
      case BookingStatus.RESERVED:
        return (
          "Dear " +
          this.traveler.name +
          this.newLine +
          "we are happy to confirm you that your trip booking was reserved" +
          this.newLine
        );
      case BookingStatus.RELEASED:
        return (
          "Dear " +
          this.booking.travelerId +
          this.newLine +
          "as yous have requested, your trip booking was annulled" +
          this.newLine
        );
      case BookingStatus.CANCELLED:
        return (
          "Dear " +
          this.booking.travelerId +
          this.newLine +
          "we are sorry to inform you that your trip was cancelled" +
          this.newLine
        );
    }
  }
  public getMainBody(): string {
    return JSON.stringify(this.booking) + this.newLine + JSON.stringify(this.payment);
  }
  public getSignature(): string {
    return "Best regards," + this.newLine + "The Astro Bookings team";
  }
}
