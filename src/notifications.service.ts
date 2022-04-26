import { SmtpService } from "./smtp.service";
export enum NotificationKinds {
  BOOKING_CONFIRMED,
  TRIP_CANCELLED,
  BANK_TRANSFER_REQUEST,
}
export class NotificationsService {
  private smtp = new SmtpService();

  public notifyTripCancellation(travelerEmail: string, destination: string): string {
    return this.smtp.sendMail(
      this.getSender(NotificationKinds.TRIP_CANCELLED),
      travelerEmail,
      this.getSubject(NotificationKinds.TRIP_CANCELLED),
      `Sorry, your trip to ${destination} has been cancelled.`,
    );
  }
  public notifyBankTransfer(bankEmail: string, bookingId: string, amount: number, transferAccount: string): string {
    return this.smtp.sendMail(
      this.getSender(NotificationKinds.BANK_TRANSFER_REQUEST),
      bankEmail,
      `${this.getSubject(NotificationKinds.TRIP_CANCELLED)}  -  ${bookingId}`,
      `Please transfer ${amount} from ${transferAccount}.`,
    );
  }
  public notifyBookingConfirmation(travelerEmail: string, destination: string, bookingId: string): string {
    return this.smtp.sendMail(
      this.getSender(NotificationKinds.BOOKING_CONFIRMED),
      travelerEmail,
      `${this.getSubject(NotificationKinds.BOOKING_CONFIRMED)}  -  ${bookingId}`,
      `Enjoy your tip to ${destination}!`,
    );
  }
  private getSender(kind: NotificationKinds): string {
    switch (kind) {
      case NotificationKinds.BOOKING_CONFIRMED:
        return "bookings@astrobookings.com";
      case NotificationKinds.TRIP_CANCELLED:
        return "trips@astrobookings.com";
      case NotificationKinds.BANK_TRANSFER_REQUEST:
        return "payments@astrobookings.com";
      default:
        return "";
    }
  }
  private getSubject(kind: NotificationKinds): string {
    switch (kind) {
      case NotificationKinds.BOOKING_CONFIRMED:
        return "Booking confirmation";
      case NotificationKinds.TRIP_CANCELLED:
        return "Trip cancelled";
      case NotificationKinds.BANK_TRANSFER_REQUEST:
        return "Payment request for Booking";
      default:
        return "";
    }
  }
}
