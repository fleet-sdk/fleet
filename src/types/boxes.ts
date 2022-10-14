import { ErgoTree } from "./common";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

export type BoxId = string;

type BoxBaseType<AmountType> = {
  ergoTree: ErgoTree;
  creationHeight: number;
  value: AmountType;
  assets: TokenAmount<AmountType>[];
  additionalRegisters: NonMandatoryRegisters;
  [x: string | number | symbol]: unknown;
};

export type BoxCandidate<AmountType> = BoxBaseType<AmountType> & {
  boxId?: BoxId;
};

export type Box<AmountType> = BoxBaseType<AmountType> & {
  boxId: BoxId;
  transactionId: TransactionId;
  index: number;
};
