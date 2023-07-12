import { ErgoTreeHex } from "./common";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

export type BoxId = string;
export type AmountType = string | bigint;

type BoxBaseType<T extends AmountType, R extends NonMandatoryRegisters> = {
  ergoTree: ErgoTreeHex;
  creationHeight: number;
  value: T;
  assets: TokenAmount<T>[];
  additionalRegisters: R;
};

export type BoxCandidate<
  T extends AmountType,
  R extends NonMandatoryRegisters = NonMandatoryRegisters
> = BoxBaseType<T, R> & {
  boxId?: BoxId;
};

export type Box<
  T extends AmountType,
  R extends NonMandatoryRegisters = NonMandatoryRegisters
> = BoxBaseType<T, R> & {
  boxId: BoxId;
  transactionId: TransactionId;
  index: number;
};
