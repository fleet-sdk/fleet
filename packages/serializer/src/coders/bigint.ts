import { _0n, first } from "@fleet-sdk/common";

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
