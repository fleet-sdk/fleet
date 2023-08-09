import { first } from "@fleet-sdk/common";
import { regularBoxesMock } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { DuplicateInputError, NotFoundError } from "../../errors";
import { InputsCollection } from "./inputsCollection";

describe("inputs collection", () => {
  it("Should create and empty collection", () => {
    const collection = new InputsCollection();
    expect(collection.isEmpty).toBeTruthy();
  });

  it("Should create a filled collection", () => {
    const collection = new InputsCollection(regularBoxesMock);
    expect(collection).toHaveLength(regularBoxesMock.length);
  });

  it("Should add a single item", () => {
    const collection = new InputsCollection();
    const box = first(regularBoxesMock);
    collection.add(box);

    expect(collection).toHaveLength(1);
    expect(first(collection.toArray()).boxId).toBe(box.boxId);
  });

  it("Should append items", () => {
    const collection = new InputsCollection();
    collection.add(regularBoxesMock);

    expect(collection).toHaveLength(regularBoxesMock.length);
    expect(collection.toArray()).toEqual(regularBoxesMock);
  });

  it("Should add a multiple items and map properly", () => {
    const collection = new InputsCollection();

    // include boxes with amounts as string
    collection.add(
      regularBoxesMock.map((box) => {
        return {
          ...box,
          value: box.value.toString(),
          assets: box.assets.map((asset) => {
            return { tokenId: asset.tokenId, amount: asset.amount.toString() };
          })
        };
      })
    );

    expect(collection).toHaveLength(regularBoxesMock.length);
    expect(collection.toArray()).toEqual(regularBoxesMock);
  });

  it("Should throw if box is already included", () => {
    const collection = new InputsCollection(regularBoxesMock);
    expect(() => {
      collection.add(first(regularBoxesMock));
    }).toThrow(DuplicateInputError);
  });

  it("Should remove by boxId", () => {
    const collection = new InputsCollection(regularBoxesMock);
    const boxId = first(regularBoxesMock).boxId;
    collection.remove(boxId);

    expect(collection).toHaveLength(regularBoxesMock.length - 1);
    expect(collection.toArray().find((x) => x.boxId === boxId)).toBeFalsy();
  });

  it("Should remove by index", () => {
    const collection = new InputsCollection(regularBoxesMock);
    const boxId = first(regularBoxesMock).boxId;
    collection.remove(0);

    expect(collection).toHaveLength(regularBoxesMock.length - 1);
    expect(collection.toArray().find((x) => x.boxId === boxId)).toBeFalsy();
  });

  it("Should throw if not found", () => {
    const collection = new InputsCollection(first(regularBoxesMock));
    const boxId = regularBoxesMock[1].boxId;

    expect(() => {
      collection.remove(boxId);
    }).toThrow(NotFoundError);
  });

  it("Should throw if not found", () => {
    const collection = new InputsCollection(regularBoxesMock);

    expect(() => {
      collection.remove(-1);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(regularBoxesMock.length);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(100);
    }).toThrow(RangeError);
  });
});
