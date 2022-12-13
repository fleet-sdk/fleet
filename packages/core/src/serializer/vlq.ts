import { _0n, _127n, _128n, _7n } from "@fleet-sdk/common";
import { SigmaByteReader } from "./sigma/sigmaByteReader";

/**
 * A **variable-length quantity (VLQ)** is a universal code that uses an arbitrary number
 * of binary octets (eight-bit bytes) to represent an arbitrarily large integer. A VLQ
 * is essentially a base-128 representation of an unsigned integer with the addition of
 * the eighth bit to mark continuation of bytes. VLQ is identical to LEB128 except in
 * endianness. See the example below.
 */

/**
 * Decode VLQ bytes to an unsigned integer value
 * @param reader VLQ bytes
 * @returns Unsigned integer value
 */
export function vlqEncode(value: number): Uint8Array {
  // source: https://stackoverflow.com/a/3564685

  if (value === 0) {
    return Uint8Array.from([0]);
  } else if (value < 0) {
    throw new RangeError("Variable Length Quantity not supported for negative numbers");
  }

  const bytes = [];
  do {
    let lower7bits = value & 0x7f;
    value >>= 7;

    if (value > 0) {
      lower7bits |= 0x80;
    }

    bytes.push(lower7bits);
  } while (value > 0);

  return Uint8Array.from(bytes);
}

/**
 * Decode VLQ bytes to an unsigned integer value
 * @param reader VLQ bytes
 * @returns Unsigned integer value
 */
export function vlqDecode(reader: SigmaByteReader): number {
  if (reader.isEmpty) {
    return 0;
  }

  let value = 0;
  let shift = 0;
  let lower7bits = 0;

  do {
    lower7bits = reader.readByte();
    value |= (lower7bits & 0x7f) << shift;
    shift += 7;
  } while ((lower7bits & 0x80) != 0);

  return value;
}

/**
 * Encode a unsigned big integer to VLQ bytes
 * @param value unsigned bit integer
 * @returns VLQ bytes
 */
export function vqlEncodeBigInt(value: bigint): Uint8Array {
  // source: https://stackoverflow.com/a/3564685

  if (value === _0n) {
    return Uint8Array.from([0]);
  } else if (value < _0n) {
    throw new RangeError("Variable Length Quantity not supported for negative numbers");
  }

  const bytes = [];
  do {
    let lower7bits = Number(value & _127n);
    value >>= _7n;

    if (value > 0) {
      lower7bits |= 0x80;
    }

    bytes.push(lower7bits);
  } while (value > 0);

  return Uint8Array.from(bytes);
}

/**
 * Decode VLQ bytes to an unsigned big integer value
 * @param reader VLQ bytes
 * @returns Unsigned integer value
 */
export function vlqDecodeBigInt(reader: SigmaByteReader): bigint {
  if (reader.isEmpty) {
    return _0n;
  }

  let value = _0n;
  let shift = _0n;
  let lower7bits = _0n;

  do {
    lower7bits = BigInt(reader.readByte());
    value |= (lower7bits & _127n) << shift;
    shift += _7n;
  } while ((lower7bits & _128n) != _0n);

  return value;
}
