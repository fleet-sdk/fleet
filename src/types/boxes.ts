import { Amount, ErgoTree } from "./primitives";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

export type BoxId = string;

type BoxBaseType = {
  ergoTree: ErgoTree;
  creationHeight: number;
  value: Amount;
  assets: TokenAmount[];
  additionalRegisters: NonMandatoryRegisters;
};

export type BoxCandidate = BoxBaseType & {
  boxId?: BoxId;
};

export type Box = BoxBaseType & {
  boxId: BoxId;
  transactionId: TransactionId;
  index: number;
  confirmed?: boolean;
};
