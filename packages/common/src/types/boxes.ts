import { ErgoTree } from "./common";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

export type BoxId = string;
export type AmountType = string | bigint;

type BoxBaseType<T extends AmountType> = {
  ergoTree: ErgoTree;
  creationHeight: number;
  value: T;
  assets: TokenAmount<T>[];
  additionalRegisters: NonMandatoryRegisters;
};

export type BoxCandidate<T extends AmountType> = BoxBaseType<T> & {
  boxId?: BoxId;
};

export type Box<T extends AmountType> = BoxBaseType<T> & {
  boxId: BoxId;
  transactionId: TransactionId;
  index: number;
};
