import { CreditCardVO } from "./creditCardVO";
import { PayMeDTO } from "./payMeDTO";
import { PaymentMethod } from "./payments";

// 🧼 Struct to avoid multiple parameters on methods signatures
export type BookingPaymentDTO = {
  method: PaymentMethod;
  creditCard?: CreditCardVO;
  payMe?: PayMeDTO;
  transferAccount?: string;
};
