import {
  Amount,
  Box,
  BoxCandidate,
  NonMandatoryRegisters,
  some,
  TokenAmount
} from "@fleet-sdk/common";
import { ensureBigInt, isDefined, isEmpty } from "@fleet-sdk/common";
import { concatBytes, hexToBytes } from "@noble/hashes/utils";
import { ErgoBox } from "../../models/ergoBox";
import { vlqEncode, vqlEncodeBigInt } from "../vlq";

export function serializeBox(box: Box<Amount> | ErgoBox): Uint8Array;
export function serializeBox(box: BoxCandidate<Amount>, distinctTokenIds: string[]): Uint8Array;
export function serializeBox(
  box: Box<Amount> | ErgoBox | BoxCandidate<Amount>,
  distinctTokenIds?: string[]
): Uint8Array {
  const bytes = concatBytes(
    vqlEncodeBigInt(ensureBigInt(box.value)),
    hexToBytes(box.ergoTree),
    vlqEncode(box.creationHeight),
    serializeTokens(box.assets, distinctTokenIds),
    serializeRegisters(box.additionalRegisters)
  );

  if (isDefined(distinctTokenIds)) {
    return bytes;
  } else {
    if (!isBox(box)) {
      throw new Error("Invalid box type.");
    }

    return concatBytes(bytes, hexToBytes(box.transactionId), vlqEncode(box.index));
  }
}

function isBox<T extends Amount>(box: Box<Amount> | ErgoBox | BoxCandidate<Amount>): box is Box<T> {
  const castedBox = box as Box<T>;

  return isDefined(castedBox.transactionId) && isDefined(castedBox.index);
}

function serializeTokens(tokens: TokenAmount<Amount>[], tokenIds?: string[]): Uint8Array {
  if (isEmpty(tokens)) {
    return Uint8Array.from([0]);
  }

  if (some(tokenIds)) {
    return concatBytes(
      vlqEncode(tokens.length),
      ...tokens.map((token) =>
        concatBytes(
          vlqEncode(tokenIds.indexOf(token.tokenId)),
          vqlEncodeBigInt(ensureBigInt(token.amount))
        )
      )
    );
  }

  return concatBytes(
    vlqEncode(tokens.length),
    ...tokens.map((token) =>
      concatBytes(hexToBytes(token.tokenId), vqlEncodeBigInt(ensureBigInt(token.amount)))
    )
  );
}

function serializeRegisters(registers: NonMandatoryRegisters): Uint8Array {
  let keys = Object.keys(registers);
  if (isEmpty(keys)) {
    return Uint8Array.from([0]);
  }

  const serializedRegisters: Uint8Array[] = [];
  keys = keys.sort();
  for (const key of keys) {
    const val = registers[key as keyof NonMandatoryRegisters];
    if (isDefined(val)) {
      serializedRegisters.push(hexToBytes(val));
    }
  }

  return concatBytes(vlqEncode(serializedRegisters.length), concatBytes(...serializedRegisters));
}
