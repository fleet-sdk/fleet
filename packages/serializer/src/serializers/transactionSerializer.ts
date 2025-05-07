import type {
  Amount,
  BoxCandidate,
  DataInput,
  SignedInput,
  SignedTransaction,
  UnsignedInput,
  UnsignedTransaction
} from "@fleet-sdk/common";
import { isDefined } from "@fleet-sdk/common";
import { SigmaByteReader, SigmaByteWriter } from "../coders";
import { deserializeEmbeddedBox, serializeBox } from "./boxSerializer";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import type { ByteInput } from "../types/constructors";
import { SConstant } from "../sigmaConstant";

export type MinimalUnsignedTransaction = {
  inputs: UnsignedInput[];
  dataInputs: DataInput[];
  outputs: BoxCandidate<Amount>[];
};

type Nullish<T> = T | null | undefined;

type Input = UnsignedInput | SignedInput;

export function serializeTransaction(
  transaction: MinimalUnsignedTransaction | SignedTransaction
): SigmaByteWriter {
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
  let length = 0;

  for (const key of keys) {
    if (isDefined(extension[key])) length++;
  }

  writer.writeUInt(length);
  if (length === 0) return;

  for (const key of keys) {
    const val = extension[key];
    if (isDefined(val)) {
      writer.writeUInt(Number(key)).writeHex(val);
    }
  }
}

function getDistinctTokenIds(outputs: readonly BoxCandidate<Amount>[]) {
  const tokenIds = new Set<string>();
  outputs.flatMap((output) => output.assets.map((asset) => tokenIds.add(asset.tokenId)));

  return Array.from(tokenIds);
}

export function deserializeTransaction<T extends SignedTransaction | UnsignedTransaction>(
  input: ByteInput
): T {
  const reader = new SigmaByteReader(input);

  const inputCount = reader.readUInt();
  const inputs: (SignedInput | UnsignedInput)[] = [];
  for (let i = 0; i < inputCount; i++) {
    inputs.push(readInput(reader));
  }

  // The transaction ID is computed by serializing inputs as unsigned (excluding proofs),
  // even for signed transactions.
  const txIdBytes = inputs.some(isSignedInput)
    ? new SigmaByteWriter(input.length)
        .writeArray(inputs, (input, writer) => writeUnsignedInput(writer, input)) // write inputs as unsigned
        .writeBytes(reader.bytes.subarray(reader.cursor))
        .toBytes()
    : reader.bytes;

  const id = hex.encode(blake2b256(txIdBytes));

  const dataInputCount = reader.readUInt();
  const dataInputs: DataInput[] = [];
  for (let i = 0; i < dataInputCount; i++) {
    dataInputs.push({ boxId: hex.encode(reader.readBytes(32)) });
  }

  const distinctTokenCount = reader.readUInt();
  const distinctTokenIds: string[] = [];
  for (let i = 0; i < distinctTokenCount; i++) {
    distinctTokenIds.push(hex.encode(reader.readBytes(32)));
  }

  const outputCount = reader.readUInt();
  const outputs: BoxCandidate<Amount>[] = [];
  for (let i = 0; i < outputCount; i++) {
    outputs.push(deserializeEmbeddedBox(reader, distinctTokenIds, id, i));
  }

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
