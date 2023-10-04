import { BoxId } from "./boxes";
import { ErgoTreeHex, HexString } from "./common";
import { NonMandatoryRegisters } from "./registers";
import { TokenAmount } from "./token";
import { TransactionId } from "./transactions";

export type ContextExtension<T = HexString> = { [key: number]: T | undefined };

export type ProverResult = {
  readonly proofBytes: HexString;
  readonly extension: ContextExtension;
};

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
  ergoTree: ErgoTreeHex;
  creationHeight: number;
  value: string;
  assets: TokenAmount<string>[];
  additionalRegisters: NonMandatoryRegisters;
};

export type EIP12UnsignedDataInput = {
  boxId: BoxId;
  transactionId: TransactionId;
  index: number;
  ergoTree: ErgoTreeHex;
  creationHeight: number;
  value: string;
  assets: TokenAmount<string>[];
  additionalRegisters: NonMandatoryRegisters;
};

export type DataInput = {
  boxId: BoxId;
};
