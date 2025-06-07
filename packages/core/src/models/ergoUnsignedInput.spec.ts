import { SBool } from "@fleet-sdk/serializer";
import { regularBoxes } from "_test-vectors";
import { ErgoBox } from "packages/core/dist";
import { describe, expect, it, test } from "vitest";
import { ErgoUnsignedInput } from "./ergoUnsignedInput";

describe("Construction", () => {
  test.each(regularBoxes)("Should construct from a vanilla object", (box) => {
    const input = new ErgoUnsignedInput(box);

    expect(input.boxId).toBe(box.boxId);
    expect(input.value).toBe(box.value);
    expect(input.ergoTree).toBe(box.ergoTree);
    expect(input.assets).toEqual(box.assets);
    expect(input.creationHeight).toBe(box.creationHeight);
    expect(input.additionalRegisters).toBe(box.additionalRegisters);
    expect(input.transactionId).toBe(box.transactionId);
    expect(input.index).toBe(box.index);
    expect(input.extension).to.be.deep.equal({});
  });

  test.each(regularBoxes)("Should construct from a ErgoBox object", (box) => {
    const input = new ErgoUnsignedInput(new ErgoBox(box));

    expect(input.boxId).toBe(box.boxId);
    expect(input.value).toBe(box.value);
    expect(input.ergoTree).toBe(box.ergoTree);
    expect(input.assets).toEqual(box.assets);
    expect(input.creationHeight).toBe(box.creationHeight);
    expect(input.additionalRegisters).toBe(box.additionalRegisters);
    expect(input.transactionId).toBe(box.transactionId);
    expect(input.index).toBe(box.index);
    expect(input.extension).to.be.deep.equal({});
  });
});

describe("Tweaking", () => {
  it("Should set extension", () => {
    const input = new ErgoUnsignedInput(regularBoxes[0]);
    input.setContextExtension({
      0: "0402",
      1: "0580c0fc82aa02",
      2: undefined,
      3: SBool(true)
    });

    expect(input.extension).toEqual({
      0: "0402",
      1: "0580c0fc82aa02",
      3: "0101"
    });

    input.setContextVars({ 0: SBool(false) }); // replace existing value at 0 and keep others
    expect(input.extension).toEqual({ 0: "0100", 1: "0580c0fc82aa02", 3: "0101" });
  });
});

describe("Unsigned input object conversion", () => {
  it("Should convert to default unsigned input object and set empty extension", () => {
    for (const box of regularBoxes) {
      expect(new ErgoUnsignedInput(box).toPlainObject("minimal")).toEqual({
        boxId: box.boxId,
        extension: {}
      });
    }
  });

  it("Should convert to default unsigned input object and set map extension content", () => {
    for (const box of regularBoxes) {
      expect(
        new ErgoUnsignedInput(box)
          .setContextExtension({ 0: "0580c0fc82aa02" })
          .toPlainObject("minimal")
      ).toEqual({
        boxId: box.boxId,
        extension: { 0: "0580c0fc82aa02" }
      });
    }
  });

  it("Should convert to EIP-12 unsigned input object and set map extension content", () => {
    for (const box of regularBoxes) {
      expect(
        new ErgoUnsignedInput(box)
          .setContextExtension({ 0: "0580c0fc82aa02" })
          .toPlainObject("EIP-12")
      ).toEqual({
        boxId: box.boxId,
        value: box.value.toString(),
        ergoTree: box.ergoTree,
        assets: box.assets.map((x) => ({
          tokenId: x.tokenId,
          amount: x.amount.toString()
        })),
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
    for (const box of regularBoxes) {
      expect(new ErgoUnsignedInput(box).toDataInputPlainObject("minimal")).toEqual({
        boxId: box.boxId
      });
    }
  });

  it("Should ignore context vars", () => {
    for (const box of regularBoxes) {
      expect(
        new ErgoUnsignedInput(box)
          .setContextExtension({ 0: "0580c0fc82aa02" })
          .toDataInputPlainObject("minimal")
      ).toEqual({
        boxId: box.boxId
      });
    }
  });

  it("Should convert to EIP-12 unsigned input object and ignore extension content", () => {
    for (const box of regularBoxes) {
      expect(
        new ErgoUnsignedInput(box)
          .setContextExtension({ 0: "0580c0fc82aa02" })
          .toDataInputPlainObject("EIP-12")
      ).toEqual({
        boxId: box.boxId,
        value: box.value.toString(),
        ergoTree: box.ergoTree,
        assets: box.assets.map((x) => ({
          tokenId: x.tokenId,
          amount: x.amount.toString()
        })),
        creationHeight: box.creationHeight,
        additionalRegisters: box.additionalRegisters,
        transactionId: box.transactionId,
        index: box.index
      });
    }
  });
});
