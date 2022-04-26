/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable max-lines-per-function */
import { BookingDto } from "./booking.dto";
import { CreditCardVo } from "./credit_card.vo";
import { HttpService } from "./http.service";
import { PayMeDto } from "./pay_me.dto";
import { SmtpService } from "./smtp.service";
export class PaymentsService {
  private cardWayAPIUrl = "https://card-way.com/";
  private payMeAPIUrl = "https://pay-me.com/v1/payments";
  private bankEmail = "humanprocessor@bancka.com";

  // 🧼 🚿 Constructor with common data
  constructor(private booking: BookingDto) {}

  // 🧼 🚿 Value object to avoid multiple parameters on methods signatures AND ensure valid data
  public payWithCard(creditCard: CreditCardVo) {
    const url = `${this.cardWayAPIUrl}payments/card${creditCard.number}/${creditCard.expiration}/${creditCard.cvv}`;
    const response = HttpService.request({
      url,
      options: { method: "POST", body: { amount: this.booking.price, concept: this.booking.id } },
    });
    if (response.status === 200) {
      return response.body ? (response.body.transactionID as string) : "";
    } else {
      return "";
    }
  }

  // 🧼 🚿 Data transfer object to avoid multiple parameters on methods signatures
  public payWithPayMe(payMe: PayMeDto) {
    const url = `${this.payMeAPIUrl}`;
    const response = HttpService.request({
      url,
      options: {
        method: "POST",
        body: {
          payMeAccount: payMe.account,
          payMeCode: payMe.code,
          amount: this.booking.price,
          identification: this.booking.id,
        },
      },
    });
    if (response.status === 201) {
      return response.body ? (response.body.pay_me_code as string) : "";
    } else {
      return "";
    }
  }

  // ToDo: create a Value Object for ensuring correct account name
  public payWithBank(transferAccount: string) {
    const smtp = new SmtpService();
    const subject = `Payment request for Booking ${this.booking.id}`;
    const body = `Please transfer ${this.booking.price} to ${transferAccount}`;
    const email = { from: "payments@astrobookings.com", to: this.bankEmail, subject, body };
    smtp.sendMail(email);
    return "";
  }
}
