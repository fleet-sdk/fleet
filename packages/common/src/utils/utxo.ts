import {
  Amount,
  AmountType,
  Box,
  BoxCandidate,
  NonMandatoryRegisters,
  TokenAmount,
  TokenId
} from "../types";
import { isDefined, isEmpty, isUndefined } from "./assertions";
import { ensureBigInt } from "./bigInt";
import { _0n } from "./bigInt";

const NANOERGS_TOKEN_ID = "nanoErgs";

/**
 * Calculates the sum of all nanoErgs and tokens in the given boxes.
 * @param boxes
 *
 * @example
 * ```
 * const boxes = [
 * {
 *  value: 10,
 *  assets: [{ tokenId: "test", amount: 20 }]
 *  }, {
 *  value: 20,
 *  assets: [{ tokenId: "test", amount: 30 }]
 *  }
 *  ];
 *  const sum = utxoSum(boxes);
 *  console.log(sum);
 *  // { nanoErgs: 30n, tokens: [{ tokenId: "test", amount: 50n }] }
 *  ```
 *
 */
export function utxoSum(boxes: MinimalBoxAmounts): BoxSummary;
export function utxoSum(boxes: MinimalBoxAmounts, tokenId: TokenId): bigint;
export function utxoSum(boxes: MinimalBoxAmounts, tokenId?: TokenId): BoxSummary | bigint {
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

/**
 * Calculates the difference between two utxos or utxo sets.
 * @param minuend
 * @param subtrahend
 *
 * @example
 * ```
 * const minuend = {
 * nanoErgs: 30n,
 * tokens: [{ tokenId: "test", amount: 50n }]
 * };
 * const subtrahend = {
 * nanoErgs: 10n,
 * tokens: [{ tokenId: "test", amount: 20n }]
 * };
 * const diff = utxoDiff(minuend, subtrahend);
 * console.log(diff);
 * // { nanoErgs: 20n, tokens: [{ tokenId: "test", amount: 30n }] }
 */
export function utxoDiff(
  minuend: BoxSummary | Box<Amount>[],
  subtrahend: BoxSummary | Box<Amount>[]
): BoxSummary {
  if (Array.isArray(minuend)) {
    minuend = utxoSum(minuend);
  }

  if (Array.isArray(subtrahend)) {
    subtrahend = utxoSum(subtrahend);
  }

  const tokens: TokenAmount<bigint>[] = [];
  const nanoErgs = minuend.nanoErgs - subtrahend.nanoErgs;

  for (const token of minuend.tokens) {
    const balance =
      token.amount - (subtrahend.tokens.find((t) => t.tokenId === token.tokenId)?.amount || _0n);

    if (balance !== _0n) {
      tokens.push({ tokenId: token.tokenId, amount: balance });
    }
  }

  return { nanoErgs, tokens };
}

const MIN_NON_MANDATORY_REGISTER_INDEX = 4;
const MAX_NON_MANDATORY_REGISTER_INDEX = 9;

/**
 * Checks if the given registers are densely packed.
 * @param registers
 *
 * @example
 * ```
 * const registers = {
 * R4: "0x0000000000",
 * R6: "0x0000000000",
 * R7: "0x0000000000",
 * };
 * const result = areRegistersDenselyPacked(registers);
 * console.log(result);
 * // false
 */
export function areRegistersDenselyPacked(registers: NonMandatoryRegisters): boolean {
  let lastIndex = 0;
  for (let i = MIN_NON_MANDATORY_REGISTER_INDEX; i <= MAX_NON_MANDATORY_REGISTER_INDEX; i++) {
    const key = `R${i}` as keyof NonMandatoryRegisters;
    if (registers[key]) {
      if (i === MIN_NON_MANDATORY_REGISTER_INDEX) {
        lastIndex = i;
        continue;
      }

      if (i - lastIndex > 1) {
        return false;
      }

      lastIndex = i;
    }
  }

  return true;
}

/**
 * Filters the given utxos by the given filter parameters.
 * @param utxos
 * @param filterParams
 */
export function utxoFilter<T extends AmountType>(
  utxos: Box<T>[],
  filterParams: UTxOFilterParams<T>
) {
  if (isEmpty(filterParams) || isEmpty(utxos)) {
    return utxos;
  }

  const { by, max } = filterParams;
  let filtered = utxos;

  if (by) {
    filtered = utxos.filter(by);
    if (isEmpty(filtered)) {
      return filtered;
    }
  }

  if (!max) {
    return filtered;
  }

  if (isDefined(max.aggregatedDistinctTokens)) {
    const tokenIds = _getDistinctTokenIds(filtered, max.aggregatedDistinctTokens);
    filtered = filtered.filter(
      (utxo) => isEmpty(utxo.assets) || utxo.assets.every((token) => tokenIds.has(token.tokenId))
    );
  }

  if (isDefined(max.count) && filtered.length > max.count) {
    filtered = filtered.slice(0, max.count);
  }

  return filtered;
}

function _getDistinctTokenIds(utxos: Box<AmountType>[], max: number): Set<string> {
  const tokenIds = new Set<string>();

  for (let i = 0; i < utxos.length && tokenIds.size < max; i++) {
    if (isEmpty(utxos[i].assets) || utxos[i].assets.length > max) {
      continue;
    }

    for (const token of utxos[i].assets) {
      tokenIds.add(token.tokenId);
    }
  }

  return tokenIds;
}

export type UTxOFilterParams<T extends AmountType> = {
  by?: (utxo: Box<T>) => boolean;
  max?: {
    count?: number;
    aggregatedDistinctTokens?: number;
  };
};

export type BoxSummary = {
  nanoErgs: bigint;
  tokens: TokenAmount<bigint>[];
};

export type MinimalBoxAmounts = readonly {
  value: Amount;
  assets: TokenAmount<Amount>[];
}[];

/**
 * Ensures that the given box candidate has big integer values.
 * @param box
 */
export function ensureUTxOBigInt(box: Box<Amount>): Box<bigint>;
export function ensureUTxOBigInt(candidate: BoxCandidate<Amount>): BoxCandidate<bigint>;
export function ensureUTxOBigInt(
  box: Box<Amount> | BoxCandidate<Amount>
): BoxCandidate<bigint> | Box<bigint> {
  return {
    ...box,
    value: ensureBigInt(box.value),
    assets: box.assets.map((token) => ({
      tokenId: token.tokenId,
      amount: ensureBigInt(token.amount)
    }))
  };
}
