import { isEmpty } from "../utils/arrayUtils";

const RADIX = 7;
const MASK = 2 ** RADIX - 1;
const MAX_VLQ_VALUE = 2147483647;

/**
 * A **variable-length quantity (VLQ)** is a universal code that uses an arbitrary number
 * of binary octets (eight-bit bytes) to represent an arbitrarily large integer. A VLQ
 * is essentially a base-128 representation of an unsigned integer with the addition of
 * the eighth bit to mark continuation of bytes. VLQ is identical to LEB128 except in
 * endianness. See the example below.
 */
export class VLQ {
  public static maxIntegerValue = MAX_VLQ_VALUE;

  /**
   * Encode a unsigned integer to VLQ bytes
   * @param value unsigned integer
   * @returns VLQ bytes
   */
  public static encode(value: number): Buffer {
    // source: https://rosettacode.org/wiki/Variable-length_quantity#JavaScript

    if (value === 0) {
      return Buffer.from([value]);
    } else if (value > MAX_VLQ_VALUE) {
      throw new RangeError(`Variable Length Quantity not supported for numbers > ${MAX_VLQ_VALUE}`);
    } else if (value < 0) {
      throw new RangeError("Variable Length Quantity not supported for negative numbers");
    }

    const octets: number[] = [];
    for (let i = value; i !== 0; i >>>= RADIX) {
      octets.push((i & MASK) + (isEmpty(octets) ? 0 : MASK + 1));
    }

    return Buffer.from(octets.reverse());
  }

  /**
   * Decode VLQ bytes to an unsigned integer value
   * @param octets VLQ bytes
   * @returns Unsigned integer value
   */
  public static decode(octets: Buffer): number {
    return octets.reduce((n, octet) => (n << RADIX) + (octet & MASK), 0);
  }
}
