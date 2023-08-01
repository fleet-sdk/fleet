import { describe, expect, it } from "vitest";
import { bigIntType, SBigInt } from "./sigmaTypes";

describe("Sigma types", () => {
  it("Should test SBigInt outputs", () => {
    expect(SBigInt()).toEqual(bigIntType);
    expect(SBigInt(1n)).toEqual({ value: 1n, type: bigIntType });
  });
});
