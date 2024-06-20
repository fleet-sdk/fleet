import { assert, assertInstanceOf, assertTypeOf } from "@fleet-sdk/common";
import { BytesCoder } from "../types";

const HEXES = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, "0")
);

const HexChar = {
  ZERO: 48, // 0
  NINE: 57, // 9
  A_UP: 65, // A
  F_UP: 70, // F
  A_LO: 97, // a
  F_LO: 102 // f
} as const;

function bytesToHex(bytes: Uint8Array): string {
  assertInstanceOf(bytes, Uint8Array);

  let hex = "";
  for (let i = 0, len = bytes.length; i < len; i++) {
    hex += HEXES[bytes[i]];
  }

  return hex;
}

function hexToBytes(hex: string): Uint8Array {
  assertTypeOf(hex, "string");
  assert(hex.length % 2 === 0, "Invalid hex padding.");

  const len = hex.length / 2;
  const bytes = new Uint8Array(len);
  for (let i = 0, j = 0; i < len; i++) {
    const n1 = charCodeToBase16(hex.charCodeAt(j++));
    const n2 = charCodeToBase16(hex.charCodeAt(j++));
    bytes[i] = n1 * 16 + n2;
  }

  return bytes;
}

function charCodeToBase16(char: number) {
  if (char >= HexChar.ZERO && char <= HexChar.NINE) return char - HexChar.ZERO;
  if (char >= HexChar.A_UP && char <= HexChar.F_UP)
    return char - (HexChar.A_UP - 10);
  if (char >= HexChar.A_LO && char <= HexChar.F_LO)
    return char - (HexChar.A_LO - 10);

  throw new Error("Invalid byte sequence.");
}

export const hex: BytesCoder = {
  encode: bytesToHex,
  decode: hexToBytes
};
