import type { Box, BoxCandidate } from "./boxes";
import type { Amount } from "./common";
import type {
  DataInput,
  EIP12UnsignedDataInput,
  EIP12UnsignedInput,
  SignedInput,
  UnsignedInput
} from "./inputs";

export type TransactionId = string;

export type UnsignedTransaction = {
  id?: TransactionId;
  inputs: UnsignedInput[];
  dataInputs: DataInput[];
  outputs: BoxCandidate<Amount>[];
};

export type EIP12UnsignedTransaction = {
  id?: TransactionId;
  inputs: EIP12UnsignedInput[];
  dataInputs: EIP12UnsignedDataInput[];
  outputs: BoxCandidate<string>[];
};

export type SignedTransaction = {
  readonly id: TransactionId;
  readonly inputs: SignedInput[];
  readonly dataInputs: DataInput[];
  readonly outputs: Box<string>[];
};
