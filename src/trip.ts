export enum TripKinds {
  TRIP_ONLY,
  WITH_STAY,
}

export enum TripStatus {
  WAITING,
  CANCELLED,
  CONFIRMED,
  NOTIFIED,
}

export class Trip {
  id = "";
  operatorId: string;
  operatorTripCode: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  flightPrice: number;
  stayingNightPrice: number;
  kind: TripKinds = TripKinds.WITH_STAY;
  status: TripStatus = TripStatus.WAITING;
  extraLuggagePricePerKilo: number;
  premiumFoodPrice: number;

  constructor(
    operatorId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    flightPrice: number,
    stayingNightPrice = 0
  ) {
    this.operatorId = operatorId;
    this.destination = destination;
    this.startDate = startDate;
    this.endDate = endDate;
    this.flightPrice = flightPrice;
    this.stayingNightPrice = stayingNightPrice;
  }
}
