export class SMTP {
  private smtpServer = "smtp.astrobookings.com";
  private smtpPort = 25;
  private smtpUser = "Traveler assistant";
  private smtpPassword = "astrobookings";

  public sendMail(from: string, to: string, subject: string, body: string): string {
    console.log(`Using ${this.smtpServer} port ${this.smtpPort} user ${this.smtpUser} password ${this.smtpPassword}`);
    console.log(`Sending mail from ${from} to ${to} with subject ${subject} and body ${body}`);
    return "250 OK";
  }
}
