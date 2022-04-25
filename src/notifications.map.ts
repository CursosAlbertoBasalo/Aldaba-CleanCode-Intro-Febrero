import { NotificationKinds } from "./notification_kinds.enum";

export const NotificationsMap = [
  {
    kind: NotificationKinds.BANK_TRANSFER_REQUEST,
    sender: "payments@astrobookings.com",
    subject: "Payment request for Booking",
  },
  { kind: NotificationKinds.BOOKING_CONFIRMED, sender: "bookings@astrobookings.com", subject: "Booking confirmation" },
  { kind: NotificationKinds.TRIP_CANCELLED, sender: "trips@astrobookings.com", subject: "Trip cancelled" },
];
