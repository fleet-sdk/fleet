import type { Amount, Box, BoxCandidate, NonMandatoryRegisters } from "@fleet-sdk/common";
import {
  invalidBoxes,
  manyTokensBoxes,
  outOfOrderRegistersBox,
  regularBoxes,
  validBoxes
} from "_test-vectors";
import { describe, expect, it, test } from "vitest";
import { ErgoBox } from "./ergoBox";

describe("Construction", () => {
  test.each(regularBoxes)("Should construct from a vanilla object", (tv) => {
    const ergoBox = new ErgoBox(tv);

    expect(ergoBox.boxId).toBe(tv.boxId);
    expect(ergoBox.value).toBe(tv.value);
    expect(ergoBox.ergoTree).toBe(tv.ergoTree);
    expect(ergoBox.assets).toEqual(tv.assets);
    expect(ergoBox.creationHeight).toBe(tv.creationHeight);
    expect(ergoBox.additionalRegisters).toBe(tv.additionalRegisters);
    expect(ergoBox.transactionId).toBe(tv.transactionId);
    expect(ergoBox.index).toBe(tv.index);
  });

  test.each(regularBoxes)("Should construct from a candidate and compute boxId", (tv) => {
    const ergoBox = new ErgoBox(boxToCandidate(tv), tv.transactionId, tv.index);

    expect(ergoBox.boxId).to.be.equal(tv.boxId);
    expect(ergoBox.transactionId).to.be.equal(tv.transactionId);
    expect(ergoBox.index).to.be.equal(tv.index);
  });

  test.each(regularBoxes)("Should construct from an ErgoBox candidate", (tv) => {
    const ergoBox = new ErgoBox(new ErgoBox(tv), tv.transactionId, tv.index);

    expect(ergoBox.boxId).to.be.equal(tv.boxId);
    expect(ergoBox.transactionId).to.be.equal(tv.transactionId);
    expect(ergoBox.index).to.be.equal(tv.index);
  });

  it("Should throw if transactionId or index is not provided for box candidate", () => {
    const box = regularBoxes[0];
    const candidate = boxToCandidate(box);

    expect(() => new ErgoBox(candidate, undefined as unknown as string, box.index)).to.throw(
      "TransactionId and Index must be provided for Box generation."
    );

    expect(
      () => new ErgoBox(candidate, box.transactionId, undefined as unknown as number)
    ).to.throw("TransactionId and Index must be provided for Box generation.");
  });
});

describe("Validation", () => {
  it("Should validate valid boxes", () => {
    for (const box of regularBoxes) {
      expect(ErgoBox.validate(box)).toBeTruthy();
    }

    for (const box of manyTokensBoxes) {
      expect(ErgoBox.validate(box)).toBeTruthy();
      new ErgoBox(box);
    }

    for (const box of validBoxes) {
      expect(new ErgoBox<NonMandatoryRegisters>(box).isValid()).toBeTruthy();
    }

    expect(new ErgoBox(outOfOrderRegistersBox).isValid()).toBeTruthy();
  });

  it("Should not validate invalid boxes", () => {
    for (const box of invalidBoxes) {
      expect(ErgoBox.validate(box)).toBeFalsy();
      expect(new ErgoBox<NonMandatoryRegisters>(box).isValid()).toBeFalsy();
    }
  });
});

function boxToCandidate(tv: Box<bigint>): BoxCandidate<Amount, NonMandatoryRegisters> {
  return {
    value: tv.value,
    ergoTree: tv.ergoTree,
    creationHeight: tv.creationHeight,
    assets: tv.assets,
    additionalRegisters: tv.additionalRegisters
  };
}
