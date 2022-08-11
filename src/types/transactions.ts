import { Box, BoxCandidate } from "./boxes";
import { Amount } from "./common";
import { DataInput, EIP12UnsignedInput, SignedInput, UnsignedInput } from "./inputs";

export type TransactionId = string;

export type UnsignedTransaction = {
  id?: TransactionId;
  inputs: UnsignedInput[];
  dataInputs: UnsignedInput[];
  outputs: BoxCandidate<Amount>[];
};

export type EIP12UnsignedTransaction = {
  id?: TransactionId;
  inputs: EIP12UnsignedInput[];
  dataInputs: EIP12UnsignedInput[];
  outputs: BoxCandidate<Amount>[];
};

export type SignedTransaction = {
  readonly id: TransactionId;
  readonly inputs: SignedInput[];
  readonly dataInputs: DataInput[];
  readonly outputs: Box<Amount>[];
};
