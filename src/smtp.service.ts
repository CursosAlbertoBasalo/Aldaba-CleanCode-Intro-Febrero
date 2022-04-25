export class SmtpService {
  private smtpServer = "smtp.astrobookings.com";
  private smtpPort = 25;
  private smtpSecurePort = 587;
  private smtpResultOk = "250 OK";
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
    const needsSecureSmtp = true;
    if (needsSecureSmtp) {
      return this.sendMailWithSecureSmtp();
    } else {
      return this.sendMailWithSmtp();
    }
  }

  private sendMailWithSecureSmtp(): string {
    console.log(
      `Sending SECURED mail from ${this.from} to ${this.to} with subject ${this.subject} and body ${this.body}`,
    );
    console.log(
      `Using ${this.smtpServer} port ${this.smtpSecurePort} user ${this.smtpUser} password ${this.smtpPassword}`,
    );
    return this.smtpResultOk;
  }
  private sendMailWithSmtp(): string {
    console.log(`Sending mail from ${this.from} to ${this.to} with subject ${this.subject} and body ${this.body}`);
    console.log(`Using ${this.smtpServer} port ${this.smtpPort}`);
    return this.smtpResultOk;
  }
}
