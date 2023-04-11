import { describe, expect, it } from "vitest";
import {
  areEqual,
  chunk,
  endsWith,
  first,
  hasDuplicates,
  hasDuplicatesBy,
  isEmpty,
  orderBy,
  some,
  startsWith
} from "./arrayUtils";

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
    expect(first(Uint8Array.from([2, 4, 6]))).toBe(2);
  });

  it("Should throw an error if the array is empty", () => {
    expect(() => {
      first([]);
    }).toThrow();
  });
});

describe("hasDuplicates() checker", () => {
  const uniqueNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const uniqueStrings = ["a", "b", "c", "d", "e", "f"];
  const uniqueComplexObjects = [
    { a: 1, b: 2 },
    { a: 3, b: 4 },
    { a: 5, b: 6 },
    { a: 7, b: 8 },
    { a: 9, b: 10 },
    { a: 11, b: 12 },
    { a: 13, b: 14 },
    { a: 15, b: 16 },
    { a: 17, b: 18 }
  ];

  const duplicateNumbers = uniqueNumbers.concat([1, 2]);
  const duplicateStrings = uniqueStrings.concat(["f"]);
  const duplicateComplexObjects = uniqueComplexObjects.concat(uniqueComplexObjects[1]);

  it("Should return false with a duplicate free array", () => {
    expect(hasDuplicates(uniqueNumbers)).toBeFalsy();
    expect(hasDuplicates(uniqueStrings)).toBeFalsy();
    expect(hasDuplicates(uniqueComplexObjects)).toBeFalsy();
  });

  it("Should return true with a duplicate array", () => {
    expect(hasDuplicates(duplicateNumbers)).toBeTruthy();
    expect(hasDuplicates(duplicateStrings)).toBeTruthy();
    expect(hasDuplicates(duplicateComplexObjects)).toBeTruthy();
  });
});

describe("hasDuplicatesBy() checker", () => {
  const complexObjects = [
    { unique: 1, duplicated: 2 },
    { unique: 3, duplicated: 4 },
    { unique: 5, duplicated: 6 },
    { unique: 7, duplicated: 8 },
    { unique: 9, duplicated: 10 },
    { unique: 11, duplicated: 12 },
    { unique: 13, duplicated: 14 },
    { unique: 15, duplicated: 10 },
    { unique: 17, duplicated: 18 }
  ];

  const duplicateComplexObjects = complexObjects.concat(complexObjects[1]);

  it("Should return false with a duplicate free item key", () => {
    expect(hasDuplicatesBy(complexObjects, (x) => x.unique)).toBeFalsy();
  });

  it("Should return true with a duplicate item key", () => {
    expect(hasDuplicatesBy(duplicateComplexObjects, (x) => x.duplicated)).toBeTruthy();
  });
});

describe("Chunk arrays", () => {
  it("Should return n chunked arrays without duplications", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(chunk(array, 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10]
    ]);
    expect(chunk(array, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]);
    expect(chunk(array, 5)).toEqual([
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10]
    ]);
    expect(chunk(array, 10)).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]);
    expect(chunk(array, 20)).toEqual([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]);
  });
});

describe("Array ordering", () => {
  const objects = [
    { a: "x", b: 3 },
    { a: "y", b: 4 },
    { a: "x", b: 1 },
    { a: "y", b: 2 }
  ];

  it("Should not mutate the original array", () => {
    expect(orderBy(objects, (x) => x.a, "asc")).toStrictEqual([
      { a: "x", b: 3 },
      { a: "x", b: 1 },
      { a: "y", b: 4 },
      { a: "y", b: 2 }
    ]);

    expect(objects).toStrictEqual([
      { a: "x", b: 3 },
      { a: "y", b: 4 },
      { a: "x", b: 1 },
      { a: "y", b: 2 }
    ]);
  });

  it("Should order descending", () => {
    expect(orderBy(objects, (x) => x.a, "desc")).toStrictEqual([
      { a: "y", b: 4 },
      { a: "y", b: 2 },
      { a: "x", b: 3 },
      { a: "x", b: 1 }
    ]);

    expect(orderBy(objects, (x) => x.b, "desc")).toStrictEqual([
      { a: "y", b: 4 },
      { a: "x", b: 3 },
      { a: "y", b: 2 },
      { a: "x", b: 1 }
    ]);
  });

  it("Should order ascending", () => {
    expect(orderBy(objects, (x) => x.a, "asc")).toStrictEqual([
      { a: "x", b: 3 },
      { a: "x", b: 1 },
      { a: "y", b: 4 },
      { a: "y", b: 2 }
    ]);

    expect(orderBy(objects, (x) => x.b, "asc")).toStrictEqual([
      { a: "x", b: 1 },
      { a: "y", b: 2 },
      { a: "x", b: 3 },
      { a: "y", b: 4 }
    ]);
  });

  it("Should order ascending by default", () => {
    expect(orderBy(objects, (x) => x.a)).toStrictEqual([
      { a: "x", b: 3 },
      { a: "x", b: 1 },
      { a: "y", b: 4 },
      { a: "y", b: 2 }
    ]);
  });
});

describe("areEqual()", () => {
  it("Should return true for equal arrays", () => {
    const array1 = [1, 2, 4];

    expect(areEqual([], [])).toBeTruthy();
    expect(areEqual(array1, [1, 2, 4])).toBeTruthy();
    expect(areEqual(array1, Uint8Array.from([1, 2, 4]))).toBeTruthy();
    expect(areEqual(array1, array1)).toBeTruthy();
  });

  it("Should return false for not equal arrays", () => {
    const array1 = [1, 2, 4, 5, 0];

    expect(areEqual(array1, [1, 2])).toBeFalsy();
    expect(areEqual(array1, [])).toBeFalsy();
    expect(areEqual(array1, [1, 2, 10, 5, 0])).toBeFalsy();
  });
});

describe("startsWith()", () => {
  it("Should return true if starts with target", () => {
    const array = [1, 2, 4];

    expect(startsWith([], [])).toBeTruthy();
    expect(startsWith(array, [1, 2, 4])).toBeTruthy();
    expect(startsWith(array, [1, 2])).toBeTruthy();
    expect(startsWith(array, Uint8Array.from([1]))).toBeTruthy();
    expect(startsWith(array, array)).toBeTruthy();
  });

  it("Should return false for not starts with target", () => {
    const array = [1, 2, 4, 5, 0];

    expect(startsWith(array, [0, 1, 2])).toBeFalsy();
    expect(startsWith(array, [8])).toBeFalsy();
    expect(startsWith(array, [1, 2, 10, 5, 0, 1])).toBeFalsy();
  });
});

describe("endsWith()", () => {
  it("Should return true if ends with target", () => {
    const array = [1, 2, 4];

    expect(endsWith([], [])).toBeTruthy();
    expect(endsWith(array, [1, 2, 4])).toBeTruthy();
    expect(endsWith(array, [2, 4])).toBeTruthy();
    expect(endsWith(array, Uint8Array.from([4]))).toBeTruthy();
    expect(endsWith(array, array)).toBeTruthy();
  });

  it("Should return false for not ends with target", () => {
    const array = [1, 2, 4, 5, 0];

    expect(endsWith(array, [0, 1, 2])).toBeFalsy();
    expect(endsWith(array, [10, 2, 4, 5, 0])).toBeFalsy();
    expect(endsWith(array, [8])).toBeFalsy();
    expect(endsWith(array, [1, 2, 10, 5, 0, 1])).toBeFalsy();
  });
});
