export enum BookingStatus {
  requested,
  paid,
  reserved,
  notified,
}

export class Booking {
  id = "";
  tripId: string;
  travelerId: string;
  passengers: number;
  status: BookingStatus = BookingStatus.requested;
  price: number;
  hasPremiumFoods = false;
  extraLuggageInt = 0;
  operatorReserveCode: string;
  paymentId: string;
  constructor(tripId: string, travelerId: string, passengersCount: number) {
    this.tripId = tripId;
    this.travelerId = travelerId;
    this.passengers = passengersCount;
  }
}
