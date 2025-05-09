import type {
  Amount,
  BoxCandidate,
  SignedInput,
  SignedTransaction,
  UnsignedInput,
  UnsignedTransaction
} from "@fleet-sdk/common";
import { SigmaByteReader, SigmaByteWriter } from "../coders";
import { deserializeEmbeddedBox, serializeBox } from "./boxSerializer";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import type { ByteInput } from "../types/constructors";
import { SConstant } from "../sigmaConstant";

type Nullish<T> = T | null | undefined;
type Input = UnsignedInput | SignedInput;
type Transaction = UnsignedTransaction | SignedTransaction;

export function serializeTransaction(transaction: Transaction): SigmaByteWriter {
  const tokenIds = getDistinctTokenIds(transaction.outputs);

  return new SigmaByteWriter(100_000)
    .writeArray<Input>(transaction.inputs, (input, w) => writeInput(w, input))
    .writeArray(transaction.dataInputs, (dataInput, w) => w.writeHex(dataInput.boxId))
    .writeArray(tokenIds, (tokenId, w) => w.writeHex(tokenId))
    .writeArray(transaction.outputs, (output, w) => serializeBox(output, w, tokenIds));
}

function writeInput(writer: SigmaByteWriter, input: Input): void {
  if (isSignedInput(input)) {
    writeSignedInput(writer, input);
    return;
  }

  writeUnsignedInput(writer, input);
}

function writeSignedInput(writer: SigmaByteWriter, input: SignedInput): void {
  writer.writeHex(input.boxId);
  writeProof(writer, input.spendingProof?.proofBytes);
  writeExtension(writer, input.spendingProof?.extension);
}

function writeUnsignedInput(writer: SigmaByteWriter, input: Input): void {
  writer.writeHex(input.boxId);
  writeProof(writer, null);
  writeExtension(
    writer,
    isSignedInput(input) ? input.spendingProof?.extension : input.extension
  );
}

function isSignedInput(input: Input): input is SignedInput {
  return (input as SignedInput).spendingProof !== undefined;
}

function writeProof(writer: SigmaByteWriter, proof: Nullish<string>): void {
  if (!proof) {
    writer.write(0);
    return;
  }

  const bytes = hex.decode(proof);
  writer.writeUInt(bytes.length).writeBytes(bytes);
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
  const values: [string, string][] = [];

  for (const key of keys) {
    const value = extension[key];
    if (!value) continue;

    values.push([key, value]);
  }

  writer.writeArray(values, ([key, value], w) =>
    w.writeUInt(Number(key)).writeHex(value)
  );
}

function getDistinctTokenIds(outputs: readonly BoxCandidate<Amount>[]) {
  const tokenIds = new Set<string>();
  outputs.flatMap((output) => output.assets.map((asset) => tokenIds.add(asset.tokenId)));

  return Array.from(tokenIds);
}

export function deserializeTransaction<T extends Transaction>(input: ByteInput): T {
  const reader = new SigmaByteReader(input);

  const inputs = reader.readArray(readInput);
  const id = computeId(reader, inputs);
  const dataInputs = reader.readArray((r) => ({ boxId: hex.encode(r.readBytes(32)) }));
  const tokenIds = reader.readArray((r) => hex.encode(r.readBytes(32)));
  const outputs = reader.readArray((r, i) => deserializeEmbeddedBox(r, tokenIds, id, i));

  return {
    id,
    inputs,
    dataInputs,
    outputs
  } as T;
}

function readInput(reader: SigmaByteReader): SignedInput | UnsignedInput {
  const boxId = hex.encode(reader.readBytes(32));

  const proofLength = reader.readUInt();
  const proofBytes = proofLength > 0 ? hex.encode(reader.readBytes(proofLength)) : null;

  const extensionLength = reader.readUInt();
  const extension: Record<string, string> = {};
  for (let i = 0; i < extensionLength; i++) {
    extension[reader.readUInt()] = SConstant.from(reader).toHex();
  }

  return proofBytes
    ? { boxId, spendingProof: { proofBytes, extension } }
    : { boxId, extension };
}

/**
 * Computes the transaction ID by serializing inputs as unsigned (excluding proofs),
 * even for signed transactions.
 */
function computeId(reader: SigmaByteReader, inputs: Input[]): string {
  const bytes = new SigmaByteWriter(reader.bytes.length)
    .writeArray(inputs, (input, writer) => writeUnsignedInput(writer, input)) // write inputs as unsigned
    .writeBytes(reader.bytes.subarray(reader.cursor))
    .toBytes();

  return hex.encode(blake2b256(bytes));
}
