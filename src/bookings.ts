import { Booking, BookingStatus } from "./booking";
import { BookingsRequestDTO } from "./bookingsRequestDTO";
import { BookingsRequestVO } from "./bookingsRequestVO";
import { CreditCardVO } from "./creditCardVO";
import { DateRangeVO } from "./dateRangeVO";
import { DB } from "./db";
import { Notifications } from "./notifications";
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
   * @param bookingsRequestDTO - the booking request
   * @returns {Booking} the new booking object
   * @throws {Error} if the booking is not possible
   */
  public request(bookingsRequestDTO: BookingsRequestDTO): Booking {
    // 🧼 Data transfer object to avoid multiple parameters on methods signatures
    // TO Do: booking request object value validation
    const bookingsRequest = new BookingsRequestVO(bookingsRequestDTO);
    this.create(bookingsRequest);
    this.save();
    this.pay(bookingsRequest);
    this.notify();
    return this.booking;
  }
  notify() {
    if (this.booking.id === undefined) {
      return;
    }
    const notifications = new Notifications();
    return notifications.notifyBookingConfirmation({
      recipient: this.traveler.email,
      tripDestination: this.trip.destination,
      bookingId: this.booking.id,
    });
  }

  private pay(bookingsRequest: BookingsRequestVO) {
    try {
      this.payWithCreditCard(bookingsRequest.card);
    } catch (error) {
      this.booking.status = BookingStatus.ERROR;
      DB.update(this.booking);
      throw error;
    }
  }

  private create(bookingsRequest: BookingsRequestVO): void {
    bookingsRequest.passengersCount = this.getValidatedPassengersCount(bookingsRequest);
    this.checkAvailability(bookingsRequest);
    this.booking = new Booking(bookingsRequest.tripId, bookingsRequest.travelerId, bookingsRequest.passengersCount);
    this.booking.hasPremiumFoods = bookingsRequest.hasPremiumFoods;
    this.booking.extraLuggageKilos = bookingsRequest.extraLuggageKilos;
  }

  private getValidatedPassengersCount(bookingsRequest: BookingsRequestVO) {
    this.assertPassengers(bookingsRequest);

    return bookingsRequest.passengersCount;
  }

  private assertPassengers(bookingsRequest: BookingsRequestVO) {
    this.assertPassengersForVip(bookingsRequest);
    this.assertPassengersForNonVip(bookingsRequest);
  }

  private assertPassengersForVip(bookingsRequest: BookingsRequestVO) {
    const maxPassengersCount = 6;
    if (bookingsRequest.passengersCount > maxPassengersCount) {
      throw new Error(`Nobody can't have more than ${maxPassengersCount} passengers`);
    }
  }
  private assertPassengersForNonVip(bookingsRequest: BookingsRequestVO) {
    const maxNonVipPassengersCount = 4;
    const isTooMuchForNonVip = bookingsRequest.passengersCount > maxNonVipPassengersCount;
    if (this.isNonVip(bookingsRequest.travelerId) && isTooMuchForNonVip) {
      throw new Error(`Nobody can't have more than ${maxNonVipPassengersCount} passengers`);
    }
  }

  private isNonVip(travelerId: string): boolean {
    this.traveler = DB.selectOne<Traveler>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
    return this.traveler.isVip;
  }

  private checkAvailability(bookingsRequest: BookingsRequestVO) {
    this.trip = DB.selectOne<Trip>(`SELECT * FROM trips WHERE id = '${bookingsRequest.tripId}'`);
    const hasAvailableSeats = this.trip.availablePlaces >= bookingsRequest.passengersCount;
    if (!hasAvailableSeats) {
      throw new Error("There are no seats available in the trip");
    }
  }

  private save() {
    this.booking.id = DB.insert<Booking>(this.booking);
  }

  private payWithCreditCard(creditCard: CreditCardVO) {
    this.booking.price = this.calculatePrice();
    const paymentId = this.payPriceWithCard(creditCard);
    if (paymentId != "") {
      this.setPaymentStatus();
    } else {
      this.processNonPayedBooking(creditCard.number);
    }
    DB.update(this.booking);
  }

  private payPriceWithCard(creditCard: CreditCardVO) {
    const payments = new Payments(this.booking);
    const paymentId = payments.payBooking({
      method: PaymentMethod.CREDIT_CARD,
      creditCard,
      payMe: undefined,
      transferAccount: "",
    });
    return paymentId;
  }

  private processNonPayedBooking(cardNumber: string) {
    this.booking.status = BookingStatus.ERROR;
    const smtp = new SMTP();
    smtp.sendMail({
      from: "payments@astrobookings.com",
      to: this.traveler.email,
      subject: "Payment error",
      body: `Using card ${cardNumber} amounting to ${this.booking.price}`,
    });
  }

  private setPaymentStatus() {
    this.booking.paymentId = "payment fake identification";
    this.booking.status = BookingStatus.PAID;
  }

  private calculatePrice(): number {
    const stayingNights = new DateRangeVO(this.trip.startDate, this.trip.endDate).toWholeDays;
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
}
