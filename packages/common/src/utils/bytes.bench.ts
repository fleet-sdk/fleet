import { bench, describe } from "vitest";
import { isHex } from "./bytes";

const HEX_PATTERN = /^[0-9A-Fa-f]+$/s;
function isHexRegex(value?: string) {
  if (!value || value.length % 2) return false;
  return HEX_PATTERN.test(value);
}

const HEX_CHARSET = new Set("0123456789abcdefABCDEF");
function isHexChar(value: string) {
  if (!value || value.length % 2) return false;

  const valueSet = new Set(value);
  for (const c of valueSet) {
    if (!HEX_CHARSET.has(c)) return false;
  }

  return true;
}

describe("Hex string checking", () => {
  const validHex = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7";
  const invalidHex = "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7tt";

  bench("Using charset", () => {
    isHexChar(validHex);
    isHexChar(invalidHex);
  });

  bench("Using regex", () => {
    isHexRegex(validHex);
    isHexRegex(invalidHex);
  });

  bench("Using number constructor", () => {
    isHex(validHex);
    isHex(invalidHex);
  });
});
