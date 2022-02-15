import { SMTP } from "./smtp";
export enum NotificationKinds {
  BOOKING_CONFIRMED,
  TRIP_CANCELLED,
  BANK_TRANSFER_REQUEST,
}
const notificationsConfigurations = [
  {
    kind: NotificationKinds.BANK_TRANSFER_REQUEST,
    sender: "payments@astrobookings.com",
    subject: "Payment request for Booking",
  },
  {
    kind: NotificationKinds.BOOKING_CONFIRMED,
    sender: "bookings@astrobookings.com",
    subject: "Booking confirmation",
  },
  {
    kind: NotificationKinds.TRIP_CANCELLED,
    sender: "trips@astrobookings.com",
    subject: "Trip cancelled",
  },
];
export class Notifications {
  private smtp = new SMTP();

  public notifyTripCancellation(travelerEmail: string, destination: string): string {
    const notificationConfiguration = notificationsConfigurations.find(
      (n) => n.kind === NotificationKinds.TRIP_CANCELLED,
    );
    return this.smtp.sendMail(
      notificationConfiguration?.sender || "",
      travelerEmail,
      notificationConfiguration?.sender || "",
      `Sorry, your trip to ${destination} has been cancelled.`,
    );
  }
  public notifyBankTransfer(bankEmail: string, bookingId: string, amount: number, transferAccount: string): string {
    const notificationConfiguration = notificationsConfigurations.find(
      (n) => n.kind === NotificationKinds.TRIP_CANCELLED,
    );
    return this.smtp.sendMail(
      notificationConfiguration?.sender || "",
      bankEmail,
      `${notificationConfiguration?.sender || ""}  -  ${bookingId}`,
      `Please transfer ${amount} from ${transferAccount}.`,
    );
  }
  public notifyBookingConfirmation(travelerEmail: string, destination: string, bookingId: string): string {
    const notificationConfiguration = notificationsConfigurations.find(
      (n) => n.kind === NotificationKinds.BOOKING_CONFIRMED,
    );
    return this.smtp.sendMail(
      notificationConfiguration?.sender || "",
      travelerEmail,
      `${notificationConfiguration?.sender || ""}  -  ${bookingId}`,
      `Enjoy your tip to ${destination}!`,
    );
  }
}
