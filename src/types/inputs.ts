import { BoxId } from "./boxes";
import { ContextExtension } from "./contextExtension";
import { ErgoTree, Amount } from "./primitives";
import { ProverResult } from "./proverResult";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

export type SignedInput = {
  readonly boxId: BoxId;
  readonly spendingProof: ProverResult;
};

export type UnsignedInput = {
  boxId: BoxId;
  extension: ContextExtension;
};

export type EIP12UnsignedInput = UnsignedInput & {
  transactionId: TransactionId;
  index: number;
  ergoTree: ErgoTree;
  creationHeight: number;
  value: Amount;
  assets: TokenAmount[];
  additionalRegisters: NonMandatoryRegisters;
};

export type DataInput = {
  boxId: BoxId;
};
