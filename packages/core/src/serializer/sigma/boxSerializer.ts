import {
  Amount,
  Box,
  BoxCandidate,
  NonMandatoryRegisters,
  some,
  TokenAmount
} from "@fleet-sdk/common";
import { ensureBigInt, isDefined, isEmpty } from "@fleet-sdk/common";
import { ErgoBox } from "../../models/ergoBox";
import { SigmaWriter } from "./sigmaWriter";

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

function isBox<T extends Amount>(box: Box<Amount> | ErgoBox | BoxCandidate<Amount>): box is Box<T> {
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
