import { describe, expect, it } from "vitest";
import { clearUndefined, ensureDefaults } from "./object";

describe("Remove undefined fields", () => {
  it("Should remove", () => {
    expect(
      clearUndefined({ propOne: 1, propTwo: undefined, propThree: "test", nullProp: null })
    ).toEqual({ propOne: 1, propThree: "test" });
  });
});

describe("Ensure defaults", () => {
  it("Should supplied defaults", () => {
    const defaults = {
      a: 1,
      b: 2,
      c: 3,
      y: undefined as number | undefined,
      z: 0
    };

    expect(ensureDefaults(undefined, defaults)).to.be.equal(defaults);
    expect(ensureDefaults({}, defaults)).to.be.equal(defaults);
    expect(ensureDefaults([] as unknown as object, defaults)).to.be.equal(defaults);

    expect(ensureDefaults({ a: 5, t: 1 }, defaults)).to.be.deep.equal({
      a: 5, // opt
      b: 2, // defaults
      c: 3, // defaults
      y: undefined, // defaults
      t: 1, // opt,
      z: 0 // defaults
    });

    expect(ensureDefaults({ a: 52, b: 0, y: 100 }, defaults)).to.be.deep.equal({
      a: 52, // opt
      b: 0, // defaults
      c: 3, // defaults
      y: 100, // opt,
      z: 0 // defaults
    });
  });
});
