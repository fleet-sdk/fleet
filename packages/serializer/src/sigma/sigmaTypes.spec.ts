import { describe, expect, it } from "vitest";
import { SBigInt, sDescriptors } from "./sigmaTypes";

describe("Sigma types", () => {
  it("Should test SBigInt outputs", () => {
    expect(SBigInt()).toEqual(sDescriptors.bigInt);
    expect(SBigInt(1n)).to.deep.include({ value: 1n, type: sDescriptors.bigInt });
  });
});
