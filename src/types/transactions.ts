import { BoxCandidate, Box } from "./boxes";
import { UnsignedInput, SignedInput, DataInput, EIP12UnsignedInput } from "./inputs";

export type TransactionId = string;

export type UnsignedTransaction = {
  id?: TransactionId;
  inputs: UnsignedInput[];
  dataInputs: UnsignedInput[];
  outputs: BoxCandidate[];
};

export type EIP12UnsignedTransaction = {
  id?: TransactionId;
  inputs: EIP12UnsignedInput[];
  dataInputs: EIP12UnsignedInput[];
  outputs: BoxCandidate[];
};

export type SignedTransaction = {
  readonly id: TransactionId;
  readonly inputs: SignedInput[];
  readonly dataInputs: DataInput[];
  readonly outputs: Box[];
};
