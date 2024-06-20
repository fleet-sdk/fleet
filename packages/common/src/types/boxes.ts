import type { Amount, ErgoTreeHex } from "./common";
import type { NonMandatoryRegisters } from "./registers";
import type { TokenAmount } from "./token";
import type { TransactionId } from "./transactions";

export type BoxId = string;

type BoxBaseType<T extends Amount, R extends NonMandatoryRegisters> = {
  ergoTree: ErgoTreeHex;
  creationHeight: number;
  value: T;
  assets: TokenAmount<T>[];
  additionalRegisters: R;
};

export type BoxCandidate<
  T extends Amount,
  R extends NonMandatoryRegisters = NonMandatoryRegisters
> = BoxBaseType<T, R> & {
  boxId?: BoxId;
};

export type Box<
  T extends Amount = Amount,
  R extends NonMandatoryRegisters = NonMandatoryRegisters
> = BoxBaseType<T, R> & {
  boxId: BoxId;
  transactionId: TransactionId;
  index: number;
};
