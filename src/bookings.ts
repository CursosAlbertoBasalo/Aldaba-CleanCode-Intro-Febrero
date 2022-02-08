import { Booking, BookingStatus } from "./booking";
import { DB } from "./db";
import { Traveler } from "./traveler";
import { Trip } from "./trip";
// 🧼 PascalCase
export class Bookings {
  private booking!: Booking;
  private trip!: Trip; // 🧼 consistent naming

  /**
   * Requests a new booking
   * @param {string} travelerId - the id of the traveler soliciting the booking
   * @param {string} tripId - the id of the trip to book
   * @param {number} passengersCount - the number of passengers to reserve
   * @param {string} cardNumber - the card number to pay with
   * @param {string} cardExpiry - the card expiry date
   * @param {string} cardCVC - the card CVC
   * @param {boolean} hasPremiumFoods - if the traveler has premium foods
   * @param {number} extraLuggageKilos - the number of extra luggage kilos
   * @returns {Booking} the new booking object
   * @throws {Error} if the booking is not possible
   */
  public request(
    travelerId: string,
    tripId: string, // 🧼 camelCase
    passengersCount: number, // 🧼 distinction between a list and a value
    cardNumber: string,
    cardExpiry: string, // 🧼 coherent name
    cardCVC: string,
    hasPremiumFoods: boolean, // 🧼 boolean flags
    extraLuggageKilos: number,
  ): Booking {
    this.create(travelerId, tripId, passengersCount, hasPremiumFoods, extraLuggageKilos);
    // 🧼 remove empty line
    this.save();
    this.pay(cardNumber, cardExpiry, cardCVC);
    return this.booking;
  }
  // 🧼 clear intention, non redundant name, no comment
  private create(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number,
  ): void {
    passengersCount = this.getValidatedPassengersCount(travelerId, passengersCount);
    this.checkAvailability(tripId, passengersCount);
    this.booking = new Booking(tripId, travelerId, passengersCount);
    this.booking.hasPremiumFoods = hasPremiumFoods;
    this.booking.extraLuggageKilos = extraLuggageKilos;
  }
  // 🧼 start with get and express the intention and use consistent naming for parameters
  private getValidatedPassengersCount(travelerId: string, passengersCount: number) {
    const maxPassengersCount = 6; // 🧼 remove magic number
    if (passengersCount > maxPassengersCount) {
      throw new Error(`Nobody can't have more than ${maxPassengersCount} passengers`);
    }
    // 🧼 remove comments by using clear names
    const maxNonVipPassengersCount = 4; // 🧼 remove magic number
    if (this.isNonVip(travelerId) && passengersCount > maxNonVipPassengersCount) {
      throw new Error(`No VIPs cant't have more than ${maxNonVipPassengersCount} passengers`);
    }
    if (passengersCount <= 0) {
      passengersCount = 1;
    }
    return passengersCount;
  }
  // 🧼 boolean verbs should start with flags
  private isNonVip(travelerId: string): boolean {
    const theTraveler = DB.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
    return theTraveler.isVip;
  }

  private checkAvailability(tripId: string, passengersCount: number) {
    this.trip = DB.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    // 🧼 flags should start with flag verbs
    const hasAvailableSeats = this.trip.availablePlaces >= passengersCount;
    if (!hasAvailableSeats) {
      throw new Error("There are no seats available in the trip");
    }
  }
  // 🧼 remove redundant comments and words
  private save() {
    this.booking.id = DB.insert<Booking>(this.booking);
  }
  private pay(cardNumber: string, cardExpiry: string, cardCVC: string) {
    this.booking.price = this.calculatePrice();
    // To Do: Call a Payment gateway to pay with card info
    console.log(`Paying ${this.booking.price} with ${cardNumber} and ${cardExpiry} and ${cardCVC}`);
    this.booking.paymentId = "payment fake identification";
    this.booking.status = BookingStatus.PAID;
    DB.update(this.booking);
  }
  // 🧼 use verbs to clarify intention
  private calculatePrice(): number {
    // 🧼 remove magic number
    const millisecondsPerSecond = 1000;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;
    // 🧼 use a consistent name pattern
    const millisecondsPerDay = millisecondsPerSecond * secondsPerMinute * minutesPerHour * hoursPerDay;
    const stayingNights = Math.round(this.trip.endDate.getTime() - this.trip.startDate.getTime() / millisecondsPerDay);
    // Calculate staying price
    const stayingPrice = stayingNights * this.trip.stayingNightPrice;
    // Calculate flight price
    const flightPrice = this.trip.flightPrice + (this.booking.hasPremiumFoods ? this.trip.premiumFoodPrice : 0);
    const passengerPrice = flightPrice + stayingPrice;
    const passengersPrice = passengerPrice * this.booking.passengersCount;
    // Calculate luggage price for all passengers of the booking
    const extraTripPrice = this.booking.extraLuggageKilos * this.trip.extraLuggagePricePerKilo;
    return passengersPrice + extraTripPrice;
  }
}
