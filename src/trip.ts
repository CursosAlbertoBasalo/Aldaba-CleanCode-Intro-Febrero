export enum TripKinds {
  TRIP_ONLY,
  with_Stay,
}

export enum TripStatus {
  Waiting,
  cancelled,
  confirmed,
  notified,
}

export class Trip {
  public id: string | undefined;
  public operatorId: string;
  public operatorTripCode: string | undefined;
  public destination: string;
  public startDate: Date;
  public endDate: Date;
  public flightPrice: number;
  public stayingPrice: number;
  public kind: TripKinds = TripKinds.with_Stay;
  public status: TripStatus = TripStatus.Waiting;
  public luggagePrice = 0;
  public premiumFoodPrice = 0;
  public places: number;

  constructor(
    operatorId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    flightPrice: number,
    stayingNightPrice = 0,
    places = 0,
  ) {
    this.operatorId = operatorId;
    this.destination = destination;
    this.startDate = startDate;
    this.endDate = endDate;
    this.flightPrice = flightPrice;
    this.stayingPrice = stayingNightPrice;
    this.places = places;
  }
}
