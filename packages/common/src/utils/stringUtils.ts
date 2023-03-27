const HEX_PATTERN = /^[0-9A-Fa-f]+$/s;

export function isHex(value?: string) {
  if (!value) {
    return false;
  }

  return HEX_PATTERN.test(value);
}

/**
 * Get hex string size in bytes
 * @param hex
 * @returns the byte size if the hex string
 */
export function hexSize(hex: string): number {
  return hex.length / 2;
}
