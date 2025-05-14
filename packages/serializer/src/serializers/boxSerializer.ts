import {
  FEE_CONTRACT,
  byteSizeOf,
  ensureBigInt,
  ergoTreeHeaderFlags,
  isDefined,
  isUndefined
} from "@fleet-sdk/common";
import type {
  Amount,
  Box,
  BoxCandidate,
  NonMandatoryRegisters,
  TokenAmount
} from "@fleet-sdk/common";
import { blake2b256, hex, validateEcPoint } from "@fleet-sdk/crypto";
import { SigmaByteReader, SigmaByteWriter, estimateVLQSize } from "../coders";
import { SConstant } from "../sigmaConstant";
import type { ByteInput } from "../types/constructors";

const MAX_UINT16_VALUE = 65535;

const FEE_CONTRACT_BYTES = hex.decode(FEE_CONTRACT);
const P2PK_CONTRACT_PREFIX = hex.decode("0008cd");
const COMPRESSED_PK_LENGTH = 33;
const P2PK_CONTRACT_LENGTH = P2PK_CONTRACT_PREFIX.length + COMPRESSED_PK_LENGTH;

export function serializeBox(
  box: Box<Amount> | BoxCandidate<Amount>,
  writer = new SigmaByteWriter(4_096),
  distinctTokenIds?: string[]
): SigmaByteWriter {
  writer.writeBigUInt(ensureBigInt(box.value)).writeHex(box.ergoTree).writeUInt(box.creationHeight);

  writeTokens(writer, box.assets, distinctTokenIds);
  writeRegisters(writer, box.additionalRegisters);

  if (isDefined(distinctTokenIds)) return writer;
  if (!isBox(box)) throw new Error("Invalid box type.");
  return writer.writeHex(box.transactionId).writeUInt(box.index);
}

function isBox<T extends Amount>(box: Box<Amount> | BoxCandidate<Amount>): box is Box<T> {
  const castedBox = box as Box<T>;
  return isDefined(castedBox.transactionId) && isDefined(castedBox.index);
}

function writeTokens(
  writer: SigmaByteWriter,
  tokens: TokenAmount<Amount>[],
  tokenIds?: string[]
): void {
  if (tokenIds) {
    writer.writeArray(tokens, (token, w) =>
      w.writeUInt(tokenIds.indexOf(token.tokenId)).writeBigUInt(ensureBigInt(token.amount))
    );
  } else {
    writer.writeArray(tokens, (token, w) =>
      w.writeHex(token.tokenId).writeBigUInt(ensureBigInt(token.amount))
    );
  }
}

function writeRegisters(writer: SigmaByteWriter, registers: NonMandatoryRegisters): void {
  const keys = Object.keys(registers).sort();
  const values: string[] = [];

  for (const key of keys) {
    const value = registers[key as keyof NonMandatoryRegisters];
    if (!value) continue;

    values.push(value);
  }

  writer.writeArray(values, (value, w) => w.writeHex(value));
}

/**
 * Estimates the byte size a box.
 * @returns byte size of the box.
 */
export function estimateBoxSize(
  box: Box<Amount> | BoxCandidate<Amount>,
  withValue?: Amount
): number {
  if (isUndefined(box.creationHeight)) {
    throw new Error("Box size estimation error: creation height is undefined.");
  }

  let size = 0;

  size += estimateVLQSize(isDefined(withValue) ? withValue : box.value);
  size += byteSizeOf(box.ergoTree);
  size += estimateVLQSize(box.creationHeight);

  size += estimateVLQSize(box.assets.length);
  for (const asset of box.assets) {
    size += byteSizeOf(asset.tokenId) + estimateVLQSize(asset.amount);
  }

  let registersLength = 0;
  for (const key in box.additionalRegisters) {
    const register = box.additionalRegisters[key as keyof NonMandatoryRegisters];
    if (register) {
      size += byteSizeOf(register);
      registersLength++;
    }
  }

  size += estimateVLQSize(registersLength);
  size += 32; // transaction id (BLAKE2b 256 hash)
  size += estimateVLQSize(isBox(box) ? box.index : MAX_UINT16_VALUE);

  return size;
}

/**
 * Deserializes a box embedded in a transaction.
 *
 * It efficiently calculates the box ID by accumulating the serialized data during
 * deserialization and applying blake2b256 hashing, avoiding redundant serialization
 * operations.
 *
 * @param reader - SigmaByteReader containing the serialized box data
 * @param distinctTokenIds - Array of TokenIDs referenced in the parent transaction
 * @param transactionId - ID of the transaction containing this box
 * @param index - Index position of the box in the transaction outputs
 * @returns A fully deserialized Box with all properties including boxId
 */
