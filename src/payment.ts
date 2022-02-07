export enum PaymentStatus {
  PROCESSED,
  PENDING,
  REFUSED,
}
export enum PaymentKinds {
  CHARGE,
  REFUND,
}

export class Payment {
  id = "";
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  amount: number;
  concept: string;
  date: Date;
  kind: PaymentKinds = PaymentKinds.CHARGE;
  status: PaymentStatus = PaymentStatus.PENDING;
  gatewayCode: string;
  constructor(cardNumber: string, cardExpiry: string, cardCVC: string, amount: number, concept: string) {
    this.cardNumber = cardNumber;
    this.cardExpiry = cardExpiry;
    this.cardCVC = cardCVC;
    this.amount = amount;
    this.concept = concept;
  }
}
