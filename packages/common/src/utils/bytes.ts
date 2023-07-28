import { assert, assertInstanceOf, assertTypeOf } from ".";

export type StringEncoding = "hex" | "utf8";

const HEXES = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

export function hexToBytes(hex: string): Uint8Array {
  assertTypeOf(hex, "string");
  assert(hex.length % 2 === 0, "Invalid hex padding.");

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const j = i * 2;
    const hexByte = hex.slice(j, j + 2);
    const byte = parseInt(hexByte, 16);
    assert(!isNaN(byte) && byte >= 0, "Invalid byte sequence.");

    bytes[i] = byte;
  }

  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  assertInstanceOf(bytes, Uint8Array);

  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += HEXES[bytes[i]];
  }

  return hex;
}

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

export function utf8ToBytes(str: string): Uint8Array {
  assertTypeOf(str, "string");

  return new Uint8Array(new TextEncoder().encode(str)); // https://bugzil.la/1681809
}

export function bytesToUtf8(bytes: Uint8Array): string {
  assertInstanceOf(bytes, Uint8Array);

  return new TextDecoder().decode(bytes);
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
