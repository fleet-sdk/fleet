import { describe, expect, it, test } from "vitest";
import { hex } from "./hex";

const ui8 = (bytes: number[]) => Uint8Array.from(bytes);

describe("Hex <> Bytes serialization", () => {
  it("Should convert hex to bytes", () => {
    expect(hex.decode("deadbeef")).to.be.deep.equal(ui8([0xde, 0xad, 0xbe, 0xef]));
    expect(hex.decode("cafe123456")).to.be.deep.equal(ui8([0xca, 0xfe, 0x12, 0x34, 0x56]));
  });

  it("Should convert bytes to hex", () => {
    expect(hex.encode(ui8([0xde, 0xad, 0xbe, 0xef]))).to.be.equal("deadbeef");
    expect(hex.encode(ui8([0xca, 0xfe, 0x12, 0x34, 0x56]))).to.be.equal("cafe123456");
  });

  it("Should roundtrip", () => {
    expect(hex.encode(hex.decode("deadbeef"))).to.be.deep.equal("deadbeef");
    expect(hex.decode(hex.encode(ui8([0xca, 0xfe, 0x12, 0x34, 0x56])))).to.be.deep.equal(
      ui8([0xca, 0xfe, 0x12, 0x34, 0x56])
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
