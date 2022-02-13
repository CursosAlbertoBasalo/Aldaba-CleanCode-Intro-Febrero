export class SMTP {
  private smtpServer = "smtp.astrobookings.com";
  private smtpPort = 25;
  private smtpSecurePort = 587;
  private smtpUser = "Traveler assistant";
  private smtpPassword = "astrobookings";
  private from!: string;
  private to!: string;
  private subject!: string;
  private body!: string;

  public sendMail(from: string, to: string, subject: string, body: string): string {
    this.from = from;
    this.to = to;
    this.subject = subject;
    this.body = body;
    const isAFakeCondition = true;
    if (isAFakeCondition) {
      return this.sendMailWithSMTP();
    } else {
      return this.sendMailWithSecureSMTP();
    }
  }

  private sendMailWithSMTP(): string {
    console.log(`Sending mail from ${this.from} to ${this.to} with subject ${this.subject} and body ${this.body}`);

    console.log(`Using ${this.smtpServer} port ${this.smtpPort}`);
    return "250 OK";
  }
  private sendMailWithSecureSMTP(): string {
    console.log(`Sending mail from ${this.from} to ${this.to} with subject ${this.subject} and body ${this.body}`);
    console.log(
      `Using ${this.smtpServer} port ${this.smtpSecurePort} user ${this.smtpUser} password ${this.smtpPassword}`,
    );
    return "250 OK";
  }
}
