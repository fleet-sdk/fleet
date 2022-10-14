import { ErgoBox } from "../../models/ergoBox";
import { Amount, Box, NonMandatoryRegisters, TokenAmount } from "../../types";
import { isEmpty } from "../../utils/arrayUtils";
import { toBigInt } from "../../utils/bigIntUtils";
import { isDefined } from "../../utils/objectUtils";
import { VLQ } from "../vlq";

export function serializeErgoBox(box: Box<Amount> | ErgoBox): Buffer {
  return Buffer.concat([
    VLQ.encode(toBigInt(box.value)),
    Buffer.from(box.ergoTree, "hex"),
    VLQ.encode(box.creationHeight),
    serializeTokens(box.assets),
    serializeRegisters(box.additionalRegisters),
    Buffer.from(box.transactionId, "hex"),
    VLQ.encode(box.index)
  ]);
}

function serializeTokens(tokens: TokenAmount<Amount>[]): Buffer {
  if (isEmpty(tokens)) {
    return Buffer.from([0]);
  }

  return Buffer.concat([
    VLQ.encode(tokens.length),
    ...tokens.map((asset) =>
      Buffer.concat([Buffer.from(asset.tokenId, "hex"), VLQ.encode(toBigInt(asset.amount))])
    )
  ]);
}

function serializeRegisters(registers: NonMandatoryRegisters): Buffer {
  const keys = Object.keys(registers);
  if (isEmpty(keys)) {
    return Buffer.from([0]);
  }

  const serializedRegisters: Buffer[] = [];
  for (const key of keys) {
    const val = registers[key as keyof NonMandatoryRegisters];
    if (isDefined(val)) {
      serializedRegisters.push(Buffer.from(val, "hex"));
    }
  }

  return Buffer.concat([
    VLQ.encode(serializedRegisters.length),
    Buffer.concat(serializedRegisters)
  ]);
}
