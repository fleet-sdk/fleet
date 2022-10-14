/**
 * A **variable-length quantity (VLQ)** is a universal code that uses an arbitrary number
 * of binary octets (eight-bit bytes) to represent an arbitrarily large integer. A VLQ
 * is essentially a base-128 representation of an unsigned integer with the addition of
 * the eighth bit to mark continuation of bytes. VLQ is identical to LEB128 except in
 * endianness. See the example below.
 */
export class VLQ {
  /**
   * Encode a unsigned integer to VLQ bytes
   * @param value unsigned integer
   * @returns VLQ bytes
   */
  public static encode(value: bigint | number): Buffer {
    // source: https://stackoverflow.com/a/3564685

    if (typeof value === "number") {
      value = BigInt(value);
    }

    if (value === 0n) {
      return Buffer.from([0]);
    } else if (value < 0) {
      throw new RangeError("Variable Length Quantity not supported for negative numbers");
    }

    const bytes = [];
    do {
      let lower7bits = Number(value & 0x7fn);
      value >>= 7n;

      if (value > 0) {
        lower7bits |= 0x80;
      }

      bytes.push(lower7bits);
    } while (value > 0);

    return Buffer.from(bytes);
  }

  /**
   * Decode VLQ bytes to an unsigned integer value
   * @param bytes VLQ bytes
   * @returns Unsigned integer value
   */
  public static decode(bytes: Buffer): bigint {
    let value = 0n;
    let shift = 0;
    let lower7bits = 0;
    let i = 0;

    do {
      lower7bits = bytes[i++];
      value |= BigInt((lower7bits & 0x7f) << shift);
      shift += 7;
    } while ((lower7bits & 0x80) != 0);

    return value;
  }
}
