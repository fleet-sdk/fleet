import { BoxId } from "./boxes";
import { ContextExtension } from "./context-extension";
import { ErgoTree, Amount } from "./primitives";
import { ProverResult } from "./prover-result";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

export type SignedInput = {
  readonly boxId: BoxId;
  readonly spendingProof: ProverResult;
};

export type UnsignedInput = {
  boxId: BoxId;
  transactionId: TransactionId;
  index: number;
  ergoTree: ErgoTree;
  creationHeight: number;
  value: Amount;
  assets: TokenAmount[];
  additionalRegisters: NonMandatoryRegisters;
  extension: ContextExtension;
};

export type DataInput = {
  boxId: BoxId;
};
