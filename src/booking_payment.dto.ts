import { CreditCardVo } from "./credit_card.vo";
import { PaymentMethod } from "./payment_method.enum";
import { PayMeDto } from "./pay_me.dto";

// 🧼 Struct to avoid multiple parameters on methods signatures
export type BookingPaymentDto = {
  method: PaymentMethod;
  creditCard?: CreditCardVo;
  payMe?: PayMeDto;
  transferAccount?: string;
};