export function deserializeEmbeddedBox(
  reader: SigmaByteReader,
  distinctTokenIds: string[],
  transactionId: string,
  index: number
): Box<bigint> {
  // SigmaByteReader moves the cursor on read, so we need to save the current position to
  // track read bytes.
  let begin = reader.cursor;

  const value = reader.readBigUInt();
  const ergoTree = hex.encode(readErgoTree(reader));
  const creationHeight = reader.readUInt();

  // Calculating the BoxID needs the full box data, so to avoid serialization road-trips,
  // we will accumulate the the box data in a SigmaByteWriter and then calculate the hash
  // from the its bytes.
  const boxIdWriter = new SigmaByteWriter(4_096) // max size of a box
    .writeBytes(reader.bytes.subarray(begin, reader.cursor)); // copy the bytes read so far

  const assets = readTokens(reader, distinctTokenIds);

  // TokenIDs need to be written in the full box writer
  boxIdWriter.writeUInt(assets.length);
  for (const asset of assets) {
    boxIdWriter.writeHex(asset.tokenId).writeBigUInt(asset.amount);
  }

  begin = reader.cursor; // save the current cursor position again to track the registers bytes
  const additionalRegisters = readRegisters(reader);

  boxIdWriter
    .writeBytes(reader.bytes.subarray(begin, reader.cursor)) // write the registers
    .writeHex(transactionId)
    .writeUInt(index);

  return {
    boxId: hex.encode(blake2b256(boxIdWriter.toBytes())),
    value,
    ergoTree,
    creationHeight,
    assets,
    additionalRegisters,
    transactionId,
    index
  };
}

export function deserializeBox(
  input: ByteInput | SigmaByteReader
): BoxCandidate<bigint> | Box<bigint> {
  const reader = input instanceof SigmaByteReader ? input : new SigmaByteReader(input);
  const begin = reader.cursor; // save the current cursor position to track the read bytes

  const box: Box<bigint> = {
    boxId: "", // placeholder, will be calculated later
    value: reader.readBigUInt(),
    ergoTree: hex.encode(readErgoTree(reader)),
    creationHeight: reader.readUInt(),
    assets: readTokens(reader),
    additionalRegisters: readRegisters(reader),
    transactionId: hex.encode(reader.readBytes(32)),
    index: reader.readUInt()
  };

  box.boxId = hex.encode(blake2b256(reader.bytes.subarray(begin, reader.cursor)));
  return box;
}

function readErgoTree(reader: SigmaByteReader): Uint8Array {
  // handles miner fee contract
  if (reader.match(FEE_CONTRACT_BYTES)) {
    return reader.readBytes(FEE_CONTRACT_BYTES.length);
  }

  // handles P2PK contracts
  if (
    reader.match(P2PK_CONTRACT_PREFIX) &&
    validateEcPoint(reader.peek(COMPRESSED_PK_LENGTH, P2PK_CONTRACT_PREFIX.length))
  ) {
    return reader.readBytes(P2PK_CONTRACT_LENGTH);
  }

  // handles contracts with the size flag enabled
  const header = reader.readByte();
  const hasSize = (header & ergoTreeHeaderFlags.sizeInclusion) !== 0;
  if (!hasSize) {
    throw new Error("ErgoTree parsing without the size flag is not supported.");
  }

  const size = reader.readUInt();
  return new SigmaByteWriter(1 + 4 + size) // header + vlq size + body
    .write(header)
    .writeUInt(size)
    .writeBytes(reader.readBytes(size))
    .toBytes();
}

function readTokens(reader: SigmaByteReader, tokenIds?: string[]): TokenAmount<bigint>[] {
  return reader.readArray((r) => ({
    tokenId: tokenIds ? tokenIds[r.readUInt()] : hex.encode(r.readBytes(32)),
    amount: r.readBigUInt()
  }));
}

function readRegisters(reader: SigmaByteReader): NonMandatoryRegisters {
  const registers: NonMandatoryRegisters = {};
  const count = reader.readUInt();

  for (let i = 0; i < count; i++) {
    // const key = reader.readByte();
    const value = SConstant.from(reader).toHex();
    registers[`R${(i + 4).toString()}` as keyof NonMandatoryRegisters] = value;
  }

  return registers;
}
