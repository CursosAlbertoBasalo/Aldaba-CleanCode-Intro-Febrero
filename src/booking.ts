export enum BookingStatus {
  REQUESTED,
  PAID,
  RESERVED,
  NOTIFIED_RESERVATION,
  ERROR,
  CANCELLED,
}
export class Booking {
  public id: string | undefined;
  public tripId: string;
  public travelerId: string;
  public passengersCount: number;
  public status: BookingStatus = BookingStatus.REQUESTED;
  public price = 0;
  public hasPremiumFoods = false;
  public extraLuggageKilos = 0;
  public operatorReserveCode: string | undefined;
  public paymentId: string | undefined;
  constructor(tripId: string, travelerId: string, passengersCount: number) {
    this.tripId = tripId;
    this.travelerId = travelerId;
    this.passengersCount = passengersCount;
  }
}
