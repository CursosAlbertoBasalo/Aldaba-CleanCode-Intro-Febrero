import { BookingsRequestDto } from "./bookings_request.dto";
import { CreditCardVo } from "./credit_card.vo";

export class BookingsRequestVo {
  travelerId: string;
  tripId: string;
  passengersCount: number;
  card: CreditCardVo;
  hasPremiumFoods: boolean;
  extraLuggageKilos: number;

  constructor(bookingsRequestDTO: BookingsRequestDto) {
    if (this.hasEntitiesId(bookingsRequestDTO) === false) {
      throw new Error("Invalid parameters");
    }
    if (bookingsRequestDTO.passengersCount <= 0) {
      bookingsRequestDTO.passengersCount = 1;
    }
    this.travelerId = bookingsRequestDTO.travelerId;
    this.tripId = bookingsRequestDTO.tripId;
    this.passengersCount = bookingsRequestDTO.passengersCount;
    this.card = new CreditCardVo(
      bookingsRequestDTO.cardNumber,
      bookingsRequestDTO.cardExpiry,
      bookingsRequestDTO.cardCVC,
    );
    this.hasPremiumFoods = bookingsRequestDTO.hasPremiumFoods;
    this.extraLuggageKilos = bookingsRequestDTO.extraLuggageKilos;
  }

  private hasEntitiesId(bookingsRequestDTO: BookingsRequestDto): boolean {
    return bookingsRequestDTO.travelerId !== "" && bookingsRequestDTO.tripId !== "";
  }
}
