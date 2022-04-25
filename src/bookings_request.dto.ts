// 🧼 Data transfer object to avoid primitive types in the code

export type BookingsRequestDto = {
  travelerId: string; // - the id of the traveler soliciting the booking
  tripId: string; // - the id of the trip to book
  passengersCount: number; // - the number of passengers to reserve
  cardNumber: string; // - the card number to pay with
  cardExpiry: string; // - the card expiry date
  cardCVC: string; // - the card CVC
  hasPremiumFoods: boolean; // - if the traveler has premium foods
  extraLuggageKilos: number; // - the number of extra luggage kilos
};
