export enum BookingStatus {
  REQUESTED,
  PAID,
  RESERVED,
  BOOKING_NOTIFIED,
  ANNULLED,
  REFUNDED,
  RELEASED,
  ANNULATION_NOTIFIED,
  CANCELLED,
  CANCELLATION_NOTIFIED,
}

export class Booking {
  id = "";
  tripId: string;
  travelerId: string;
  passengersCount: number;
  status: BookingStatus = BookingStatus.REQUESTED;
  price: number;
  hasPremiumFoods = false;
  extraLuggageKilos = 0;
  operatorReserveCode: string;
  paymentId: string;
  refundId: string;
  constructor(tripId: string, travelerId: string, passengersCount: number) {
    this.tripId = tripId;
    this.travelerId = travelerId;
    this.passengersCount = passengersCount;
  }
}
