/* eslint-disable max-depth */
/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import { Booking, BookingStatus } from "./booking";
import { DB } from "./db";
import { PaymentMethod, Payments } from "./payments";
import { SMTP } from "./smtp";
import { Traveler } from "./traveler";
import { Trip } from "./trip";

export class Bookings {
  private booking!: Booking;
  private trip!: Trip;
  private traveler!: Traveler;

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
    tripId: string,
    passengersCount: number,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number,
  ): Booking {
    if (travelerId && tripId) {
      this.create(travelerId, tripId, passengersCount, hasPremiumFoods, extraLuggageKilos);
      this.save();
      if (cardNumber && cardExpiry && cardCVC) {
        this.pay(cardNumber, cardExpiry, cardCVC);
      } else {
        this.booking.status = BookingStatus.ERROR;
      }
      return this.booking;
    } else {
      throw new Error("Invalid parameters");
    }
  }

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

  private getValidatedPassengersCount(travelerId: string, passengersCount: number) {
    const maxPassengersCount = 6;
    if (passengersCount > maxPassengersCount) {
      throw new Error(`Nobody can't have more than ${maxPassengersCount} passengers`);
    }
    const maxNonVipPassengersCount = 4;
    if (this.isNonVip(travelerId) && passengersCount > maxNonVipPassengersCount) {
      throw new Error(`No VIPs cant't have more than ${maxNonVipPassengersCount} passengers`);
    }
    if (passengersCount <= 0) {
      passengersCount = 1;
    }
    return passengersCount;
  }

  private isNonVip(travelerId: string): boolean {
    this.traveler = DB.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
    return this.traveler.isVip;
  }

  private checkAvailability(tripId: string, passengersCount: number) {
    this.trip = DB.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    const hasAvailableSeats = this.trip.availablePlaces >= passengersCount;
    if (!hasAvailableSeats) {
      throw new Error("There are no seats available in the trip");
    }
  }

  private save() {
    this.booking.id = DB.insert<Booking>(this.booking);
  }

  private pay(cardNumber: string, cardExpiry: string, cardCVC: string) {
    this.booking.price = this.calculatePrice();
    const payments = new Payments();
    const paymentId = payments.payBooking(
      this.booking,
      PaymentMethod.CREDIT_CARD,
      cardNumber,
      cardExpiry,
      cardCVC,
      "",
      "",
      "",
    );
    if (paymentId != "") {
      this.booking.paymentId = "payment fake identification";
      this.booking.status = BookingStatus.PAID;
    } else {
      this.booking.status = BookingStatus.ERROR;
      const smtp = new SMTP();
      smtp.sendMail(
        "payments@astrobookings.com",
        this.traveler.email,
        "Payment error",
        `Using card ${cardNumber} amounting to ${this.booking.price}`,
      );
    }
    DB.update(this.booking);
  }

  private calculatePrice(): number {
    const millisecondsPerSecond = 1000;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;

    const millisecondsPerDay = millisecondsPerSecond * secondsPerMinute * minutesPerHour * hoursPerDay;
    const stayingNights = Math.round(this.trip.endDate.getTime() - this.trip.startDate.getTime() / millisecondsPerDay);
    // Calculate staying price
    const stayingPrice = stayingNights * this.trip.stayingNightPrice;
    // Calculate flight price
    const flightPrice = this.trip.flightPrice + (this.booking.hasPremiumFoods ? this.trip.premiumFoodPrice : 0);
    const passengerPrice = flightPrice + stayingPrice;
    const passengersPrice = passengerPrice * this.booking.passengersCount;
    // Calculate extra price once for all passengers of the booking
    const extraTripPrice = this.booking.extraLuggageKilos * this.trip.extraLuggagePricePerKilo;
    return passengersPrice + extraTripPrice;
  }
}
