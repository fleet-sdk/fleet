import { _1n, _63n } from "@fleet-sdk/common";

/**
 * ZigZag encoding maps signed integers to unsigned integers so that numbers
 * with a small absolute value (for instance, -1) have a small variant encoded
 * value too. It does this in a way that "zig-zags" back and forth through the
 * positive and negative integers, so that -1 is encoded as 1, 1 is encoded as 2,
 * -2 is encoded as 3, and so on.
 * @see https://developers.google.com/protocol-buffers/docs/encoding#types
 */

/**
 * Encode a signed integer.
 * @param input Signed integer
 * @returns ZigZag-encoded value
 */
export function zigZagEncode(input: number): number {
  return (input << 1) ^ (input >> 63);
}

/**
 * Decode a ZigZag-encoded value.
 * @param input ZigZag-encoded value
 * @returns Signed integer
 */
export function zigZagDecode(input: number): number {
  return (input >> 1) ^ -(input & 1);
}

/**
 * Encode a signed big integer.
 * @param input Signed big integer
 * @returns ZigZag-encoded value
 */
export function zigZagEncodeBigInt(input: bigint): bigint {
  return (input << _1n) ^ (input >> _63n);
}

/**
 * Decode a ZigZag-encoded value.
 * @param input ZigZag-encoded value
 * @returns Signed big integer
 */
export function zigZagDecodeBigInt(input: bigint): bigint {
  return (input >> _1n) ^ -(input & _1n);
}
