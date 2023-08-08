import { describe, expect, it } from "vitest";
import { MAX_CONSTANT_LENGTH } from "./constantSerializer";
import { SigmaWriter } from "./sigmaWriter";

describe("Sigma Writer", () => {
  it("Should put a single byte at time", () => {
    const sigmaBuffer = new SigmaWriter(MAX_CONSTANT_LENGTH);
    sigmaBuffer.write(0x10).write(0x0f).write(0x00);

    expect(sigmaBuffer).toHaveLength(3);
    expect(sigmaBuffer.toBytes()).toEqual(Uint8Array.from([0x10, 0x0f, 0x00]));
  });

  it("Should put multiple bytes at once", () => {
    const sigmaBuffer = new SigmaWriter(MAX_CONSTANT_LENGTH);
    sigmaBuffer.writeBytes(Uint8Array.from([0x00, 0x00, 0x21, 0xff]));
    sigmaBuffer.writeBytes(Uint8Array.from([0x15, 0x0c]));

    expect(sigmaBuffer).toHaveLength(6);
    expect(sigmaBuffer.toBytes()).toEqual(Uint8Array.from([0x00, 0x00, 0x21, 0xff, 0x15, 0x0c]));
  });

  it("Should put multiple hex string", () => {
    const sigmaBuffer = new SigmaWriter(MAX_CONSTANT_LENGTH);

    sigmaBuffer.writeHex("000021ff");
    sigmaBuffer.writeHex("150c");

    expect(sigmaBuffer).toHaveLength(6);
    expect(sigmaBuffer.toBytes()).toEqual(Uint8Array.from([0x00, 0x00, 0x21, 0xff, 0x15, 0x0c]));
  });

  it("Should fail for invalid hex string", () => {
    const sigmaBuffer = new SigmaWriter(MAX_CONSTANT_LENGTH);

    expect(() => {
      sigmaBuffer.writeHex("000021f");
    }).toThrow(Error("Invalid hex padding"));

    expect(() => {
      sigmaBuffer.writeHex("-1");
    }).toThrow(Error("Invalid byte sequence"));

    expect(() => {
      sigmaBuffer.writeHex("ka");
    }).toThrow(Error("Invalid byte sequence"));
  });

  it("Should put a boolean", () => {
    const sigmaBuffer = new SigmaWriter(MAX_CONSTANT_LENGTH);
    sigmaBuffer.writeBoolean(true);
    sigmaBuffer.writeBoolean(false);

    expect(sigmaBuffer).toHaveLength(2);
    expect(sigmaBuffer.toBytes()).toEqual(Uint8Array.from([0x01, 0x00]));
  });

  it("Should put Int", () => {
    const testVectors = [
      { int: 0, hex: "00" },
      { int: 50, hex: "64" },
      { int: 100, hex: "c801" },
      { int: 150, hex: "ac02" },
      { int: 200, hex: "9003" },
      { int: 250, hex: "f403" },
      { int: 300, hex: "d804" },
      { int: 350, hex: "bc05" },
      { int: 400, hex: "a006" },
      { int: 450, hex: "8407" },
      { int: 500, hex: "e807" },
      { int: 550, hex: "cc08" },
      { int: 600, hex: "b009" },
      { int: 650, hex: "940a" },
      { int: 700, hex: "f80a" },
      { int: 750, hex: "dc0b" },
      { int: 800, hex: "c00c" },
      { int: 850, hex: "a40d" },
      { int: 900, hex: "880e" },
      { int: 950, hex: "ec0e" }
    ];

    const all = new SigmaWriter(MAX_CONSTANT_LENGTH);
    for (const tv of testVectors) {
      all.writeShort(tv.int);
      expect(new SigmaWriter(tv.hex.length).writeShort(tv.int).toHex()).toBe(tv.hex);
    }

    expect(all.toHex()).toEqual(testVectors.map((x) => x.hex).join(""));
  });
});
