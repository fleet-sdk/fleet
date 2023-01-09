import {
  invalidBoxesMock,
  manyTokensBoxesMock,
  outOfOrderRegistersBox,
  regularBoxesMock,
  validBoxesMock
} from "../tests/mocks/mockBoxes";
import { ErgoBox } from "./ergoBox";

describe("Construction", () => {
  it("Should construct from a vanilla object", () => {
    for (const box of regularBoxesMock) {
      const ergoBox = new ErgoBox(box);

      expect(ergoBox.boxId).toBe(box.boxId);
      expect(ergoBox.value).toBe(box.value);
      expect(ergoBox.ergoTree).toBe(box.ergoTree);
      expect(ergoBox.assets).toEqual(box.assets);
      expect(ergoBox.creationHeight).toBe(box.creationHeight);
      expect(ergoBox.additionalRegisters).toBe(box.additionalRegisters);
      expect(ergoBox.transactionId).toBe(box.transactionId);
      expect(ergoBox.index).toBe(box.index);
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

    expect(new ErgoBox(outOfOrderRegistersBox).isValid()).toBeTruthy();
  });

  it("Should not validate invalid boxes", () => {
    for (const box of invalidBoxesMock) {
      expect(ErgoBox.validate(box)).toBeFalsy();
      expect(new ErgoBox(box).isValid()).toBeFalsy();
    }
  });
});
