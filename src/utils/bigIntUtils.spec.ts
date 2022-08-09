import { sumBy, toBigInt } from "./bigIntUtils";

describe("BigInt toBigInt() conversion", () => {
  it("Should convert arbitrary types to bigint", () => {
    expect(toBigInt("1298379183")).toBe(1298379183n);
    expect(toBigInt(10)).toBe(10n);
    expect(toBigInt(true)).toBe(1n);
  });

  it("Should bypass conversion when using an bigint as argument", () => {
    expect(toBigInt(1298379183n)).toBe(1298379183n);
  });
});

describe("BigInt sumBy()", () => {
  it("Should sum filled array", () => {
    const values = [
      { value: 10n },
      { value: 12313n },
      { value: 45n },
      { value: 435345n },
      { value: 3545n },
      { value: 659n },
      { value: 9558n }
    ];

    expect(sumBy(values, (x) => x.value)).toEqual(461475n);
  });

  it("Should return zero if the array is empty", () => {
    const values: { value: bigint }[] = [];

    expect(sumBy(values, (x) => x.value)).toEqual(0n);
  });
});
