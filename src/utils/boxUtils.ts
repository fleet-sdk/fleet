import { Box, NonMandatoryRegisters, TokenId } from "../types";
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
