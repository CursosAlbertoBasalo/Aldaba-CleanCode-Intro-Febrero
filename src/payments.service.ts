/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable max-lines-per-function */
import { Booking } from "./booking";
import { HttpService } from "./http.service";
import { SmtpService } from "./smtp.service";
export class PaymentsService {
  private cardWayAPIUrl = "https://card-way.com/";
  private payMeAPIUrl = "https://pay-me.com/v1/payments";
  private bankEmail = "humanprocessor@bancka.com";

  // 🧼 🚿 remove switch and enum flag, using specific functions instead

  public payWithCard(booking: Booking, cardNumber: string, cardExpiry: string, cardCVC: string) {
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

  public payWithPayMe(booking: Booking, payMeAccount: string, payMeCode: string) {
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

  public payWithBank(booking: Booking, transferAccount: string) {
    const smtp = new SmtpService();
    const subject = `Payment request for Booking ${booking.id}`;
    const body = `Please transfer ${booking.price} to ${transferAccount}`;
    smtp.sendMail("payments@astrobookings.com", this.bankEmail, subject, body);
    return "";
  }
}
