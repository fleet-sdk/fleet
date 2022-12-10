import { Collection } from "./collection";

class MockCollection extends Collection<number, number> {
  constructor() {
    super();
  }

  protected override _addOne(numb: number) {
    this._items.push(numb);

    return this.length;
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

  it("Should iterate correctly for all items", () => {
    const collection = new MockCollection();
    expect(collection.isEmpty).toBeTruthy();

    collection.add(numbers);

    let counter = 0;
    for (const n of collection) {
      expect(n).toBe(numbers[counter++]);
    }
  });
});
