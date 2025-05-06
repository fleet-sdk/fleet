import {
  byteSizeOf,
  ensureBigInt,
  ergoTreeHeaderFlags,
  FEE_CONTRACT,
  isDefined,
  isEmpty,
  isUndefined,
  some
} from "@fleet-sdk/common";
import type {
  Amount,
  Box,
  BoxCandidate,
  NonMandatoryRegisters,
  TokenAmount
} from "@fleet-sdk/common";
import { estimateVLQSize, SigmaByteReader, SigmaByteWriter } from "../coders";
import { blake2b256, hex, validateEcPoint } from "@fleet-sdk/crypto";
import type { ByteInput } from "../types/constructors";
import { SConstant } from "../sigmaConstant";

const MAX_UINT16_VALUE = 65535;

const FEE_CONTRACT_BYTES = hex.decode(FEE_CONTRACT);
const P2PK_CONTRACT_PREFIX = hex.decode("0008cd");
const COMPRESSED_PK_LENGTH = 33;
const P2PK_CONTRACT_LENGTH = P2PK_CONTRACT_PREFIX.length + COMPRESSED_PK_LENGTH;

export function serializeBox(box: Box<Amount>): SigmaByteWriter;
export function serializeBox(box: Box<Amount>, writer: SigmaByteWriter): SigmaByteWriter;
export function serializeBox(
  box: BoxCandidate<Amount>,
  writer: SigmaByteWriter,
  distinctTokenIds: string[]
): SigmaByteWriter;
export function serializeBox(
  box: Box<Amount> | BoxCandidate<Amount>,
  writer = new SigmaByteWriter(4_096),
  distinctTokenIds?: string[]
): SigmaByteWriter {
  writer.writeBigUInt(ensureBigInt(box.value));
  writer.writeHex(box.ergoTree);
  writer.writeUInt(box.creationHeight);
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
  if (isEmpty(tokens)) {
    writer.write(0);
    return;
  }

  writer.writeUInt(tokens.length);
  if (some(tokenIds)) {
    tokens.map((token) =>
      writer
        .writeUInt(tokenIds.indexOf(token.tokenId))
        .writeBigUInt(ensureBigInt(token.amount))
    );
  } else {
    tokens.map((token) =>
      writer.writeHex(token.tokenId).writeBigUInt(ensureBigInt(token.amount))
    );
  }
}

function writeRegisters(writer: SigmaByteWriter, registers: NonMandatoryRegisters): void {
  const keys = Object.keys(registers).sort();
  let length = 0;

  for (const key of keys) {
    if (registers[key as keyof NonMandatoryRegisters]) length++;
  }

  writer.writeUInt(length);
  if (length === 0) return;

  for (const key of keys) {
    const register = registers[key as keyof NonMandatoryRegisters];
    if (isDefined(register)) writer.writeHex(register);
  }
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

export function deserializeBox(input: ByteInput): Box<bigint>;
export function deserializeBox(
  input: ByteInput,
  distinctTokenIds: string[]
): BoxCandidate<bigint>;
export function deserializeBox(
  input: ByteInput,
  distinctTokenIds?: string[]
): BoxCandidate<bigint> | Box<bigint> {
  const reader = new SigmaByteReader(input);

  const candidate = {
    value: reader.readBigUInt(),
    ergoTree: hex.encode(readErgoTree(reader)),
    creationHeight: reader.readUInt(),
    assets: readTokens(reader, distinctTokenIds),
    additionalRegisters: readRegisters(reader)
  };

  if (distinctTokenIds) return candidate;

  return {
    boxId: hex.encode(blake2b256(input)),
    transactionId: hex.encode(reader.readBytes(32)),
    index: reader.readUInt(),
    ...candidate
  };
}

function readErgoTree(reader: SigmaByteReader): Uint8Array {
  // handles miner fee contract
  if (reader.matchBytes(FEE_CONTRACT_BYTES)) {
    return reader.readBytes(FEE_CONTRACT_BYTES.length);
  }

  // handles P2PK contracts
  if (
    reader.matchBytes(P2PK_CONTRACT_PREFIX) &&
    validateEcPoint(reader.peekBytes(COMPRESSED_PK_LENGTH, P2PK_CONTRACT_PREFIX.length))
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
  const tokens: TokenAmount<bigint>[] = [];
  const count = reader.readUInt();

  for (let i = 0; i < count; i++) {
    tokens.push({
      tokenId: tokenIds ? tokenIds[reader.readUInt()] : hex.encode(reader.readBytes(32)),
      amount: reader.readBigUInt()
    });
  }

  return tokens;
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
