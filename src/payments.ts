/* eslint-disable max-lines-per-function */
import { Booking } from "./booking";
import { HTTP } from "./http";
import { Notifications } from "./notifications";

export enum PaymentMethod {
  CREDIT_CARD,
  PAY_ME,
  TRANSFER,
}

export class Payments {
  private cardWayAPIUrl = "https://card-way.com/";
  private payMeAPIUrl = "https://pay-me.com/v1/payments";
  private bankEmail = "humanprocessor@bancka.com";

  // To Do: 🚧 clean pending...
  public payBooking(
    booking: Booking,
    method: PaymentMethod,
    cardNumber: string,
    cardExpiry: string,
    cardCVC: string,
    payMeAccount: string,
    payMeCode: string,
    transferAccount: string,
  ): string {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
        return this.payWithCard(booking, cardNumber, cardExpiry, cardCVC);
      case PaymentMethod.PAY_ME:
        return this.payWithPayMe(booking, payMeAccount, payMeCode);
      case PaymentMethod.TRANSFER:
        return this.payWithBank(booking, transferAccount);
      default:
        throw new Error(`Unknown payment method: ${method}`);
    }
  }
  private payWithCard(booking: Booking, cardNumber: string, cardExpiry: string, cardCVC: string) {
    const url = `${this.cardWayAPIUrl}payments/card${cardNumber}/${cardExpiry}/${cardCVC}`;
    const response = HTTP.request(url, { method: "POST", body: { amount: booking.price, concept: booking.id } });
    if (response.status === 200) {
      return response.body ? (response.body.transactionID as string) : "";
    } else {
      return "";
    }
  }
  private payWithPayMe(booking: Booking, payMeAccount: string, payMeCode: string) {
    const url = `${this.payMeAPIUrl}`;
    const response = HTTP.request(url, {
      method: "POST",
      body: { payMeAccount, payMeCode, amount: booking.price, identification: booking.id },
    });
    if (response.status === 201) {
      return response.body ? (response.body.pay_me_code as string) : "";
    } else {
      return "";
    }
  }
  private payWithBank(booking: Booking, transferAccount: string) {
    if (booking.id === null || booking.id === undefined) {
      throw new Error("Booking id is null or undefined");
    }
    const notifications = new Notifications();
    return notifications.notifyBankTransfer(this.bankEmail, booking.id, booking.price, transferAccount);
  }
}
