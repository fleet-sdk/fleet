import { Amount, ErgoTreeHex } from "./common";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

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
