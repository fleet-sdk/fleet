import { Amount, NonMandatoryRegisters, TokenId } from "../types";
import { _0n } from "./bigIntLiterals";
import { ensureBigInt } from "./bigIntUtils";
import { isDefined, isUndefined } from "./objectUtils";

const NANOERGS_TOKEN_ID = "nanoErgs";

export function utxoSum(boxes: MinimalBoxAmounts): BoxAmounts;
export function utxoSum(boxes: MinimalBoxAmounts, tokenId: TokenId): bigint;
export function utxoSum(boxes: MinimalBoxAmounts, tokenId?: TokenId): BoxAmounts | bigint {
  const balances: { [tokenId: string]: bigint } = {};

  for (const box of boxes) {
    if (isUndefined(tokenId) || tokenId === NANOERGS_TOKEN_ID) {
      balances[NANOERGS_TOKEN_ID] = (balances[NANOERGS_TOKEN_ID] || _0n) + ensureBigInt(box.value);
    }

    if (tokenId !== NANOERGS_TOKEN_ID) {
      for (const token of box.assets) {
        if (isDefined(tokenId) && tokenId !== token.tokenId) {
          continue;
        }

        balances[token.tokenId] = (balances[token.tokenId] || _0n) + ensureBigInt(token.amount);
      }
    }
  }

  if (isDefined(tokenId)) {
    return balances[tokenId] || _0n;
  }

  return {
    nanoErgs: balances[NANOERGS_TOKEN_ID] || _0n,
    tokens: Object.keys(balances)
      .filter((x) => x !== NANOERGS_TOKEN_ID)
      .map((tokenId) => ({ tokenId, amount: balances[tokenId] }))
  };
}

export function utxoSumResultDiff(amountsA: BoxAmounts, amountsB: BoxAmounts): BoxAmounts {
  const tokens: TokenAmount<bigint>[] = [];
  const nanoErgs = amountsA.nanoErgs - amountsB.nanoErgs;

  for (const token of amountsA.tokens) {
    const balance =
      token.amount - (amountsB.tokens.find((t) => t.tokenId === token.tokenId)?.amount || _0n);

    if (balance !== _0n) {
      tokens.push({ tokenId: token.tokenId, amount: balance });
    }
  }

  return { nanoErgs, tokens };
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

type MinimalBoxAmounts = readonly {
  value: Amount;
  assets: TokenAmount<Amount>[];
}[];
