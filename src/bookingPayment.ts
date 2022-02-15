import { CreditCard } from "./creditCard";
import { PayMe } from "./payMe";
import { PaymentMethod } from "./payments";

// 🧼 Struct to avoid multiple parameters on methods signatures
export type BookingPayment = {
  method: PaymentMethod;
  creditCard?: CreditCard;
  payMe?: PayMe;
  transferAccount?: string;
};
