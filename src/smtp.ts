export class SMTP {
  private smtp: { host: string; port: number; user: string; pass: string };

  constructor(host: string, port: number, user: string, pass: string) {
    this.smtp = {
      host,
      port,
      user,
      pass,
    };
  }
  public sendMail(from: string, to: string, subject: string, body: string): string {
    console.log(this.smtp);
    console.log(from, to, subject, body);
    return "250 OK";
  }
}
