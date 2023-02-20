import {
  Amount,
  BoxCandidate,
  ContextExtension,
  DataInput,
  isDefined,
  isEmpty,
  UnsignedInput
} from "@fleet-sdk/common";
import { concatBytes, hexToBytes } from "@noble/hashes/utils";
import { vlqEncode } from "../vlq";
import { serializeBox } from "./boxSerializer";

type MinimalUnsignedTransaction = {
  inputs: readonly UnsignedInput[];
  dataInputs: readonly DataInput[];
  outputs: readonly BoxCandidate<Amount>[];
};

export function serializeTransaction(transaction: MinimalUnsignedTransaction) {
  const tokenIds = getDistinctTokenIds(transaction.outputs);

  return concatBytes(
    vlqEncode(transaction.inputs.length),
    concatBytes(...transaction.inputs.map((input) => serializeInput(input))),

    vlqEncode(transaction.dataInputs.length),
    concatBytes(...transaction.dataInputs.map((dataInput) => hexToBytes(dataInput.boxId))),

    vlqEncode(tokenIds.length),
    concatBytes(...tokenIds.map((tokenId) => hexToBytes(tokenId))),

    vlqEncode(transaction.outputs.length),
    concatBytes(...transaction.outputs.map((output) => serializeBox(output, tokenIds)))
  );
}

function serializeInput(input: UnsignedInput) {
  return concatBytes(
    hexToBytes(input.boxId),
    generateEmptyProofBytes(),
    serializeExtension(input.extension)
  );
}

function generateEmptyProofBytes() {
  return Uint8Array.from([0]);
}

function serializeExtension(extension: ContextExtension) {
  const keys = Object.keys(extension);
  if (isEmpty(keys)) {
    return Uint8Array.from([0]);
  }

  const bytes: Uint8Array[] = [];
  for (const key of keys) {
    const val = extension[key as unknown as keyof ContextExtension];
    if (isDefined(val)) {
      bytes.push(vlqEncode(Number(key)));
      bytes.push(hexToBytes(val));
    }
  }

  return concatBytes(vlqEncode(keys.length), concatBytes(...bytes));
}

function getDistinctTokenIds(outputs: readonly BoxCandidate<Amount>[]) {
  const tokenIds = new Set<string>();
  outputs.flatMap((output) => output.assets.map((asset) => tokenIds.add(asset.tokenId)));

  return Array.from(tokenIds);
}
