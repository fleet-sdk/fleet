import { Amount } from "../types";
import { first } from "./arrayUtils";
import { isEmpty } from "./assertions";
import { _0n, _10n } from "./bigIntLiterals";
import { isUndefined } from "./objectUtils";

type NumberLike = string | number | bigint | boolean;

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
 * Converts a hex string to bigint.
 * @param hex The hex string to be converted.
 * @returns The bigint value represented by the hex string.
 */
export function hexToBigInt(hex: string): bigint {
  // https://coolaj86.com/articles/convert-hex-to-decimal-with-js-bigints/
  if (hex.length % 2) {
    hex = "0" + hex;
  }

  const value = BigInt("0x" + hex);
  const highByte = parseInt(hex.slice(0, 2), 16);

  if (0x80 & highByte) {
    return -_bitNegate(value); // add two's complement and invert the number to negative
  }

  return value;
}

/**
 * Serializes a `BigInt` to a hex string
 * @param value The bigint value to be serialized
 * @returns Hex representation for the provided `number`.
 */
export function bigIntToHex(value: bigint): string {
  // implementation inspired on
  // https://coolaj86.com/articles/convert-decimal-to-hex-with-js-bigints/
  const positive = value >= _0n;
  if (!positive) {
    value = _bitNegate(value);
  }

  let hex = value.toString(16);
  if (hex.length % 2) {
    hex = "0" + hex;
  }

  if (positive && 0x80 & parseInt(hex.slice(0, 2), 16)) {
    hex = "00" + hex;
  }

  return hex;
}

/**
 * Returns the two’s complement of a bigint value.
 * @param value The bigint value to negate.
 * @returns The two’s complement of `number` as a bigint.
 */
export function _bitNegate(value: bigint): bigint {
  const negative = value < _0n;
  if (negative) {
    value = -value; // turn into a positive number
  }

  const bits = value.toString(2);
  let bitLen = bits.length; // convert to binary

  const mod = bitLen % 8;
  if (mod > 0) {
    bitLen += 8 - mod;
  } else if (negative && first(bits) === "1" && bits.indexOf("1", 1) !== -1) {
    bitLen += 8;
  }

  const mask = (1n << BigInt(bitLen)) - 1n; // create a mask

  return (~value & mask) + 1n; // invert bits, mask it, and add one
}

export function min<T extends bigint | number>(...numbers: T[]): T {
  let min = first(numbers);

  for (const num of numbers) {
    if (num < min) {
      min = num;
    }
  }

  return min;
}

export function max<T extends bigint | number>(...numbers: T[]): T {
  let max = first(numbers);

  for (const num of numbers) {
    if (num > max) {
      max = num;
    }
  }

  return max;
}
