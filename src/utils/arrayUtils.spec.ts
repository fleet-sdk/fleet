import { first, isEmpty, some } from "./arrayUtils";

describe("isEmpty() guard", () => {
  it("Should return true if array is undefined or empty", () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  it("Should return true if object contains no props", () => {
    expect(isEmpty({})).toBe(true);
  });

  it("Should return false if object contains at least one prop", () => {
    expect(isEmpty({ test: undefined })).toBe(false);
    expect(isEmpty({ foo: true, bar: false })).toBe(false);
  });

  it("Should return false if array contains elements", () => {
    expect(isEmpty([1, 2, 4])).toBe(false);
    expect(isEmpty([1])).toBe(false);
  });
});

describe("some() guard", () => {
  it("Should return false if array is undefined or empty", () => {
    expect(some([])).toBe(false);
    expect(some(undefined)).toBe(false);
  });

  it("Should return false if object contains no props", () => {
    expect(some({})).toBe(false);
  });

  it("Should return true if object contains at least one prop", () => {
    expect(some({ test: undefined })).toBe(true);
    expect(some({ foo: true, bar: false })).toBe(true);
  });

  it("Should return true if array contains elements", () => {
    expect(some([1, 2, 4])).toBe(true);
    expect(some([1])).toBe(true);
  });
});

describe("fist() fetcher", () => {
  it("Should return first element of the array", () => {
    expect(first([4, 5, 1])).toBe(4);
  });

  it("Should return undefined if the array is undefined", () => {
    expect(first(undefined)).toBeUndefined();
  });

  it("Should return number if the array is a Buffer", () => {
    expect(first(Buffer.from([2, 4, 6]))).toBe(2);
  });

  it("Should throw an error if the array is empty", () => {
    expect(() => {
      first([]);
    }).toThrow();
  });
});
