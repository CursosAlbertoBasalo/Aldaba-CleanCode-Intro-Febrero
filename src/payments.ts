/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable max-lines-per-function */
import { Booking } from "./booking";
import { Http } from "./http";
import { Smtp } from "./smtp";

export enum PaymentMethod {
  CREDIT_CARD,
  PAY_ME,
  TRANSFER,
}

export class Payments {
  private cardWayAPIUrl = "https://card-way.com/";
  private payMeAPIUrl = "https://pay-me.com/v1/payments";
  private bankEmail = "humanprocessor@bancka.com";

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
      case PaymentMethod.CREDIT_CARD: {
        const url = `${this.cardWayAPIUrl}payments/card${cardNumber}/${cardExpiry}/${cardCVC}`;
        const response = Http.request(url, { method: "POST", body: { amount: booking.price, concept: booking.id } });
        if (response.status === 200) {
          return response.body ? (response.body.transactionID as string) : "";
        } else {
          return "";
        }
      }
      case PaymentMethod.PAY_ME: {
        const url = `${this.payMeAPIUrl}`;
        const response = Http.request(url, {
          method: "POST",
          body: { payMeAccount, payMeCode, amount: booking.price, identification: booking.id },
        });
        if (response.status === 201) {
          return response.body ? (response.body.pay_me_code as string) : "";
        } else {
          return "";
        }
      }
      case PaymentMethod.TRANSFER: {
        const smtp = new Smtp();
        const subject = `Payment request for Booking ${booking.id}`;
        const body = `Please transfer ${booking.price} to ${transferAccount}`;
        smtp.sendMail("payments@astrobookings.com", this.bankEmail, subject, body);
        return "";
      }
      default:
        throw new Error(`Unknown payment method: ${method}`);
    }
  }
}
