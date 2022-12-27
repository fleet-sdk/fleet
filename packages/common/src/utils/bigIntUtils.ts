import { Amount } from "../types";
import { isEmpty } from "./arrayUtils";
import { _0n, _10n } from "./bigIntLiterals";
import { isUndefined } from "./objectUtils";

type NumberLike = string | number | bigint | boolean;

export function ensureBigInt(number: NumberLike): bigint {
  return typeof number === "bigint" ? number : BigInt(number);
}

type UndecimalizeOptions = {
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

export function undecimalize(decimalStr: string, options?: UndecimalizeOptions | number): bigint {
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

  return BigInt(negative + (integer + decimal).replace(/\D/g, ""));
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
  return value.replace(/\.?0+$/, "");
}

function _removeLeadingZeros(value: string): string {
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
