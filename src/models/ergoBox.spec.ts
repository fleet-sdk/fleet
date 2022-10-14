import {
  invalidBoxesMock,
  manyTokensBoxesMock,
  regularBoxesMock,
  validBoxesMock
} from "../mocks/mockBoxes";
import { ErgoBox } from "./ergoBox";

describe("Construction", () => {
  it("Should construct from a vanilla object", () => {
    for (const box of regularBoxesMock) {
      expect(new ErgoBox(box).toVanillaObject()).toEqual({
        boxId: box.boxId,
        value: box.value.toString(),
        ergoTree: box.ergoTree,
        assets: box.assets.map((x) => ({ tokenId: x.tokenId, amount: x.amount.toString() })),
        creationHeight: box.creationHeight,
        additionalRegisters: box.additionalRegisters,
        transactionId: box.transactionId,
        index: box.index
      });
    }
  });
});

describe("Validation", () => {
  it("Should validate valid boxes", () => {
    for (const box of regularBoxesMock) {
      expect(ErgoBox.validate(box)).toBeTruthy();
    }

    for (const box of manyTokensBoxesMock) {
      expect(ErgoBox.validate(box)).toBeTruthy();
    }

    for (const box of validBoxesMock) {
      expect(new ErgoBox(box).isValid()).toBeTruthy();
    }
  });

  it("Should not validate invalid boxes", () => {
    for (const box of invalidBoxesMock) {
      expect(ErgoBox.validate(box)).toBeFalsy();
      expect(new ErgoBox(box).isValid()).toBeFalsy();
    }
  });
});
