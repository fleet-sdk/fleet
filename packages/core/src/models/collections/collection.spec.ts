import { describe, expect, it } from "vitest";
import { Collection } from "./collection";

class MockCollection extends Collection<number, number> {
  constructor() {
    super();
  }

  protected override _map(item: number): number {
    return item;
  }

  public remove(item: number): number {
    throw Error("Not implemented for " + item);
  }
}

describe("collection base", () => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  it("Should create an empty collection", () => {
    const collection = new MockCollection();
    expect(collection).toHaveLength(0);
    expect(collection.isEmpty).toBeTruthy();
  });

  it("Should add items", () => {
    const collection = new MockCollection();
    collection.add(1);
    collection.add([2, 3]);

    expect(collection).toHaveLength(3);
    expect(collection.at(0)).toBe(1);
    expect(collection.at(1)).toBe(2);
    expect(collection.at(2)).toBe(3);
  });

  it("Should place one item at a specific index", () => {
    const collection = new MockCollection();
    collection.add([1, 2, 3]);

    collection.add(5, { index: 0 });

    expect(collection).toHaveLength(4);
    expect(collection.at(0)).toBe(5);
    expect(collection.at(1)).toBe(1);
    expect(collection.at(2)).toBe(2);
    expect(collection.at(3)).toBe(3);
  });

  it("Should not fail when trying to place at index == Collection.length", () => {
    const collection = new MockCollection();

    collection.add(5, { index: 0 });
    collection.add(6, { index: 1 });

    expect(collection).toHaveLength(2);
    expect(collection.at(0)).toBe(5);
    expect(collection.at(1)).toBe(6);
  });

  it("Should should fail when trying to add out of range", () => {
    const collection = new MockCollection();

    expect(() => {
      collection.add(5, { index: 1 });
    }).toThrow(RangeError);

    expect(() => {
      collection.add(5, { index: 2 });
    }).toThrow(RangeError);
  });

  it("Should place multiple items at a specific index", () => {
    const collection = new MockCollection();
    collection.add([1, 2, 3]);

    collection.add([10, 20], { index: 2 });

    expect(collection).toHaveLength(5);
    expect(collection.at(0)).toBe(1);
    expect(collection.at(1)).toBe(2);
    expect(collection.at(2)).toBe(10);
    expect(collection.at(3)).toBe(20);
    expect(collection.at(4)).toBe(3);
  });

  it("Should create a copy of the internal array", () => {
    const collection = new MockCollection();
    collection.add(numbers);

    expect(collection).toHaveLength(numbers.length);
    expect(collection.toArray()).toHaveLength(numbers.length);
    expect(collection.toArray()).toEqual(numbers);
    expect(collection.toArray()).not.toBe(collection.toArray()); // should create a copy every time it's called

    const array = collection.toArray();
    expect(array).toHaveLength(numbers.length);

    array.push(429);
    expect(collection).toHaveLength(numbers.length); // push on previous line should not affect internal array.
  });

  it("Should get items by index", () => {
    const collection = new MockCollection();
    collection.add(numbers);

    for (let i = 0; i < numbers.length; i++) {
      expect(collection.at(i)).toEqual(numbers[i]);
    }
  });

  it("Should fail when trying to get item out of index range", () => {
    const collection = new MockCollection();
    collection.add(numbers);

    expect(() => {
      collection.at(collection.length + 1);
    }).toThrow(RangeError);
  });

  it("Should iterate correctly for all items", () => {
    const collection = new MockCollection();
    expect(collection.isEmpty).toBeTruthy();

    collection.add(numbers);

    let counter = 0;
    for (const n of collection) {
      expect(n).toBe(numbers[counter++]);
    }
  });

  it("Should reduce", () => {
    const collection = new MockCollection();
    collection.add([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect(collection.reduce((acc, curr) => (acc += curr), 0)).toBe(45);
  });
});
