import { Box, TokenId } from "../types";
import { isEmpty } from "./arrayUtils";

export function sumByTokenId(inputs: Box<bigint>[], tokenId: TokenId): bigint {
  let acc = 0n;
  if (isEmpty(inputs)) {
    return acc;
  }

  for (const input of inputs) {
    for (const token of input.assets) {
      if (token.tokenId !== tokenId) {
        continue;
      }

      acc += token.amount;
    }
  }

  return acc;
}
