import { BookingDto } from "./booking.dto";
import { BookingsRequestDto } from "./bookings_request.dto";
import { BookingsRequestVo } from "./bookings_request.vo";
import { BookingStatus } from "./booking_status.enum";
import { CreditCardVo } from "./credit_card.vo";
import { DataBase } from "./data_base";
import { DateRangeVo } from "./date_range.vo";
import { NotificationsService } from "./notifications.service";
import { PaymentsService } from "./payments.service";
import { SmtpService } from "./smtp.service";
import { TravelerDto } from "./traveler.dto";
import { TripDto } from "./trip.dto";

export class BookingsService {
  private booking!: BookingDto;
  private trip!: TripDto;
  private traveler!: TravelerDto;
  private bookingsRequest!: BookingsRequestVo;

  /**
   * Requests a new booking
   * @param bookingsRequestDTO - the booking request
   * @returns {BookingDto} the new booking object
   * @throws {Error} if the booking is not possible
   */
  public request(bookingsRequestDTO: BookingsRequestDto): BookingDto {
    // 🧼 🚿 Data transfer object to avoid multiple parameters on methods signatures
    // 🧼 🚿 Saved as a property on the class to reduce method parameters
    this.bookingsRequest = new BookingsRequestVo(bookingsRequestDTO);
    this.create();
    this.save();
    this.pay();
    this.notify();
    return this.booking;
  }
  notify() {
    if (this.booking.id === undefined) {
      return;
    }
    const notifications = new NotificationsService();
    return notifications.notifyBookingConfirmation({
      recipient: this.traveler.email,
      tripDestination: this.trip.destination,
      bookingId: this.booking.id,
    });
  }

  private pay() {
    try {
      this.payWithCreditCard(this.bookingsRequest.card);
    } catch (error) {
      this.booking.status = BookingStatus.ERROR;
      DataBase.update(this.booking);
      throw error;
    }
  }

  private create(): void {
    this.bookingsRequest.passengersCount = this.getValidatedPassengersCount();
    this.checkAvailability();
    this.booking = new BookingDto(
      this.bookingsRequest.tripId,
      this.bookingsRequest.travelerId,
      this.bookingsRequest.passengersCount,
    );
    this.booking.hasPremiumFoods = this.bookingsRequest.hasPremiumFoods;
    this.booking.extraLuggageKilos = this.bookingsRequest.extraLuggageKilos;
  }

  private getValidatedPassengersCount() {
    this.assertPassengers();

    return this.bookingsRequest.passengersCount;
  }

  private assertPassengers() {
    this.assertPassengersForVip();
    this.assertPassengersForNonVip();
  }

  private assertPassengersForVip() {
    const maxPassengersCount = 6;
    if (this.bookingsRequest.passengersCount > maxPassengersCount) {
      throw new Error(`Nobody can't have more than ${maxPassengersCount} passengers`);
    }
  }
  private assertPassengersForNonVip() {
    const maxNonVipPassengersCount = 4;
    const isTooMuchForNonVip = this.bookingsRequest.passengersCount > maxNonVipPassengersCount;
    if (this.isNonVip(this.bookingsRequest.travelerId) && isTooMuchForNonVip) {
      throw new Error(`Nobody can't have more than ${maxNonVipPassengersCount} passengers`);
    }
  }

  private isNonVip(travelerId: string): boolean {
    this.traveler = DataBase.selectOne<TravelerDto>(`SELECT * FROM travelers WHERE id = '${travelerId}'`);
    return this.traveler.isVip;
  }

  private checkAvailability() {
    this.trip = DataBase.selectOne<TripDto>(`SELECT * FROM trips WHERE id = '${this.bookingsRequest.tripId}'`);
    const hasAvailableSeats = this.trip.availablePlaces >= this.bookingsRequest.passengersCount;
    if (!hasAvailableSeats) {
      throw new Error("There are no seats available in the trip");
    }
  }

  private save() {
    this.booking.id = DataBase.insert<BookingDto>(this.booking);
  }

  private payWithCreditCard(creditCard: CreditCardVo) {
    this.booking.price = this.calculatePrice();
    const paymentId = this.payPriceWithCard(creditCard);
    if (paymentId != "") {
      this.setPaymentStatus();
    } else {
      this.processNonPayedBooking(creditCard.number);
    }
    DataBase.update(this.booking);
  }

  private payPriceWithCard(creditCard: CreditCardVo) {
    const payments = new PaymentsService(this.booking);
    const paymentId = payments.payWithCard(creditCard);
    return paymentId;
  }

  private processNonPayedBooking(cardNumber: string) {
    this.booking.status = BookingStatus.ERROR;
    const smtp = new SmtpService();
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
    const stayingNights = new DateRangeVo(this.trip.startDate, this.trip.endDate).toWholeDays;
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
