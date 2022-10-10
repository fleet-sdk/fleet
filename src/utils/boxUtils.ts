import { Amount, Box, NonMandatoryRegisters, TokenId } from "../types";
import { isEmpty } from "./arrayUtils";
import { toBigInt } from "./bigIntUtils";

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

const MIN_REGISTER_NUMBER = 4;
const MAX_REGISTER_NUMBER = 9;

export function areRegistersDenselyPacked(registers: NonMandatoryRegisters): boolean {
  let lastValueIndex = 0;
  for (let i = MIN_REGISTER_NUMBER; i <= MAX_REGISTER_NUMBER; i++) {
    if (registers[`R${i}` as keyof NonMandatoryRegisters]) {
      if (i === MIN_REGISTER_NUMBER) {
        lastValueIndex = i;
        continue;
      }

      if (i - lastValueIndex > 1) {
        return false;
      }

      lastValueIndex = i;
    }
  }

  return true;
}

type TokenAmount<AmountType> = {
  tokenId: TokenId;
  amount: AmountType;
};

export type BoxAmounts = {
  nanoErgs: bigint;
  tokens: TokenAmount<bigint>[];
};

type MinimalAmountFields = {
  value: Amount;
  assets: TokenAmount<Amount>[];
};

export function sumBoxes(boxes: MinimalAmountFields[]): BoxAmounts {
  const tokens: { [tokenId: string]: bigint } = {};
  let nanoErgs = 0n;

  for (const box of boxes) {
    nanoErgs += toBigInt(box.value);
    for (const token of box.assets) {
      tokens[token.tokenId] = (tokens[token.tokenId] || 0n) + toBigInt(token.amount);
    }
  }

  return {
    nanoErgs,
    tokens: Object.keys(tokens).map((tokenId) => ({ tokenId, amount: tokens[tokenId] }))
  };
}
