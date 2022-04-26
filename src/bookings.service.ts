import { Booking, BookingStatus } from "./booking";
import { DataBase } from "./data_base";
import { NotificationsService } from "./notifications.service";
import { PaymentMethod, PaymentsService } from "./payments.service";
import { SmtpService } from "./smtp.service";
import { Traveler } from "./traveler";
import { Trip } from "./trip";

export class BookingsService {
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
    if (this.hasEntitiesId(travelerId, tripId) === false) {
      throw new Error("Invalid parameters");
    }
    this.create(travelerId, tripId, passengersCount, hasPremiumFoods, extraLuggageKilos);
    this.booking.id = this.save();
    this.pay(cardNumber, cardExpiry, cardCVC);
    this.notify();
    return this.booking;
  }

  private notify() {
    if (this.booking.id === undefined) {
      return;
    }
    const notifications = new NotificationsService();
    return notifications.notifyBookingConfirmation(this.traveler.email, this.trip.destination, this.booking.id);
  }

  private pay(cardNumber: string, cardExpiry: string, cardCVC: string) {
    if (this.hasCreditCard(cardNumber, cardExpiry, cardCVC)) {
      this.payWithCreditCard(cardNumber, cardExpiry, cardCVC);
    } else {
      this.booking.status = BookingStatus.ERROR;
    }
  }

  private hasEntitiesId(travelerId: string, tripId: string): boolean {
    return travelerId !== "" && tripId !== "";
  }

  private hasCreditCard(cardNumber: string, cardExpiry: string, cardCVC: string): boolean {
    return cardNumber !== "" && cardExpiry !== "" && cardCVC !== "";
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
    if (this.hasTooManyPassengersForNonVip(travelerId, passengersCount, maxNonVipPassengersCount)) {
      throw new Error(`No VIPs cant't have more than ${maxNonVipPassengersCount} passengers`);
    }
    if (passengersCount <= 0) {
      passengersCount = 1;
    }
    return passengersCount;
  }

  private hasTooManyPassengersForNonVip(travelerId: string, passengersCount: number, maxNonVipPassengersCount: number) {
    const isTooMuchForNonVip = passengersCount > maxNonVipPassengersCount;
    const isNonVip = this.isNonVip(travelerId);
    return isNonVip && isTooMuchForNonVip;
  }

  private isNonVip(travelerId: string): boolean {
    this.traveler = this.selectTraveler(travelerId);
    return this.traveler.isVip == false;
  }

  private checkAvailability(tripId: string, passengersCount: number) {
    this.trip = this.selectTrip(tripId);
    const hasNoAvailableSeats = this.trip.availablePlaces < passengersCount;
    if (hasNoAvailableSeats) {
      throw new Error("There are no seats available in the trip");
    }
  }

  private selectTrip(tripId: string) {
    return DataBase.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${tripId}'`);
  }

  private selectTraveler(travelerId: string) {
    return DataBase.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
  }

  private save() {
    return DataBase.insert<Booking>(this.booking);
  }

  private update() {
    DataBase.update(this.booking);
  }

  private payWithCreditCard(cardNumber: string, cardExpiry: string, cardCVC: string) {
    this.booking.price = this.calculatePrice();
    const paymentId = this.payPriceWithCard(cardNumber, cardExpiry, cardCVC);
    if (paymentId != "") {
      this.setPaymentStatus();
    } else {
      this.processNonPayedBooking(cardNumber);
    }
    this.update();
  }

  private payPriceWithCard(cardNumber: string, cardExpiry: string, cardCVC: string) {
    const paymentsService = new PaymentsService();
    const paymentId = paymentsService.payBooking(
      this.booking,
      PaymentMethod.CREDIT_CARD,
      cardNumber,
      cardExpiry,
      cardCVC,
      "",
      "",
      "",
    );

    return paymentId;
  }

  private processNonPayedBooking(cardNumber: string) {
    this.booking.status = BookingStatus.ERROR;
    this.sendPaymentErrorEmail(cardNumber);
  }

  private sendPaymentErrorEmail(cardNumber: string) {
    const smtp = new SmtpService();
    smtp.sendMail(
      "payments@astrobookings.com",
      this.traveler.email,
      "Payment error",
      `Using card ${cardNumber} amounting to ${this.booking.price}`,
    );
  }

  private setPaymentStatus() {
    this.booking.paymentId = "payment fake identification";
    this.booking.status = BookingStatus.PAID;
  }

  private calculatePrice(): number {
    const millisecondsPerDay = this.calculateMillisecondsPerDay();
    const stayingNights = this.calculateStayingNights(millisecondsPerDay);
    const passengerPrice = this.calculatePassengerPrice(stayingNights);
    const passengersPrice = passengerPrice * this.booking.passengersCount;
    const extraTripPrice = this.calculateExtraPricePerTrip();

    return passengersPrice + extraTripPrice;
  }

  private calculateExtraPricePerTrip() {
    return this.booking.extraLuggageKilos * this.trip.extraLuggagePricePerKilo;
  }

  private calculatePassengerPrice(stayingNights: number) {
    const stayingPrice = stayingNights * this.trip.stayingNightPrice;
    const premiumFoodsPrice = this.booking.hasPremiumFoods ? this.trip.premiumFoodPrice : 0;
    const flightPrice = this.trip.flightPrice + premiumFoodsPrice;
    const passengerPrice = flightPrice + stayingPrice;

    return passengerPrice;
  }

  private calculateStayingNights(millisecondsPerDay: number) {
    const millisecondsTripDuration = this.trip.endDate.getTime() - this.trip.startDate.getTime();
    const rawStayingNights = millisecondsTripDuration / millisecondsPerDay;
    const stayingNights = Math.round(rawStayingNights);

    return stayingNights;
  }

  private calculateMillisecondsPerDay() {
    const millisecondsPerSecond = 1000;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;

    const millisecondsPerMinute = millisecondsPerSecond * secondsPerMinute;
    const millisecondsPerHour = millisecondsPerMinute * minutesPerHour;
    const millisecondsPerDay = millisecondsPerHour * hoursPerDay;

    return millisecondsPerDay;
  }
}
