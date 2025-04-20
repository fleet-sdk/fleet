import type {
  Amount,
  BoxCandidate,
  DataInput,
  SignedInput,
  SignedTransaction,
  UnsignedInput
} from "@fleet-sdk/common";
import { isDefined } from "@fleet-sdk/common";
import { SigmaByteWriter } from "../coders";
import { serializeBox } from "./boxSerializer";
import { hex } from "@fleet-sdk/crypto";

export type MinimalUnsignedTransaction = {
  inputs: UnsignedInput[];
  dataInputs: DataInput[];
  outputs: BoxCandidate<Amount>[];
};

type Nullish<T> = T | null | undefined;

export function serializeTransaction(
  transaction: MinimalUnsignedTransaction | SignedTransaction
): SigmaByteWriter {
  const writer = new SigmaByteWriter(100_000);

  // write inputs
  writer.writeVLQ(transaction.inputs.length);
  transaction.inputs.map((input) => writeInput(writer, input));

  // write data inputs
  writer.writeVLQ(transaction.dataInputs.length);
  transaction.dataInputs.map((dataInput) => writer.writeHex(dataInput.boxId));

  // write distinct token IDs
  const distinctTokenIds = getDistinctTokenIds(transaction.outputs);
  writer.writeVLQ(distinctTokenIds.length);
  distinctTokenIds.map((tokenId) => writer.writeHex(tokenId));

  // write outputs
  writer.writeVLQ(transaction.outputs.length);
  transaction.outputs.map((output) => serializeBox(output, writer, distinctTokenIds));

  return writer;
}

function writeInput(writer: SigmaByteWriter, input: UnsignedInput | SignedInput): void {
  writer.writeHex(input.boxId);

  if (isSignedInput(input)) {
    writeProof(writer, input.spendingProof?.proofBytes);
    writeExtension(writer, input.spendingProof?.extension);
    return;
  }

  writeProof(writer, null);
  writeExtension(writer, input.extension);
}

function isSignedInput(input: UnsignedInput | SignedInput): input is SignedInput {
  return (input as SignedInput).spendingProof !== undefined;
}

function writeProof(writer: SigmaByteWriter, proof: Nullish<string>): void {
  if (!proof) {
    writer.write(0);
    return;
  }

  const bytes = hex.decode(proof);
  writer.writeVLQ(bytes.length);
  writer.writeBytes(bytes);
}

function writeExtension(
  writer: SigmaByteWriter,
  extension: Nullish<Record<string, string | undefined>>
): void {
  if (!extension) {
    writer.write(0);
    return;
  }

  const keys = Object.keys(extension);
  let length = 0;

  for (const key of keys) {
    if (isDefined(extension[key])) length++;
  }

  writer.writeVLQ(length);
  if (length === 0) return;

  for (const key of keys) {
    const val = extension[key];
    if (isDefined(val)) {
      writer.writeVLQ(Number(key)).writeHex(val);
    }
  }
}

function getDistinctTokenIds(outputs: readonly BoxCandidate<Amount>[]) {
  const tokenIds = new Set<string>();
  outputs.flatMap((output) => output.assets.map((asset) => tokenIds.add(asset.tokenId)));

  return Array.from(tokenIds);
}
