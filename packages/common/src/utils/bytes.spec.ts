import { describe, expect, it, test } from "vitest";
import {
  byteSizeOf,
  bytesToHex,
  bytesToUtf8,
  concatBytes,
  hexToBytes,
  isHex,
  utf8ToBytes
} from "./bytes";

const ui8 = (bytes: number[]) => Uint8Array.from(bytes);

describe("Hex <> Bytes serialization", () => {
  it("Should convert hex to bytes", () => {
    expect(hexToBytes("deadbeef")).to.be.deep.equal(ui8([0xde, 0xad, 0xbe, 0xef]));
    expect(hexToBytes("cafe123456")).to.be.deep.equal(ui8([0xca, 0xfe, 0x12, 0x34, 0x56]));
  });

  it("Should convert bytes to hex", () => {
    expect(bytesToHex(ui8([0xde, 0xad, 0xbe, 0xef]))).to.be.equal("deadbeef");
    expect(bytesToHex(ui8([0xca, 0xfe, 0x12, 0x34, 0x56]))).to.be.equal("cafe123456");
  });

  it("Should roundtrip", () => {
    expect(bytesToHex(hexToBytes("deadbeef"))).to.be.deep.equal("deadbeef");
    expect(hexToBytes(bytesToHex(ui8([0xca, 0xfe, 0x12, 0x34, 0x56])))).to.be.deep.equal(
      ui8([0xca, 0xfe, 0x12, 0x34, 0x56])
    );
  });

  test("Hex to byte with invalid inputs", () => {
    expect(() => hexToBytes("non hex string")).to.throw("Invalid byte sequence");
    expect(() => hexToBytes("0643d437ee7")).to.throw("Invalid hex padding");
    expect(() => hexToBytes(1 as unknown as string)).to.throw(
      "Expected an object of type 'string', got 'number'."
    );
  });

  test("Bytes to hex with invalid inputs", () => {
    const invalidBytes = [1, -2, 2, -55] as unknown as Uint8Array;
    expect(() => bytesToHex(invalidBytes)).to.throw(
      "Expected an instance of 'Uint8Array', got 'Array'."
    );
  });
});

describe("UTF-8 <> bytes serialization", () => {
  it("Should roundtrip", () => {
    expect(bytesToUtf8(utf8ToBytes("this is a regular string"))).to.be.equal(
      "this is a regular string"
    );
  });

  test("utf8 to bytes with invalid inputs", () => {
    const notAString = true as unknown as string;
    expect(() => utf8ToBytes(notAString)).to.throw(
      "Expected an object of type 'string', got 'boolean'."
    );
  });

  test("bytes to utf8 with invalid inputs", () => {
    const invalidBytes = {} as unknown as Uint8Array;
    expect(() => bytesToUtf8(invalidBytes)).to.throw(
      "Expected an instance of 'Uint8Array', got 'Object'."
    );
  });
});

describe("Bytes concatenation", () => {
  it("Should concat bytes", () => {
    expect(concatBytes(ui8([0xde, 0xad]), ui8([0xbe, 0xef]))).to.be.deep.equal(
      ui8([0xde, 0xad, 0xbe, 0xef])
    );

    expect(concatBytes(ui8([0xde, 0xad, 0xbe, 0xef]), ui8([]))).to.be.deep.equal(
      ui8([0xde, 0xad, 0xbe, 0xef])
    );

    expect(concatBytes(ui8([]), ui8([0xde, 0xad, 0xbe, 0xef]))).to.be.deep.equal(
      ui8([0xde, 0xad, 0xbe, 0xef])
    );
  });

  it("Should fail with invalid inputs", () => {
    expect(() => concatBytes({} as unknown as Uint8Array, ui8([]))).to.throw(
      "Expected an instance of 'Uint8Array', got 'Object'."
    );
  });
});

describe("isHex() test", () => {
  it("Should pass with VALID hex strings", () => {
    expect(
      isHex("0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7")
    ).toBeTruthy();
  });

  it("Should fail with INVALID hex strings", () => {
    expect(isHex("this is a non hex string")).toBeFalsy();
    expect(
      isHex("n 0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7")
    ).toBeFalsy();

    expect(isHex("deadbee")).toBeFalsy();
  });

  it("Should fail with falsy arguments", () => {
    expect(isHex("")).toBeFalsy();
    expect(isHex(undefined)).toBeFalsy();
  });

  it("Should return the byte size of a hex string", () => {
    expect(
      byteSizeOf("0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7")
    ).toBe(36);
  });
});
