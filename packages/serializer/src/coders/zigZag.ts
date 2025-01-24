import { _1n, _63n } from "@fleet-sdk/common";

/**
 * ZigZag encoding maps signed integers to unsigned integers so that numbers
 * with a small absolute value (for instance, -1) have a small variant encoded
 * value too. It does this in a way that "zig-zags" back and forth through the
 * positive and negative integers, so that -1 is encoded as 1, 1 is encoded as 2,
 * -2 is encoded as 3, and so on.
 * @see https://developers.google.com/protocol-buffers/docs/encoding#types
 */

const _31n = BigInt(31);

const u64 = (v: bigint) => BigInt.asUintN(64, v);
const i64 = (v: bigint) => BigInt.asIntN(64, v);
const i32 = (v: bigint) => BigInt.asIntN(32, v);
const u32 = (v: bigint) => BigInt.asUintN(32, v);

/**
 * 32-bit ZigZag encoding.
 */
export const zigZag32 = {
  encode: (input: bigint | number): bigint => {
    const v = i32(BigInt(input));
    return u64(i32(v << _1n) ^ i32(v >> _31n));
  },
  decode: (input: bigint): number => {
    const v = u32(input);
    return Number((v >> _1n) ^ -(v & _1n));
  }
};

/**
 * 64-bit ZigZag encoding.
 */
export const zigZag64 = {
  encode: (input: bigint): bigint => {
    return u64((input << _1n) ^ (input >> _63n));
  },
  decode: (input: bigint): bigint => {
    return i64((input >> _1n) ^ -(input & _1n));
  }
};
