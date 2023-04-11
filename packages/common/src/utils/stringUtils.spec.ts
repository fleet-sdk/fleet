import { describe, expect, it } from "vitest";
import { hexByteSize, isHex } from "./stringUtils";

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
  });

  it("Should fail with falsy arguments", () => {
    expect(isHex("")).toBeFalsy();
    expect(isHex(undefined)).toBeFalsy();
  });

  it("Should return the byte size of a hex string", () => {
    expect(
      hexByteSize("0008cd026dc059d64a50d0dbf07755c2c4a4e557e3df8afa7141868b3ab200643d437ee7")
    ).toBe(36);
  });
});
