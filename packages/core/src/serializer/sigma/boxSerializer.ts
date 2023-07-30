import {
  Amount,
  Box,
  BoxCandidate,
  byteSizeOf,
  ensureBigInt,
  isDefined,
  isEmpty,
  isUndefined,
  NonMandatoryRegisters,
  some,
  TokenAmount
} from "@fleet-sdk/common";
import { OutputBuilder } from "../../builder";
import { ErgoBox } from "../../models/ergoBox";
import { estimateVLQSize } from "../vlq";
import { SigmaWriter } from "./sigmaWriter";

const MAX_UINT16_VALUE = 65535;

export function serializeBox(box: Box<Amount> | ErgoBox): SigmaWriter;
export function serializeBox(box: Box<Amount> | ErgoBox, writer: SigmaWriter): SigmaWriter;
export function serializeBox(
  box: BoxCandidate<Amount>,
  writer: SigmaWriter,
  distinctTokenIds: string[]
): SigmaWriter;
export function serializeBox(
  box: Box<Amount> | ErgoBox | BoxCandidate<Amount>,
  writer?: SigmaWriter,
  distinctTokenIds?: string[]
): SigmaWriter {
  if (!writer) {
    writer = new SigmaWriter(5_0000);
  }

  writer.writeBigVLQ(ensureBigInt(box.value));
  writer.writeHex(box.ergoTree);
  writer.writeVLQ(box.creationHeight);
  writeTokens(writer, box.assets, distinctTokenIds);
  writeRegisters(writer, box.additionalRegisters);

  if (isDefined(distinctTokenIds)) {
    return writer;
  } else {
    if (!isBox(box)) {
      throw new Error("Invalid box type.");
    }

    return writer.writeHex(box.transactionId).writeVLQ(box.index);
  }
}

function isBox<T extends Amount>(
  box: Box<Amount> | ErgoBox | BoxCandidate<Amount> | OutputBuilder
): box is Box<T> {
  const castedBox = box as Box<T>;

  return isDefined(castedBox.transactionId) && isDefined(castedBox.index);
}

function writeTokens(
  writer: SigmaWriter,
  tokens: TokenAmount<Amount>[],
  tokenIds?: string[]
): void {
  if (isEmpty(tokens)) {
    writer.write(0);

    return;
  }

  writer.writeVLQ(tokens.length);
  if (some(tokenIds)) {
    tokens.map((token) =>
      writer.writeVLQ(tokenIds.indexOf(token.tokenId)).writeBigVLQ(ensureBigInt(token.amount))
    );
  } else {
    tokens.map((token) => writer.writeHex(token.tokenId).writeBigVLQ(ensureBigInt(token.amount)));
  }
}

function writeRegisters(writer: SigmaWriter, registers: NonMandatoryRegisters): void {
  const keys = Object.keys(registers).sort();
  let length = 0;

  for (const key of keys) {
    if (registers[key as keyof NonMandatoryRegisters]) {
      length++;
    }
  }

  writer.writeVLQ(length);
  if (length == 0) {
    return;
  }

  for (const key of keys) {
    const register = registers[key as keyof NonMandatoryRegisters];
    if (isDefined(register)) {
      writer.writeHex(register);
    }
  }
}

/**
 * Estimates the byte size a box.
 * @returns byte size of the box.
 */
export function estimateBoxSize(
  box: Box<Amount> | BoxCandidate<Amount> | OutputBuilder,
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
  size += box.assets.reduce(
    (acc: number, curr) => (acc += byteSizeOf(curr.tokenId) + estimateVLQSize(curr.amount)),
    0
  );

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
