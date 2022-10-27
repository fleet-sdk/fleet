import { MAX_CONSTANT_LENGTH } from "./constantSerializer";
import { SigmaBuffer } from "./sigmaBuffer";

describe("Sigma Buffer", () => {
  it("Should put a single byte at time", () => {
    const sigmaBuffer = new SigmaBuffer(MAX_CONSTANT_LENGTH);
    sigmaBuffer.put(0x10).put(0x0f).put(0x00);

    expect(sigmaBuffer).toHaveLength(3);
    expect(sigmaBuffer.toBuffer()).toEqual(Buffer.from([0x10, 0x0f, 0x00]));
  });

  it("Should put multiple bytes at once", () => {
    const sigmaBuffer = new SigmaBuffer(MAX_CONSTANT_LENGTH);
    sigmaBuffer.putBytes(Uint8Array.from([0x00, 0x00, 0x21, 0xff]));
    sigmaBuffer.putBytes(Buffer.from([0x15, 0x0c]));

    expect(sigmaBuffer).toHaveLength(6);
    expect(sigmaBuffer.toBuffer()).toEqual(Buffer.from([0x00, 0x00, 0x21, 0xff, 0x15, 0x0c]));
  });

  it("Should put a boolean", () => {
    const sigmaBuffer = new SigmaBuffer(MAX_CONSTANT_LENGTH);
    sigmaBuffer.putBoolean(true);
    sigmaBuffer.putBoolean(false);

    expect(sigmaBuffer).toHaveLength(2);
    expect(sigmaBuffer.toBuffer()).toEqual(Buffer.from([0x01, 0x00]));
  });

  it("Should put multiple booleans", () => {
    const sigmaBuffer = new SigmaBuffer(MAX_CONSTANT_LENGTH);
    sigmaBuffer.putBooleans([true, false]);

    expect(sigmaBuffer).toHaveLength(2);
    expect(sigmaBuffer.toBuffer()).toEqual(Buffer.from([0x01, 0x00]));
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

    const all = new SigmaBuffer(MAX_CONSTANT_LENGTH);
    for (const tv of testVectors) {
      all.putInt(tv.int);
      expect(new SigmaBuffer(tv.hex.length).putInt(tv.int).toBuffer().toString("hex")).toBe(tv.hex);
    }

    expect(all.toBuffer().toString("hex")).toEqual(testVectors.map((x) => x.hex).join(""));
  });
});
