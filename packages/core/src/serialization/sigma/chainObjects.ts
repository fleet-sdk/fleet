import { Amount, Box, NonMandatoryRegisters, TokenAmount } from "@fleet-sdk/common";
import { ensureBigInt, isDefined, isEmpty } from "@fleet-sdk/common";
import { concatBytes, hexToBytes } from "@noble/hashes/utils";
import { ErgoBox } from "../../models/ergoBox";
import { VLQ } from "../vlq";

export function serializeErgoBox(box: Box<Amount> | ErgoBox): Uint8Array {
  return concatBytes(
    VLQ.encode(ensureBigInt(box.value)),
    hexToBytes(box.ergoTree),
    VLQ.encode(box.creationHeight),
    serializeTokens(box.assets),
    serializeRegisters(box.additionalRegisters),
    hexToBytes(box.transactionId),
    VLQ.encode(box.index)
  );
}

function serializeTokens(tokens: TokenAmount<Amount>[]): Uint8Array {
  if (isEmpty(tokens)) {
    return Uint8Array.from([0]);
  }

  return concatBytes(
    VLQ.encode(tokens.length),
    ...tokens.map((asset) =>
      concatBytes(hexToBytes(asset.tokenId), VLQ.encode(ensureBigInt(asset.amount)))
    )
  );
}

function serializeRegisters(registers: NonMandatoryRegisters): Uint8Array {
  const keys = Object.keys(registers);
  if (isEmpty(keys)) {
    return Uint8Array.from([0]);
  }

  const serializedRegisters: Uint8Array[] = [];
  for (const key of keys) {
    const val = registers[key as keyof NonMandatoryRegisters];
    if (isDefined(val)) {
      serializedRegisters.push(hexToBytes(val));
    }
  }

  return concatBytes(VLQ.encode(serializedRegisters.length), concatBytes(...serializedRegisters));
}
