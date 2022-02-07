import { Booking, BookingStatus } from "./booking";
import { Emails } from "./emails";
import { HTTP } from "./http";
import { Payment } from "./payment";
import { SMTP } from "./smtp";
import { Traveler } from "./traveler";
export class Notifications {
  private config = "http";
  private emailUrl = "https://mailmonk.com/v1/send";
  private smtpServer = "smtp.astrobookings.com";
  private smtpPort = 25;
  private smtpUser = "Traveler assistant";
  private smtpPassword = "astrobookings";
  private emails: Emails;

  public smtpSender = new SMTP(this.smtpServer, this.smtpPort, this.smtpUser, this.smtpPassword);

  constructor(private traveler: Traveler, private booking: Booking, private payment: Payment) {
    this.emails = new Emails(traveler, booking, payment);
  }

  public send(): void {
    const body = this.buildBody();
    let subject = "";
    switch (this.booking.status) {
      case BookingStatus.RESERVED:
        subject = `Booking ${this.booking.id} reserved for ${this.booking.passengersCount} passengers`;
        break;
      case BookingStatus.RELEASED:
        subject = `Booking ${this.booking.id} released for ${this.booking.passengersCount} passengers`;
        break;
      case BookingStatus.CANCELLED:
        subject = `Trip corresponding to booking ${this.booking.id} was cancelled `;
        break;
    }
    if (this.config === "http") {
      this.sendEmailByHttp(this.traveler.email, subject, body);
    } else {
      this.sendEmailBySmtp(this.traveler.email, subject, body);
    }
  }

  private buildBody() {
    // 🚨 🤔 🤢
    // ! 1.3.2
    // ! Feature envy
    // 🚨 🤔 🤢
    // 🚨 🤔 🤢
    // ! 1.3.3
    // ! Inappropriate intimacy
    // 🚨 🤔 🤢
    return this.emails.getSalutation() + this.emails.getMainBody() + this.emails.getSignature();
  }

  private sendEmailByHttp(recipient: string, subject: string, body: string): unknown {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        recipient,
        subject,
        body,
      },
    };

    return HTTP.request(this.emailUrl, options);
  }
  private sendEmailBySmtp(recipient: string, subject: string, body: string): unknown {
    return this.smtpSender.sendMail(`"AstroBookings" <${this.smtpUser}>`, recipient, subject, body);
  }
}
