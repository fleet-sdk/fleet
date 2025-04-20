import fc from "fast-check";
import { describe, expect, it, test } from "vitest";
import { hex } from "./hex";

const HEX_CHARS = "0123456789abcdef";
type HexOpt = Omit<fc.StringConstraints, "unit">;

const ui8a = (bytes: number[]) => Uint8Array.from(bytes);
const hexNum = () => fc.integer({ min: 0, max: 15 }).map((n) => HEX_CHARS[n]);
const hexString = (opt: HexOpt = {}) => fc.string({ ...opt, unit: hexNum() });

const paddedHexArb = fc
  .mixedCase(hexString({ size: "medium" }))
  .map((v) => (v.length % 2 ? v.padStart(v.length + 1, "0") : v));

describe("Fuzzy hex <-> bytes roundtrip", () => {
  test("byte -> hex -> byte", () => {
    fc.assert(
      fc.property(fc.uint8Array({ size: "medium" }), (bytes) => {
        expect(hex.decode(hex.encode(bytes))).to.be.deep.equal(bytes);
      })
    );
  });

  test("hex -> byte -> hex", () => {
    fc.assert(
      fc.property(paddedHexArb, (hexString) => {
        expect(hex.encode(hex.decode(hexString))).to.be.equal(hexString.toLowerCase());
      })
    );
  });
});

describe("Hex <-> Bytes serialization", () => {
  it("Should convert hex to bytes", () => {
    expect(hex.decode("deadbeef")).to.be.deep.equal(ui8a([0xde, 0xad, 0xbe, 0xef]));
    expect(hex.decode("DEADBEEF")).to.be.deep.equal(ui8a([0xde, 0xad, 0xbe, 0xef]));
    expect(hex.decode("deadBEEF")).to.be.deep.equal(ui8a([0xde, 0xad, 0xbe, 0xef]));
    expect(hex.decode("cafe123456")).to.be.deep.equal(
      ui8a([0xca, 0xfe, 0x12, 0x34, 0x56])
    );
    expect(hex.decode("CAFE123456")).to.be.deep.equal(
      ui8a([0xca, 0xfe, 0x12, 0x34, 0x56])
    );
  });

  it("Should convert bytes to hex", () => {
    expect(hex.encode(ui8a([0xde, 0xad, 0xbe, 0xef]))).to.be.equal("deadbeef");
    expect(hex.encode(ui8a([0xca, 0xfe, 0x12, 0x34, 0x56]))).to.be.equal("cafe123456");
  });

  it("Should roundtrip", () => {
    expect(hex.encode(hex.decode("deadbeef"))).to.be.deep.equal("deadbeef");
    expect(hex.decode(hex.encode(ui8a([0xca, 0xfe, 0x12, 0x34, 0x56])))).to.be.deep.equal(
      ui8a([0xca, 0xfe, 0x12, 0x34, 0x56])
    );
  });

  test("Hex to byte with invalid inputs", () => {
    expect(() => hex.decode("non hex string")).to.throw("Invalid byte sequence");
    expect(() => hex.decode("0643d437ee7")).to.throw("Invalid hex padding");
    expect(() => hex.decode(1 as unknown as string)).to.throw(
      "Expected an object of type 'string', got 'number'."
    );
  });

  test("Bytes to hex with invalid inputs", () => {
    const invalidBytes = [1, -2, 2, -55] as unknown as Uint8Array;
    expect(() => hex.encode(invalidBytes)).to.throw(
      "Expected an instance of 'Uint8Array', got 'Array'."
    );
  });
});
