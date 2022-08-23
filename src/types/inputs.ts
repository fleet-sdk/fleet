import { BoxId } from "./boxes";
import { Amount, ErgoTree } from "./common";
import { ContextExtension } from "./contextExtension";
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
  assets: TokenAmount<string>[];
  additionalRegisters: NonMandatoryRegisters;
  [x: string | number | symbol]: unknown;
};

export type DataInput = {
  boxId: BoxId;
};
