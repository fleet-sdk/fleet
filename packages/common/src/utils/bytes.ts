import { _0n, assertInstanceOf, first } from ".";

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const r = new Uint8Array(arrays.reduce((sum, a) => sum + a.length, 0));

  let pad = 0;
  for (const bytes of arrays) {
    assertInstanceOf(bytes, Uint8Array);

    r.set(bytes, pad);
    pad += bytes.length;
  }

  return r;
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

export function isHex(value?: string) {
  if (!value || value.length % 2) return false;

  if (!value.startsWith("0x")) {
    value = "0x" + value;
  }

  return !isNaN(Number(value));
}

/**
 * Get hex string size in bytes
 * @param hex
 * @returns the byte size if the hex string
 */
export function byteSizeOf(hex: string): number {
  return hex.length / 2;
}
