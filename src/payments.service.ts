/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable max-lines-per-function */
import { Booking } from "./booking";
import { HttpService } from "./http.service";
import { NotificationsService } from "./notifications.service";

export enum PaymentMethod {
  CREDIT_CARD,
  PAY_ME,
  TRANSFER,
}

export class PaymentsService {
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
        const response = HttpService.request(url, {
          method: "POST",
          body: { amount: booking.price, concept: booking.id },
        });
        if (response.status === 200) {
          return response.body ? (response.body.transactionID as string) : "";
        } else {
          return "";
        }
      }
      case PaymentMethod.PAY_ME: {
        const url = `${this.payMeAPIUrl}`;
        const response = HttpService.request(url, {
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
        if (booking.id === null || booking.id === undefined) {
          throw new Error("Booking id is null or undefined");
        }
        const notifications = new NotificationsService();
        return notifications.notifyBankTransfer(this.bankEmail, booking.id, booking.price, transferAccount);
      }
      default:
        throw new Error(`Unknown payment method: ${method}`);
    }
  }
}
