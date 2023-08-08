import { describe, expect, it } from "vitest";
import { SigmaTypeCode } from "./sigmaTypeCode";
import { SBigInt } from "./sigmaTypes";

describe("Sigma types", () => {
  it("Should test SBigInt outputs", () => {
    expect(SBigInt()).toEqual(SigmaTypeCode.BigInt);
    expect(SBigInt(1n)).toEqual({ value: 1n, type: SigmaTypeCode.BigInt });
  });
});
