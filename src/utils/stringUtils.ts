const HEX_PATTERN = /^[0-9A-Fa-f]+$/s;

export function isHex(value?: string) {
  if (!value) {
    return false;
  }

  return HEX_PATTERN.test(value);
}
