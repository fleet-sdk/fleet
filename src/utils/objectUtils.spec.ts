import { isUndefined, removeUndefined } from "./objectUtils";

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
