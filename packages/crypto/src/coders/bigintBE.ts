import { hex } from "@scure/base";
import type { Coder } from "../types";

/**
 * A coder for Big Endian  `BigInt` <> `Uint8Array` conversion..
 */
export const bigintBE: Coder<Uint8Array, bigint> = {
  /**
   * Encode a `Uint8Array` to a `BigInt`.
   */
  encode(data) {
    const hexInput = hex.encode(data);
    return BigInt(hexInput === "" ? "0" : `0x${hexInput}`);
  },

  /**
   * Decode a `BigInt` to a `Uint8Array`.
   */
  decode(data) {
    const hexData = data.toString(16);
    return hex.decode(hexData.length % 2 ? `0${hexData}` : hexData);
  }
};
