import { NotificationEvent } from "./notificationEvent";
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
  { kind: NotificationKinds.BOOKING_CONFIRMED, sender: "bookings@astrobookings.com", subject: "Booking confirmation" },
  { kind: NotificationKinds.TRIP_CANCELLED, sender: "trips@astrobookings.com", subject: "Trip cancelled" },
];
export class Notifications {
  private smtp = new SMTP();

  public notifyTripCancellation(cancellation: NotificationEvent): string {
    const notificationConfiguration = notificationsConfigurations.find(
      (n) => n.kind === NotificationKinds.TRIP_CANCELLED,
    );
    return this.smtp.sendMail({
      from: notificationConfiguration?.sender || "",
      to: cancellation.recipient,
      subject: notificationConfiguration?.sender || "",
      body: `Sorry, your trip to ${cancellation.tripDestination} has been cancelled.`,
    });
  }
  public notifyBankTransfer(transfer: NotificationEvent): string {
    const notificationConfiguration = notificationsConfigurations.find(
      (n) => n.kind === NotificationKinds.TRIP_CANCELLED,
    );
    return this.smtp.sendMail({
      from: notificationConfiguration?.sender || "",
      to: transfer.recipient,
      subject: `${notificationConfiguration?.sender || ""}  -  ${transfer.bookingId}`,
      body: `Please transfer ${transfer.amount} from ${transfer.transferAccount}.`,
    });
  }
  public notifyBookingConfirmation(confirmation: NotificationEvent): string {
    const notificationConfiguration = notificationsConfigurations.find(
      (n) => n.kind === NotificationKinds.BOOKING_CONFIRMED,
    );
    return this.smtp.sendMail({
      from: notificationConfiguration?.sender || "",
      to: confirmation.recipient,
      subject: `${notificationConfiguration?.sender || ""}  -  ${confirmation.bookingId}`,
      body: `Enjoy your tip to ${confirmation.tripDestination}!`,
    });
  }
}
