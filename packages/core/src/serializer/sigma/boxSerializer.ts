import { Amount, Box, NonMandatoryRegisters, TokenAmount } from "@fleet-sdk/common";
import { ensureBigInt, isDefined, isEmpty } from "@fleet-sdk/common";
import { concatBytes, hexToBytes } from "@noble/hashes/utils";
import { ErgoBox } from "../../models/ergoBox";
import { vlqEncode, vqlEncodeBigInt } from "../vlq";

export function serializeBox(box: Box<Amount> | ErgoBox): Uint8Array {
  return concatBytes(
    vqlEncodeBigInt(ensureBigInt(box.value)),
    hexToBytes(box.ergoTree),
    vlqEncode(box.creationHeight),
    serializeTokens(box.assets),
    serializeRegisters(box.additionalRegisters),
    hexToBytes(box.transactionId),
    vlqEncode(box.index)
  );
}

function serializeTokens(tokens: TokenAmount<Amount>[]): Uint8Array {
  if (isEmpty(tokens)) {
    return Uint8Array.from([0]);
  }

  return concatBytes(
    vlqEncode(tokens.length),
    ...tokens.map((asset) =>
      concatBytes(hexToBytes(asset.tokenId), vqlEncodeBigInt(ensureBigInt(asset.amount)))
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
