import { Amount } from "../types";
import { first } from "./array";
import { isEmpty, isUndefined } from "./assertions";

type NumberLike = string | number | bigint | boolean;

export const _0n = BigInt(0);
export const _1n = BigInt(1);
export const _7n = BigInt(7);
export const _10n = BigInt(10);
export const _63n = BigInt(63);
export const _127n = BigInt(127);
export const _128n = BigInt(128);

/**
 * Ensure that the given value is a bigint
 * @param number
 */
export function ensureBigInt(number: NumberLike): bigint {
  return typeof number === "bigint" ? number : BigInt(number);
}

type ParsingOptions = {
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

/**
 * Parse a decimal string into a bigint with options
 * @param decimalStr
 * @param options
 *
 * @example
 * undecimalize("129.8379183", { decimals: 9 }) // 129837918300n
 * undecimalize("1", { decimals: 2 }) // 100n
 * undecimalize("1", 2) // 100n
 */
export function undecimalize(decimalStr: string, options?: ParsingOptions | number): bigint {
  if (!decimalStr) {
    return _0n;
  }

  options = typeof options == "number" ? { decimals: options } : options;
  if (isUndefined(options)) {
    options = {};
  }

  options.decimals = options.decimals || 0;
  options.decimalMark = options.decimalMark || ".";

  const fragments = decimalStr.split(options.decimalMark);
  if (fragments.length > 2) {
    throw new Error("Invalid numeric string.");
  }

  let [integer, decimal] = fragments;
  integer = _removeLeadingZeros(integer);
  const negative = integer.startsWith("-") ? "-" : "";

  if (!decimal) {
    decimal = "0".repeat(options.decimals);
  } else if (decimal.length < options.decimals) {
    decimal = decimal.padEnd(options.decimals, "0");
  }

  return BigInt(negative + _stripNonDigits(integer + decimal));
}

/**
 * Strip all non-digits from a string
 * @param value
 */
function _stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

type FormattingOptions = {
  /**
   * Number of decimals.
   */
  decimals: number;

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

/**
 * Format a bigint into a decimal string with options
 * @param value
 * @param options
 *
 * @example
 * decimalize(129837918300n, { decimals: 9 }) // "129.8379183"
 * decimalize(100n, { decimals: 2 }) // "1"
 */
export function decimalize(value: Amount, options?: FormattingOptions | number): string {
  value = ensureBigInt(value);
  if (!options) {
    return value.toString();
  }

  options = typeof options == "number" ? { decimals: options } : options;
  options.decimals = options.decimals || 0;
  options.decimalMark = options.decimalMark || ".";

  const pow = _10n ** BigInt(options.decimals);
  const integer = value / pow;
  const decimal = value - integer * pow;

  return _buildFormattedDecimal(integer.toString(10), decimal.toString(10), options);
}

/**
 * Format a bigint percentage into a decimal string with options
 * @param value
 * @param percentage
 * @param precision
 *
 * @example
 * ```
 * percent(3498n, 1n) // 34n(1%)
 * percent(3498n, 2n) // 69n(2%)
 * percent(3498n, 10n) // 349n(10%)
 * ```
 *
 */
export function percent(value: bigint, percentage: bigint, precision = 2n) {
  return (value * percentage) / 10n ** precision;
}

function _buildFormattedDecimal(
  integer: string,
  decimal: string,
  options: FormattingOptions
): string {
  const integerPart = _addThousandMarks(integer, options.thousandMark);
  const decimalPart = _stripTrailingZeros(decimal.padStart(options.decimals, "0"));

  if (decimalPart) {
    return `${integerPart}${options.decimalMark}${decimalPart}`;
  } else {
    return integerPart;
  }
}

function _addThousandMarks(value: string, mark?: string): string {
  if (!mark) {
    return value;
  }

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, mark);
}

function _stripTrailingZeros(value: string): string {
  if (!value.endsWith("0")) {
    return value;
  }

  return value.replace(/\.?0+$/, "");
}

function _removeLeadingZeros(value: string): string {
  if (!value.startsWith("0")) {
    return value;
  }

  return value.replace(/^0+\.?/, "");
}

/**
 * Sum a collection of numbers by a given iteratee
 * @param collection
 * @param iteratee
 * @param condition
 *
 * @example
 * ```
 * const values = [
 *  { key: 1, value: 100n },
 *  { key: 2, value: 200n },
 *  { key: 3, value: 300n },
 *  { key: 4, value: 400n },
 *  ];
 *
 *  sumBy(values, x => x.value) // 1000n
 *  sumBy(values, x => x.value, x => x.key < 0) // 0n
 *  sumBy(values, x => x.value, x => x.key % 2 === 0) // 600n
 */
export function sumBy<T>(
  collection: readonly T[],
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

/**
 * Get the minimum value from a collection of numbers
 * @param numbers
 */
export function min<T extends bigint | number>(...numbers: T[]): T {
  let min = first(numbers);

  for (const num of numbers) {
    if (num < min) {
      min = num;
    }
  }

  return min;
}

/**
 * Get the maximum value from a collection of numbers
 * @param numbers
 */
export function max<T extends bigint | number>(...numbers: T[]): T {
  let max = first(numbers);

  for (const num of numbers) {
    if (num > max) {
      max = num;
    }
  }

  return max;
}
