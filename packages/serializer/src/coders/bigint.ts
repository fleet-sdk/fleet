import { _0n, first } from "@fleet-sdk/common";

/**
 * Converts a hex string to bigint.
 * @param hex The hex string to be converted.
 * @returns The bigint value represented by the hex string.
 */
export function hexToBigInt(hex: string): bigint {
  // https://coolaj86.com/articles/convert-hex-to-decimal-with-js-bigints/
  const value = BigInt(hex.length % 2 ? `0x0${hex}` : `0x${hex}`);
  const highByte = Number.parseInt(hex.slice(0, 2), 16);
  if (0x80 & highByte) return -negateAndMask(value);

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
  let hex = (positive ? value : negateAndMask(value)).toString(16);
  if (hex.length % 2) hex = `0${hex}`;

  if (positive && 0x80 & Number.parseInt(hex.slice(0, 2), 16)) {
    return `00${hex}`;
  }

  return hex;
}

/**
 * Returns the two’s complement of a bigint value.
 * @param value The bigint value to negate.
 * @returns The two’s complement of `number` as a bigint.
 */
export function negateAndMask(value: bigint): bigint {
  let val = value;
  const negative = val < _0n;
  if (negative) val = -val; // turn into a positive number

  const bits = val.toString(2);
  let len = bits.length; // convert to binary
  const mod = len % 8;

  if (mod > 0) {
    len += 8 - mod;
  } else if (negative && first(bits) === "1" && bits.indexOf("1", 1) !== -1) {
    len += 8;
  }

  const mask = (1n << BigInt(len)) - 1n; // create a mask
  return (~val & mask) + 1n; // invert bits, mask it, and add one
}
