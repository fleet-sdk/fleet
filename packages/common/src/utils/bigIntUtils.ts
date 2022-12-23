import { Amount } from "../types";
import { isEmpty } from "./arrayUtils";
import { _0n, _10n } from "./bigIntLiterals";
import { isUndefined } from "./objectUtils";

type NumberLike = string | number | bigint | boolean;

export function ensureBigInt(number: NumberLike): bigint {
  return typeof number === "bigint" ? number : BigInt(number);
}

type BigIntParseOptions = {
  /**
   * Number of decimals.
   */
  decimals?: number;

  /**
   * Thousand mark char.
   * Default: `.`
   */
  decimalMark?: string;
};

export function strToBigInt(value: string, options?: BigIntParseOptions): bigint {
  if (!value) {
    return _0n;
  }

  const fragments = value.split(options?.decimalMark || ".");
  if (fragments.length > 2) {
    throw new Error("Invalid numeric string.");
  }

  let [integer, decimal] = fragments;
  integer = removeLeadingZeros(integer);
  const decimals = options?.decimals || 0;
  const negative = integer.startsWith("-") ? "-" : "";

  if (!decimal) {
    decimal = "0".repeat(decimals);
  } else if (decimal.length < decimals) {
    decimal = decimal.padEnd(decimals, "0");
  }

  return BigInt(negative + (integer + decimal).replace(/\D/g, ""));
}

type BigIntFormatOptions = {
  /**
   * Number of decimals.
   */
  decimals?: number;

  /**
   * Thousand mark char.
   */
  thousandMark?: string;

  /**
   * Decimal mark char.
   * Default: `.`
   */
  decimalMark?: string;
};

export function bigIntToStr(value: Amount, options?: BigIntFormatOptions): string {
  value = ensureBigInt(value);
  if (!options) {
    return value.toString();
  }

  const decimals = options.decimals || 0;
  const pow = _10n ** BigInt(decimals);
  const integer = value / pow;
  const decimal = value - integer * pow;
  const decimalPart = stripTrailingZeros(decimal.toString(10).padStart(decimals, "0"));
  const integerPart = addThousandMarks(integer.toString(10), options.thousandMark);

  if (decimalPart) {
    return `${integerPart}${options.decimalMark || "."}${decimalPart}`;
  } else {
    return integerPart;
  }
}

function addThousandMarks(value: string, mark?: string): string {
  if (!mark) {
    return value;
  }

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, mark);
}

function stripTrailingZeros(value: string): string {
  return value.replace(/\.?0+$/, "");
}

function removeLeadingZeros(value: string): string {
  return value.replace(/^0+\.?/, "");
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
