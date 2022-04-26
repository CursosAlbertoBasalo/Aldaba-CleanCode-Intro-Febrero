import { TripKinds } from "./trip_kinds.enum";
import { TripStatus } from "./trip_status.enum";

export class TripDto {
  public id: string | undefined;
  public operatorId: string;
  public operatorTripCode: string | undefined;
  public destination: string;
  public startDate: Date;
  public endDate: Date;
  public flightPrice: number;
  public stayingNightPrice: number;
  public kind: TripKinds = TripKinds.WITH_STAY;
  public status: TripStatus = TripStatus.WAITING;
  public extraLuggagePricePerKilo = 0;
  public premiumFoodPrice = 0;
  public availablePlaces: number;

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
    this.stayingNightPrice = stayingNightPrice;
    this.availablePlaces = places;
  }
}
