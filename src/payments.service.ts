import { Booking } from "./booking";
import { BookingPaymentDto } from "./booking_payment.dto";
import { CreditCardVo } from "./credit_card.vo";
import { HttpService } from "./http.service";
import { NotificationsService } from "./notifications.service";
import { PaymentMethod } from "./payment_method.enum";
import { PayMeDto } from "./pay_me.dto";

export class PaymentsService {
  private cardWayAPIUrl = "https://card-way.com/";
  private payMeAPIUrl = "https://pay-me.com/v1/payments";
  private bankEmail = "humanprocessor@bancka.com";

  private readonly responseOk = 200;

  private readonly responseAccepted = 201;

  constructor(private booking: Booking) {}

  // ToDo: 🔥 remove switch flag, and call proper methods instead 🔥
  public payBooking(bookingPayment: BookingPaymentDto): string {
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
  public payWithCard(creditCard?: CreditCardVo) {
    if (creditCard === undefined) {
      throw new Error("Missing credit card");
    }
    const url = `${this.cardWayAPIUrl}payments/card${creditCard.number}/${creditCard.expiration}/${creditCard.cvv}`;
    const response = HttpService.request({
      url,
      options: { method: "POST", body: { amount: this.booking.price, concept: this.booking.id } },
    });
    if (response.status === this.responseOk) {
      return response.body ? (response.body.transactionID as string) : "";
    } else {
      return "";
    }
  }
  public payWithPayMe(payMe?: PayMeDto) {
    if (payMe === undefined) {
      throw new Error("PayMe is undefined");
    }
    const url = `${this.payMeAPIUrl}`;
    const response = HttpService.request({
      url,
      options: this.buildOptions(payMe),
    });
    if (response.status === this.responseAccepted) {
      return response.body ? (response.body.pay_me_code as string) : "";
    } else {
      return "";
    }
  }
  public buildOptions(payMe: PayMeDto): unknown {
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
    const notifications = new NotificationsService();
    return notifications.notifyBankTransfer({
      recipient: this.bankEmail,
      bookingId: this.booking.id,
      amount: this.booking.price,
      transferAccount: transferAccount,
    });
  }
}
