import { DB } from "./bd";
import { Booking, BookingStatus } from "./booking";
import { Traveler } from "./traveler";
import { Trip } from "./trip";

export class bookings {
  private booking!: Booking;
  private travel!: Trip;

  /**
   * Requests a new booking
   * @param {string} travelerId - the id of the traveler soliciting the booking
   * @param {string} trip_Id - the id of the trip to book
   * @param {number} passengers - the number of passengers to reserve
   * @param {string} cardNumber - the card number to pay with
   * @param {string} expiry - the card expiry date
   * @param {string} cardCVC - the card CVC
   * @param {boolean} premiumFoods - if the traveler has premium foods
   * @param {number} luggage - the number of extra luggage kilos
   * @returns {Booking} the new booking object
   * @throws {Error} if the booking is not possible
   */
  public request(
    travelerId: string,
    trip_Id: string,
    passengers: number,
    cardNumber: string,
    expiry: string,
    cardCVC: string,
    premiumFoods: boolean,
    luggage: number,
  ): Booking {
    this.newBooking(travelerId, trip_Id, passengers, premiumFoods, luggage);

    this.saveBooking();
    this.pay(cardNumber, expiry, cardCVC);
    return this.booking;
  }

  /**
   * Creates a new booking
   */
  private newBooking(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number,
  ): void {
    passengersCount = this.validatePassengersCount(travelerId, passengersCount);
    this.checkAvailability(tripId, passengersCount);
    this.booking = new Booking(tripId, travelerId, passengersCount);
    this.booking.hasPremiumFoods = hasPremiumFoods;
    this.booking.extraLuggageInt = extraLuggageKilos;
  }
  private validatePassengersCount(traveler_Code: string, passengersCount: number) {
    if (passengersCount > 6) {
      throw new Error("Nobody can't have more than 6 passengers");
    }
    // Check for passengers that ar not VIP
    if (this.forNormal(traveler_Code) && passengersCount > 4) {
      throw new Error("No vip can't have more than 4 passengers");
    }
    if (passengersCount <= 0) {
      passengersCount = 1;
    }
    return passengersCount;
  }
  private forNormal(traveler_Code: string): boolean {
    const theTraveler = DB.findOne<Traveler>(`SELECT * FROM travelers WHERE id = '${traveler_Code}'`);
    return theTraveler.vipTraveler;
  }

  private checkAvailability(tripId: string, passengersCount: number) {
    this.travel = DB.findOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    const seats = this.travel.places >= passengersCount;
    if (!seats) {
      throw new Error("There are no seats available in the trip");
    }
  }
  /** Save booking */
  private saveBooking() {
    this.booking.id = DB.post<Booking>(this.booking);
  }
  private pay(cardNumber: string, cardExpiry: string, cardCVC: string) {
    this.booking.price = this.price();
    // To Do: Call a Payment gateway to pay with card info
    console.log(`Paying ${this.booking.price} with ${cardNumber} and ${cardExpiry} and ${cardCVC}`);
    this.booking.paymentId = "payment fake identification";
    this.booking.status = BookingStatus.paid;
    DB.Update(this.booking);
  }
  private price(): number {
    // Milliseconds Per Day
    const mpd = 1000 * 60 * 60 * 24;
    const staying = Math.round(this.travel.endDate.getTime() - this.travel.startDate.getTime() / mpd);
    // Calculate staying price
    const stayingPrc = staying * this.travel.stayingPrice;
    // Calculate flight price
    const flightPrice = this.travel.flightPrice + (this.booking.hasPremiumFoods ? this.travel.premiumFoodPrice : 0);
    const price = flightPrice + stayingPrc;
    const passengersPrice = price * this.booking.passengers;
    // Calculate luggage price for all passengers of the booking
    const _extraPrice = this.booking.extraLuggageInt * this.travel.luggagePrice;
    return passengersPrice + _extraPrice;
  }
}
