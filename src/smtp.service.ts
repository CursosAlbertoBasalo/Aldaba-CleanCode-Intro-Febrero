import { Email } from "./email";

export class SmtpService {
  private smtpServer = "smtp.astrobookings.com";
  private smtpPort = 25;
  private smtpSecurePort = 587;
  private smtpUser = "Traveler assistant";
  private smtpPassword = "astrobookings";
  private email!: Email;

  public sendMail(email: Email): string {
    this.email = email;
    const isAFakeCondition = true;
    if (isAFakeCondition) {
      return this.sendMailWithSMTP();
    } else {
      return this.sendMailWithSecureSMTP();
    }
  }

  private sendMailWithSMTP(): string {
    console.log(
      `Sending mail from ${this.email.from} to ${this.email.to} with subject ${this.email.subject} and body ${this.email.body}`,
    );

    console.log(`Using ${this.smtpServer} port ${this.smtpPort}`);
    return "250 OK";
  }
  private sendMailWithSecureSMTP(): string {
    console.log(
      `Sending mail from ${this.email.from} to ${this.email.to} with subject ${this.email.subject} and body ${this.email.body}`,
    );
    console.log(
      `Using ${this.smtpServer} port ${this.smtpSecurePort} user ${this.smtpUser} password ${this.smtpPassword}`,
    );
    return "250 OK";
  }
}
