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
