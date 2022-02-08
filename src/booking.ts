export enum BookingStatus {
  requested,
  paid,
  reserved,
  notified_reserve,
}

export class Booking {
  public id: string | undefined;
  public tripId: string;
  public travelerId: string;
  public passengers: number;
  public status: BookingStatus = BookingStatus.requested;
  public price = 0;
  public hasPremiumFoods = false;
  public extraLuggageInt = 0;
  public operatorReserveCode: string | undefined;
  public paymentId: string | undefined;
  constructor(tripId: string, travelerId: string, passengersCount: number) {
    this.tripId = tripId;
    this.travelerId = travelerId;
    this.passengers = passengersCount;
  }
}
