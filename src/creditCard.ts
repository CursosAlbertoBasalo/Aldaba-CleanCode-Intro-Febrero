export class CreditCard {
  constructor(public readonly number: string, public readonly expiration: string, public readonly cvv: string) {
    this.assertValidCard();
  }

  public toHumanReadable(): string {
    return `${this.number} expires on ${this.expiration}`;
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
