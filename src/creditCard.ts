export class CreditCard {
  constructor(public readonly number: string, public readonly expiration: Date, public readonly cvv: number) {
    this.assertValidCard();
  }

  public toHumanReadable(): string {
    return `${this.number} expires on ${this.expiration.toDateString()}`;
  }

  private assertValidCard() {
    if (this.isInValidCard()) {
      throw new Error("Invalid card");
    }
  }
  private isInValidCard(): boolean {
    return this.number === "" || this.expiration === null || this.cvv === 0;
  }
}
