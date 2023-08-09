import { first } from "@fleet-sdk/common";
import { DuplicateInputError, ErgoBox, NotFoundError } from "@fleet-sdk/core";
import { regularBoxes } from "_test-vectors";
import { describe, expect, it } from "vitest";
import { MockUTxOCollection } from "./mockUtxoCollection";

describe("UTxO Collection", () => {
  it("Should create and empty collection", () => {
    const collection = new MockUTxOCollection();
    expect(collection.isEmpty).toBeTruthy();
  });

  it("Should create a filled collection", () => {
    const collection = new MockUTxOCollection(regularBoxes);
    expect(collection).toHaveLength(regularBoxes.length);
    expect(collection.some((x) => x.boxId === regularBoxes[0].boxId));
  });

  it("Should clear a collection", () => {
    const collection = new MockUTxOCollection(regularBoxes);
    expect(collection).toHaveLength(regularBoxes.length);

    collection.clear();
    expect(collection).to.have.length(0);
  });

  it("Should add a single item", () => {
    const collection = new MockUTxOCollection();
    const box = first(regularBoxes);
    collection.add(box);

    expect(collection).toHaveLength(1);
    expect(first(collection.toArray()).boxId).toBe(box.boxId);
  });

  it("Should append items", () => {
    const collection = new MockUTxOCollection();
    collection.add(regularBoxes);

    expect(collection).toHaveLength(regularBoxes.length);
    expect(collection.toArray()).toEqual(regularBoxes);
  });

  it("Should accept BoxCandidate and transform in a complete Box", () => {
    const collection = new MockUTxOCollection();

    const candidate = {
      ergoTree: "0008cd03a621f820dbed198b42a2dca799a571911f2dabbd2e4d441c9aad558da63f084d",
      creationHeight: 804138,
      value: "1000000000",
      assets: [
        {
          tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
          amount: "10"
        }
      ],
      additionalRegisters: {}
    };

    collection.add(candidate);
    expect(collection).to.have.length(1);

    const box = collection.at(0);
    expect(box.boxId).not.to.be.undefined;
    expect(box.index).not.to.be.undefined;
    expect(box.transactionId).not.to.be.undefined;

    expect(ErgoBox.validate(box)).to.be.true;
  });

  it("Should throw if box is already included", () => {
    const collection = new MockUTxOCollection(regularBoxes);
    expect(() => {
      collection.add(first(regularBoxes));
    }).toThrow(DuplicateInputError);
  });

  it("Should remove by boxId", () => {
    const collection = new MockUTxOCollection(regularBoxes);
    const boxId = first(regularBoxes).boxId;
    collection.remove(boxId);

    expect(collection).toHaveLength(regularBoxes.length - 1);
    expect(collection.toArray().find((x) => x.boxId === boxId)).toBeFalsy();
  });

  it("Should remove by index", () => {
    const collection = new MockUTxOCollection(regularBoxes);
    const boxId = first(regularBoxes).boxId;
    collection.remove(0);

    expect(collection).toHaveLength(regularBoxes.length - 1);
    expect(collection.toArray().find((x) => x.boxId === boxId)).toBeFalsy();
  });

  it("Should throw if not found", () => {
    const collection = new MockUTxOCollection(first(regularBoxes));
    const boxId = regularBoxes[1].boxId;

    expect(() => {
      collection.remove(boxId);
    }).toThrow(NotFoundError);
  });

  it("Should throw if not found", () => {
    const collection = new MockUTxOCollection(regularBoxes);

    expect(() => {
      collection.remove(-1);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(regularBoxes.length);
    }).toThrow(RangeError);

    expect(() => {
      collection.remove(100);
    }).toThrow(RangeError);
  });
});
