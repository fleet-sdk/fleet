import { OutputBuilder, SAFE_MIN_BOX_VALUE } from "../../builder/outputBuilder";
import { NotFoundError } from "../../errors";
import { first } from "../../utils/arrayUtils";
import { OutputsCollection } from "./outputsCollection";

describe("outputs collection", () => {
  const address = "9hY16vzHmmfyVBwKeFGHvb2bMFsG94A1u7To1QWtUokACyFVENQ";
  const height = 0;

  it("Should create and empty collection", () => {
    const collection = new OutputsCollection();
    expect(collection.isEmpty).toBeTruthy();
  });

  it("Should create a filled collection", () => {
    const collection = new OutputsCollection([
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height)
    ]);
    expect(collection).toHaveLength(2);
  });

  it("Should add a single item", () => {
    const collection = new OutputsCollection();
    const output = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    collection.add(output);

    expect(collection).toHaveLength(1);
    expect(first(collection.toArray())).toBe(output);
  });

  it("Should add a multiple items", () => {
    const collection = new OutputsCollection();
    const outputs = [
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height)
    ];
    collection.add(outputs);

    expect(collection).toHaveLength(2);
    expect(collection.toArray()).toEqual(outputs);
  });

  it("Should remove by object reference", () => {
    const outputA = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    const outputB = new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height);
    const collection = new OutputsCollection([outputA, outputB]);
    expect(collection).toHaveLength(2);

    collection.remove(outputA);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().includes(outputA)).toBeFalsy();
  });

  it("Should remove by index", () => {
    const outputA = new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height);
    const outputB = new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height);
    const collection = new OutputsCollection([outputA, outputB]);
    expect(collection).toHaveLength(2);

    collection.remove(1);

    expect(collection).toHaveLength(1);
    expect(collection.toArray().includes(outputB)).toBeFalsy();
  });

  it("Should throw if not found", () => {
    const notIncludedOutput = new OutputBuilder(SAFE_MIN_BOX_VALUE * 3n, address, height);

    const collection = new OutputsCollection([
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height)
    ]);

    expect(() => {
      collection.remove(notIncludedOutput);
    }).toThrow(NotFoundError);
  });

  it("Should throw if not found", () => {
    const collection = new OutputsCollection([
      new OutputBuilder(SAFE_MIN_BOX_VALUE, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 2n, address, height),
      new OutputBuilder(SAFE_MIN_BOX_VALUE * 3n, address, height)
    ]);

    expect(() => {
      collection.remove(-1);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(3);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(100);
    }).toThrow(RangeError);
  });
});
