import { NotificationKinds } from "./notification_kinds.enum";
// 🧼 🚿 Using an array as a map for avoid switches
// could be a dictionary or any other list structure

export const notificationsMap = [
  {
    kind: NotificationKinds.BANK_TRANSFER_REQUEST,
    sender: "payments@astrobookings.com",
    subject: "Payment request for Booking",
  },
  { kind: NotificationKinds.BOOKING_CONFIRMED, sender: "bookings@astrobookings.com", subject: "Booking confirmation" },
  { kind: NotificationKinds.TRIP_CANCELLED, sender: "trips@astrobookings.com", subject: "Trip cancelled" },
];
