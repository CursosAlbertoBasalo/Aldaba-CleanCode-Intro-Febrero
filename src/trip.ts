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
  id = "";
  operatorId: string;
  operatorTripCode: string | undefined;
  destination: string;
  startDate: Date;
  endDate: Date;
  flightPrice: number;
  stayingPrice: number;
  kind: TripKinds = TripKinds.with_Stay;
  status: TripStatus = TripStatus.Waiting;
  luggagePrice = 0;
  premiumFoodPrice = 0;
  places: number;

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
