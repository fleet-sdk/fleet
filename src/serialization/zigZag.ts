import { _1n, _63n } from "../utils/bitIntLiterals";

/**
 * ZigZag encoding maps signed integers to unsigned integers so that numbers
 * with a small absolute value (for instance, -1) have a small variant encoded
 * value too. It does this in a way that "zig-zags" back and forth through the
 * positive and negative integers, so that -1 is encoded as 1, 1 is encoded as 2,
 * -2 is encoded as 3, and so on.
 * @see https://developers.google.com/protocol-buffers/docs/encoding#types
 */
export class ZigZag {
  /**
   * Encode a signed integer.
   * @param input Signed integer
   * @returns ZigZag-encoded value
   */
  public static encode(input: bigint): bigint {
    return (input << _1n) ^ (input >> _63n);
  }

  /**
   * Decode a ZigZag-encoded value.
   * @param input ZigZag-encoded value
   * @returns Signed integer
   */
  public static decode(input: bigint): bigint {
    return (input >> _1n) ^ -(input & _1n);
  }
}
