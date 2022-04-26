// 🧼 🚿 Inmutable validated and formatted credit card info
export class CreditCardVo {
  public get toHumanReadable(): string {
    return `${this.number} expires on ${this.expiration}`;
  }

  constructor(public readonly number: string, public readonly expiration: string, public readonly cvv: string) {
    this.assertValidCard();
  }

  private assertValidCard() {
    if (this.isInValidCard()) {
      throw new Error("Invalid card");
    }
  }
  private isInValidCard(): boolean {
    return this.number === "" || this.expiration === "" || this.cvv === "";
  }
}
