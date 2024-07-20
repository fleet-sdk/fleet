import { describe, expect, it } from "vitest";
import { byteSizeOf, concatBytes, isHex } from "./bytes";

const ui8 = (bytes: number[]) => Uint8Array.from(bytes);

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

    expect(isHex("0xdeadbeef")).toBeTruthy();
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
      byteSizeOf(
        "0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7"
      )
    ).toBe(36);
  });
});
