import { assertInstanceOf } from ".";

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

const HEX_PATTERN = /^[0-9a-fA-F]+$/;

export function isHex(value?: string): boolean {
  if (!value || value.length % 2 !== 0) return false;
  return HEX_PATTERN.test(value);
}

/**
 * Get hex string size in bytes
 * @param hex
 * @returns the byte size if the hex string
 */
export function byteSizeOf(hex: string): number {
  return hex.length / 2;
}
