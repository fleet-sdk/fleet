import { describe, expect, it } from "vitest";
import { regularBoxesMock } from "../tests/mocks/mockBoxes";
import { ErgoUnsignedInput } from "./ergoUnsignedInput";

describe("Construction", () => {
  it("Should construct from a vanilla object", () => {
    for (const box of regularBoxesMock) {
      const input = new ErgoUnsignedInput(box);

      expect(input.boxId).toBe(box.boxId);
      expect(input.value).toBe(box.value);
      expect(input.ergoTree).toBe(box.ergoTree);
      expect(input.assets).toEqual(box.assets);
      expect(input.creationHeight).toBe(box.creationHeight);
      expect(input.additionalRegisters).toBe(box.additionalRegisters);
      expect(input.transactionId).toBe(box.transactionId);
      expect(input.index).toBe(box.index);
      expect(input.extension).toBeUndefined();
    }
  });
});

describe("Tweaking", () => {
  it("Should set extension", () => {
    const input = new ErgoUnsignedInput(regularBoxesMock[0]);
    input.setContextVars({ 0: "0402", 1: "0580c0fc82aa02" });

    expect(input.extension).toEqual({ 0: "0402", 1: "0580c0fc82aa02" });
  });
});

describe("Unsigned input object conversion", () => {
  it("Should convert to default unsigned input object and set empty extension", () => {
    for (const box of regularBoxesMock) {
      expect(new ErgoUnsignedInput(box).toUnsignedInputObject("default")).toEqual({
        boxId: box.boxId,
        extension: {}
      });
    }
  });

  it("Should convert to default unsigned input object and set map extension content", () => {
    for (const box of regularBoxesMock) {
      expect(
        new ErgoUnsignedInput(box)
          .setContextVars({ 0: "0580c0fc82aa02" })
          .toUnsignedInputObject("default")
      ).toEqual({
        boxId: box.boxId,
        extension: { 0: "0580c0fc82aa02" }
      });
    }
  });

  it("Should convert to EIP-12 unsigned input object and set map extension content", () => {
    for (const box of regularBoxesMock) {
      expect(
        new ErgoUnsignedInput(box)
          .setContextVars({ 0: "0580c0fc82aa02" })
          .toUnsignedInputObject("EIP-12")
      ).toEqual({
        boxId: box.boxId,
        value: box.value.toString(),
        ergoTree: box.ergoTree,
        assets: box.assets.map((x) => ({ tokenId: x.tokenId, amount: x.amount.toString() })),
        creationHeight: box.creationHeight,
        additionalRegisters: box.additionalRegisters,
        transactionId: box.transactionId,
        index: box.index,
        extension: { 0: "0580c0fc82aa02" }
      });
    }
  });
});

describe("Unsigned data input object conversion", () => {
  it("Should convert to default data input object and set empty extension", () => {
    for (const box of regularBoxesMock) {
      expect(new ErgoUnsignedInput(box).toPlainObject("default")).toEqual({
        boxId: box.boxId
      });
    }
  });

  it("Should ignore context vars", () => {
    for (const box of regularBoxesMock) {
      expect(
        new ErgoUnsignedInput(box).setContextVars({ 0: "0580c0fc82aa02" }).toPlainObject("default")
      ).toEqual({
        boxId: box.boxId
      });
    }
  });

  it("Should convert to EIP-12 unsigned input object and ignore extension content", () => {
    for (const box of regularBoxesMock) {
      expect(
        new ErgoUnsignedInput(box).setContextVars({ 0: "0580c0fc82aa02" }).toPlainObject("EIP-12")
      ).toEqual({
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
