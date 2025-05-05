import { describe, expect, it } from "vitest";
import {
  areEqual,
  areEqualBy,
  at,
  chunk,
  depthOf,
  endsWith,
  first,
  hasDuplicates,
  hasDuplicatesBy,
  last,
  orderBy,
  startsWith,
  uniq,
  uniqBy
} from "./array";

describe("fist()", () => {
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

describe("last()", () => {
  it("Should return last element of the array", () => {
    expect(last([4, 5, 1])).toBe(1);
  });

  it("Should return undefined if the array is undefined", () => {
    expect(last(undefined)).toBeUndefined();
  });

  it("Should return number if the array is a Buffer", () => {
    expect(last(Uint8Array.from([2, 4, 6]))).toBe(6);
  });

  it("Should throw an error if the array is empty", () => {
    expect(() => {
      last([]);
    }).toThrow();
  });
});

describe("at()", () => {
  it("Should return n element of the array", () => {
    expect(at([4, 5, 1], 0)).toBe(4);
    expect(at([4, 5, 1], 1)).toBe(5);
    expect(at([4, 5, 1], 2)).toBe(1);

    expect(at([4, 5, 1], -3)).toBe(4);
    expect(at([4, 5, 1], -2)).toBe(5);
    expect(at([4, 5, 1], -1)).toBe(1);
  });

  it("Should return undefined if the array is undefined", () => {
    expect(at(undefined, 1)).toBeUndefined();
  });

  it("Should return number if the array is a Buffer", () => {
    expect(at(Uint8Array.from([2, 4, 6]), 2)).toBe(6);
  });

  it("Should return undefined if index is out of bounds", () => {
    expect(at([2, 4, 6], 10)).to.be.undefined;
    expect(at([2, 4, 6], -10)).to.be.undefined;
    expect(at([2, 4, 6], -10)).to.be.undefined;
    expect(at([], 1)).to.be.undefined;
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

  it("Should return empty array if the input is empty", () => {
    expect(chunk([], 2)).toEqual([]);
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

describe("areEqualBy()", () => {
  const array1 = [
    { a: "x", b: 3 },
    { a: "x", b: 1 },
    { a: "y", b: 4 },
    { a: "y", b: 2 }
  ];

  const array2 = [
    { a: "x", b: 3 },
    { a: "x", b: 1 },
    { a: "y", b: 400 }, // b is different than array1[2].b, but a is equal
    { a: "y", b: 2 }
  ];

  it("Should return true for equal array items and false for different ones", () => {
    expect(areEqual(array1, array2)).to.be.false; // arrays are different but properties can be equal

    expect(areEqualBy(array1, array2, (item) => item.a)).to.be.true;
    expect(areEqualBy(array1, array2, (item) => item.b)).to.be.false;
  });

  it("Should return true without comparing items if the same array is compared", () => {
    expect(areEqualBy(array1, array1, (item) => item.a)).to.be.true;
    expect(areEqualBy(array1, array1, (item) => item.b)).to.be.true;
  });

  it("Should return false without comparing items different array lengths are passed", () => {
    const array3 = [
      { a: "x", b: 3 },
      { a: "x", b: 1 }
    ];

    expect(areEqualBy(array1, array3, (item) => item.a)).to.be.false;
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

  it("Should return true if starts with target with offset", () => {
    //      index: 0, 1, 2, 3, 4, 5, 6, 7
    const array = [1, 2, 4, 5, 6, 7, 8, 9];

    expect(startsWith(array, [2, 4], 1)).toBeTruthy();
    expect(startsWith(array, [6, 7], 4)).toBeTruthy();
    expect(startsWith(array, [9, 10], 7)).toBeFalsy();
    expect(startsWith(array, [1], 0)).toBeTruthy();
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

describe("uniq()", () => {
  const array1 = [1, 2, 0, 0, 1, 4, 5, 6, 7, 7, 8, 8, 2];

  it("Should return a unique arrays", () => {
    expect(uniq(array1)).to.be.deep.equal([1, 2, 0, 4, 5, 6, 7, 8]);

    const uniqArray = [1, 2, 3, 4];
    expect(uniq(uniqArray)).to.be.deep.equal([1, 2, 3, 4]);

    expect(uniq([])).to.be.deep.equal([]);
  });

  it("Should roundtrip with hasDuplicates()", () => {
    expect(hasDuplicates(uniq(array1))).to.be.false;
  });
});

describe("uniqBy()", () => {
  const objectArray1 = [
    { a: "x", b: 3 },
    { a: "x", b: 1 },
    { a: "y", b: 4 },
    { a: "y", b: 2 }
  ];

  it("Should return unique arrays from selected property", () => {
    const array1 = [
      { a: "x", b: 3 },
      { a: "x", b: 1 },
      { a: "y", b: 4 },
      { a: "y", b: 2 }
    ];

    expect(uniqBy(array1, (x) => x.a, "keep-first")).to.be.deep.equal([
      { a: "x", b: 3 },
      { a: "y", b: 4 }
    ]);

    expect(uniqBy(array1, (x) => x.a, "keep-last")).to.be.deep.equal([
      { a: "x", b: 1 },
      { a: "y", b: 2 }
    ]);

    expect(uniqBy([], (x) => x)).to.be.deep.equal([]);
  });

  it("Should keep first by default", () => {
    expect(uniqBy(objectArray1, (x) => x.a)).to.be.deep.equal(
      uniqBy(objectArray1, (x) => x.a, "keep-first")
    );
  });

  it("Should roundtrip with hasDuplicatesBy()", () => {
    expect(
      hasDuplicatesBy(
        uniqBy(objectArray1, (x) => x.a),
        (x) => x.a
      )
    ).to.be.false;

    expect(
      hasDuplicatesBy(
        uniqBy(objectArray1, (x) => x.b),
        (x) => x.b
      )
    ).to.be.false;

    expect(
      hasDuplicatesBy(
        uniqBy(objectArray1, (x) => x.b),
        (x) => x.a
      )
    ).to.be.true;
  });
});

describe("depthOf()", () => {
  it("Should count depth of arrays", () => {
    expect(depthOf([])).to.be.equal(1);
    expect(depthOf([[]])).to.be.equal(2);
    expect(depthOf([[[], []]])).to.be.equal(3);
    expect(depthOf([[[[], [], []]]])).to.be.equal(4);
    expect(depthOf([[[[], [[[]]]]]])).to.be.equal(6);

    expect(depthOf({})).to.be.equal(0);
    expect(depthOf(1)).to.be.equal(0);
    expect(depthOf(undefined)).to.be.equal(0);
    expect(depthOf(null)).to.be.equal(0);
  });
});
