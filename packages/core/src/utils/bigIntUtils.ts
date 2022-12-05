import { isEmpty } from "./arrayUtils";
import { _0n } from "./bigIntLiterals";
import { isUndefined } from "./objectUtils";

export function ensureBigInt(number: string | number | bigint | boolean): bigint {
  return typeof number === "bigint" ? number : BigInt(number);
}

export function sumBy<T>(
  collection: T[],
  iteratee: (value: T) => bigint,
  condition?: (value: T) => boolean
): bigint {
  let acc = _0n;
  if (isEmpty(collection)) {
    return acc;
  }

  for (const item of collection) {
    if (isUndefined(condition) || condition(item)) {
      acc += iteratee(item);
    }
  }

  return acc;
}
