import { Booking } from "./booking";
import { BookingPayment } from "./bookingPayment";
import { CreditCard } from "./creditCard";
import { HTTP } from "./http";
import { Notifications } from "./notifications";
import { PayMe } from "./payMe";
export enum PaymentMethod {
  CREDIT_CARD,
  PAY_ME,
  TRANSFER,
}
export class Payments {
  private cardWayAPIUrl = "https://card-way.com/";
  private payMeAPIUrl = "https://pay-me.com/v1/payments";
  private bankEmail = "humanprocessor@bancka.com";

  private readonly responseOk = 200;

  private readonly responseAccepted = 201;

  constructor(private booking: Booking) {}

  public payBooking(bookingPayment: BookingPayment): string {
    switch (bookingPayment.method) {
      case PaymentMethod.CREDIT_CARD:
        return this.payWithCard(bookingPayment.creditCard);
      case PaymentMethod.PAY_ME:
        return this.payWithPayMe(bookingPayment.payMe);
      case PaymentMethod.TRANSFER:
        return this.payWithBank(bookingPayment.transferAccount);
      default:
        throw new Error(`Unknown payment method: ${bookingPayment.method}`);
    }
  }
  private payWithCard(creditCard?: CreditCard) {
    if (creditCard === undefined) {
      throw new Error("Missing credit card");
    }
    const url = `${this.cardWayAPIUrl}payments/card${creditCard.number}/${creditCard.expiration}/${creditCard.cvv}`;
    const response = HTTP.request({
      url,
      options: { method: "POST", body: { amount: this.booking.price, concept: this.booking.id } },
    });
    if (response.status === this.responseOk) {
      return response.body ? (response.body.transactionID as string) : "";
    } else {
      return "";
    }
  }
  private payWithPayMe(payMe?: PayMe) {
    if (payMe === undefined) {
      throw new Error("PayMe is undefined");
    }
    const url = `${this.payMeAPIUrl}`;
    const response = HTTP.request({
      url,
      options: this.buildOptions(payMe),
    });
    if (response.status === this.responseAccepted) {
      return response.body ? (response.body.pay_me_code as string) : "";
    } else {
      return "";
    }
  }
  private buildOptions(payMe: PayMe): unknown {
    return {
      method: "POST",
      body: {
        payMeAccount: payMe.account,
        payMeCode: payMe.code,
        amount: this.booking.price,
        identification: this.booking.id,
      },
    };
  }

  private payWithBank(transferAccount?: string) {
    if (transferAccount === undefined) {
      throw new Error("Missing transfer account");
    }
    if (this.booking.id === null || this.booking.id === undefined) {
      throw new Error("Booking id is null or undefined");
    }
    const notifications = new Notifications();
    return notifications.notifyBankTransfer({
      recipient: this.bankEmail,
      bookingId: this.booking.id,
      amount: this.booking.price,
      transferAccount: transferAccount,
    });
  }
}
