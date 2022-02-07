import { DB } from "./bd";
import { Booking, BookingStatus } from "./booking";
import { Notifications } from "./notifications";
import { Operators } from "./operators";
import { Payment, PaymentStatus } from "./payment";
import { Payments } from "./payments";
import { Traveler } from "./traveler";
import { Trip } from "./trip";

export class Bookings {
  private operators: Operators;
  private booking: Booking;
  private trip: Trip;
  private traveler: Traveler;
  private notifications: Notifications;

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
   * */
  public request(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number
  ): Booking {
    this.create(travelerId, tripId, passengersCount, hasPremiumFoods, extraLuggageKilos);
    this.saveBooking();
    const payment = this.pay(cardNumber, cardExpiry, cardCVC);
    this.reserve();
    this.notify(payment);
    return this.booking;
  }
  private create(
    travelerId: string,
    tripId: string,
    passengersCount: number,
    hasPremiumFoods: boolean,
    extraLuggageKilos: number
  ) {
    passengersCount = this.validatePassengersCount(travelerId, passengersCount);
    this.checkAvailability(tripId, passengersCount);
    this.booking = new Booking(tripId, travelerId, passengersCount);
    this.booking.hasPremiumFoods = hasPremiumFoods;
    this.booking.extraLuggageKilos = extraLuggageKilos;
  }
  private validatePassengersCount(travelerId: string, passengersCount: number) {
    const maxPassengersPerVIPBooking = 6;
    if (passengersCount > maxPassengersPerVIPBooking) {
      throw new Error("VIPs can't have more than 6 passengers");
    }
    this.traveler = DB.select<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
    const maxPassengersPerBooking = 4;
    if (this.traveler.isVIP === false && passengersCount > maxPassengersPerBooking) {
      throw new Error("Normal travelers can't have more than 4 passengers");
    }
    if (passengersCount <= 0) {
      passengersCount = 1;
    }
    return passengersCount;
  }
  private checkAvailability(tripId: string, passengersCount: number) {
    this.trip = DB.select<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
    this.operators = new Operators(this.trip.operatorId);
    const isAvailable = this.operators.verifyAvailability(this.trip, passengersCount);
    if (!isAvailable) {
      throw new Error("The trip is not available");
    }
  }
  private saveBooking() {
    this.booking.id = DB.insert<Booking>(this.booking);
  }
  private pay(cardNumber: string, cardExpiry: string, cardCVC: string): Payment {
    this.booking.price = this.calculatePrice();
    // 🚨 🤔 🤢
    // ! 1.3.5
    // ! Tell don't ask
    // 🚨 🤔 🤢
    const payments = new Payments();
    const payment = payments.createPayment(
      "credit-card",
      cardNumber,
      cardExpiry,
      cardCVC,
      this.booking.price,
      JSON.stringify(this.booking)
    );
    if (!payment) {
      throw new Error("Create Payment failed");
    }
    const response = payments.payBooking(payment);
    // 🚨 🤔 🤢
    // ! 1.3.6
    // ! Demeter Law
    // 🚨 🤔 🤢
    payment.status = response.status === 200 ? PaymentStatus.PROCESSED : PaymentStatus.REFUSED;
    payment.gatewayCode = response.body["data"]["transaction_number"];
    payments.savePayment(payment);
    if (payment.status === PaymentStatus.REFUSED) {
      throw new Error("The payment was refused");
    }
    this.booking.paymentId = payment.id;
    this.booking.status = BookingStatus.PAID;
    DB.update(this.booking);
    return payment;
  }
  private calculatePrice(): number {
    // eslint-disable-next-line no-magic-numbers
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    // 🚨 🤔 🤢
    // ! 1.3.4
    // ! Primitive obsession
    // 🚨 🤔 🤢
    const stayingMilliseconds = this.trip.endDate.getTime() - this.trip.startDate.getTime();
    const stayingNights = Math.round(stayingMilliseconds / millisecondsPerDay);
    const stayingPrice = stayingNights * this.trip.stayingNightPrice;
    const flightPrice = this.trip.flightPrice + (this.booking.hasPremiumFoods ? this.trip.premiumFoodPrice : 0);
    const pricePerPassenger = flightPrice + stayingPrice;
    const passengersPrice = pricePerPassenger * this.booking.passengersCount;
    const extraLuggageKilosPrice = this.booking.extraLuggageKilos * this.trip.extraLuggagePricePerKilo;
    const totalPrice = passengersPrice + extraLuggageKilosPrice;
    return totalPrice;
  }
  private reserve() {
    this.booking.operatorReserveCode = this.operators.reserveBooking(this.booking, this.trip);
    this.booking.status = BookingStatus.RESERVED;
    DB.update(this.booking);
  }
  private notify(payment: Payment) {
    this.notifications = new Notifications(this.traveler, this.booking, payment);
    this.notifications.send();
    switch (this.booking.status) {
      case BookingStatus.RESERVED:
        this.booking.status = BookingStatus.BOOKING_NOTIFIED;
        break;
      case BookingStatus.RELEASED:
        this.booking.status = BookingStatus.ANNULATION_NOTIFIED;
        break;
      case BookingStatus.CANCELLED:
        this.booking.status = BookingStatus.CANCELLATION_NOTIFIED;
        break;
    }
    DB.update(this.booking);
  }
}
