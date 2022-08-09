import { first, isEmpty } from "./arrayUtils";

describe("isEmpty() guard", () => {
  it("Should return true if array is undefined or empty", () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it("Should return false if array contains elements", () => {
    expect(isEmpty([1, 2, 4])).toBe(false);
    expect(isEmpty([1])).toBe(false);
  });
});

describe("fist() fetcher", () => {
  it("Should return first element of the array", () => {
    expect(first([4, 5, 1])).toBe(4);
  });

  it("Should return undefined if the array is undefined", () => {
    expect(first(undefined)).toBeUndefined();
  });

  it("Should throw an error if the array is empty", () => {
    expect(() => {
      first([]);
    }).toThrow();
  });
});
