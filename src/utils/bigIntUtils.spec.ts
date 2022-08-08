import { toBigInt } from "./bigIntUtils";

describe("BigInt utils", () => {
  it("Should convert arbitrary types to bigint", () => {
    expect(toBigInt("1298379183")).toBe(1298379183n);
    expect(toBigInt(10)).toBe(10n);
    expect(toBigInt(true)).toBe(1n);
  });

  it("Should bypass conversion when using an bigint as argument", () => {
    expect(toBigInt(1298379183)).toBe(1298379183n);
  });
});
