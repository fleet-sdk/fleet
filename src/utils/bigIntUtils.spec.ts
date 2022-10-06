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
  const values = [
    { key: 1, value: 10n },
    { key: 2, value: 12313n },
    { key: 3, value: 45n },
    { key: 4, value: 435345n },
    { key: 5, value: 3545n },
    { key: 6, value: 659n },
    { key: 7, value: 9558n }
  ];
  // 448317n
  it("Should sum filled array", () => {
    expect(sumBy(values, (x) => x.value)).toBe(461475n);
  });

  it("Should return zero if the array is empty", () => {
    const values: { value: bigint }[] = [];

    expect(sumBy(values, (x) => x.value)).toBe(0n);
  });

  it("Should sum conditionally", () => {
    expect(
      sumBy(
        values,
        (x) => x.value,
        (x) => x.key > 0
      )
    ).toBe(461475n);

    expect(
      sumBy(
        values,
        (x) => x.value,
        (x) => x.key < 0
      )
    ).toBe(0n);

    expect(
      sumBy(
        values,
        (x) => x.value,
        (x) => x.key % 2 === 0
      )
    ).toBe(448317n);

    expect(
      sumBy(
        values,
        (x) => x.value,
        (x) => x.key % 2 !== 0
      )
    ).toBe(13158n);
  });
});
