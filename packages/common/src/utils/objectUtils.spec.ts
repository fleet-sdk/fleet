import { describe, expect, it } from "vitest";
import { hasKey, isDefined, isUndefined, removeUndefined } from "./objectUtils";

describe("Remove undefined fields", () => {
  it("Should remove", () => {
    expect(
      removeUndefined({ propOne: 1, propTwo: undefined, propThree: "test", nullProp: null })
    ).toEqual({ propOne: 1, propThree: "test" });
  });
});

describe("isUndefined()", () => {
  it("Should return false for defined objects", () => {
    expect(isUndefined(0)).toBeFalsy();
    expect(isUndefined("")).toBeFalsy();
    expect(isUndefined({})).toBeFalsy();
  });

  it("Should return true for undefined or null objects", () => {
    expect(isUndefined(undefined)).toBeTruthy();
    expect(isUndefined(null)).toBeTruthy();
    expect(isUndefined(NaN)).toBeTruthy();
  });
});

describe("isDefined()", () => {
  it("Should return true for defined objects", () => {
    expect(isDefined(0)).toBeTruthy();
    expect(isDefined("")).toBeTruthy();
    expect(isDefined({})).toBeTruthy();
  });

  it("Should return false for undefined or null objects", () => {
    expect(isDefined(undefined)).toBeFalsy();
    expect(isDefined(null)).toBeFalsy();
    expect(isDefined(NaN)).toBeFalsy();
  });
});

describe("hasKey()", () => {
  const obj = {
    undefinedKey: undefined,
    complexObjKey: { a: 1, b: 2 },
    nullKey: null,
    nanKey: NaN,
    stringKey: "test",
    functionKey: () => "test"
  };

  it("Should return true is key is present, even if it's undefined", () => {
    expect(hasKey(obj, "undefinedKey")).to.be.true;
    expect(hasKey(obj, "complexObjKey")).to.be.true;
    expect(hasKey(obj, "nullKey")).to.be.true;
    expect(hasKey(obj, "nanKey")).to.be.true;
    expect(hasKey(obj, "stringKey")).to.be.true;
  });

  it("Should return false is key is not present", () => {
    expect(hasKey(obj, "nonPresentKey")).to.be.false;
  });
});
