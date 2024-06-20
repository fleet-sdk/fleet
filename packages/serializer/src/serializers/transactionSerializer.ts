import {
  type Amount,
  type BoxCandidate,
  type ContextExtension,
  type DataInput,
  isDefined,
  type UnsignedInput
} from "@fleet-sdk/common";
import { SigmaByteWriter } from "../coders";
import { serializeBox } from "./boxSerializer";

export type MinimalUnsignedTransaction = {
  inputs: readonly UnsignedInput[];
  dataInputs: readonly DataInput[];
  outputs: readonly BoxCandidate<Amount>[];
};

export function serializeTransaction(
  transaction: MinimalUnsignedTransaction
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
  transaction.outputs.map((output) =>
    serializeBox(output, writer, distinctTokenIds)
  );

  return writer;
}

function writeInput(writer: SigmaByteWriter, input: UnsignedInput): void {
  writer.writeHex(input.boxId);
  writer.write(0); // empty proof
  writeExtension(writer, input.extension);
}

function writeExtension(
  writer: SigmaByteWriter,
  extension: ContextExtension
): void {
  const keys = Object.keys(extension);
  let length = 0;

  for (const key of keys) {
    const ext = extension[key as unknown as keyof ContextExtension];
    if (isDefined(ext)) {
      length++;
    }
  }

  writer.writeVLQ(length);
  if (length === 0) return;

  for (const key of keys) {
    const ext = extension[key as unknown as keyof ContextExtension];
    if (isDefined(ext)) {
      writer.writeVLQ(Number(key)).writeHex(ext);
    }
  }
}

function getDistinctTokenIds(outputs: readonly BoxCandidate<Amount>[]) {
  const tokenIds = new Set<string>();
  outputs.flatMap((output) =>
    output.assets.map((asset) => tokenIds.add(asset.tokenId))
  );

  return Array.from(tokenIds);
}
