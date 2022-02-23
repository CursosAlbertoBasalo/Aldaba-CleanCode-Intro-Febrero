import { CreditCardVO } from "./creditCardVO";
import { PayMeDTO } from "./payMeDTO";
import { PaymentMethod } from "./payments";

export type BookingPaymentDTO = {
  method: PaymentMethod;
  creditCard?: CreditCardVO;
  payMe?: PayMeDTO;
  transferAccount?: string;
};
