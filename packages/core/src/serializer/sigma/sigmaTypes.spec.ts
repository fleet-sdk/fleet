import { describe, expect, it } from "vitest";
import { SBigInt, SBigIntType } from "./sigmaTypes";

describe("Sigma types", () => {
  it("Should test SBigInt outputs", () => {
    expect(SBigInt()).toEqual(SBigIntType);
    expect(SBigInt(1n)).toEqual({ value: 1n, type: SBigIntType });
  });
});
