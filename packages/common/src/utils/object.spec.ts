import { describe, expect, it } from "vitest";
import { clearUndefined } from "./object";

describe("Remove undefined fields", () => {
  it("Should remove", () => {
    expect(
      clearUndefined({ propOne: 1, propTwo: undefined, propThree: "test", nullProp: null })
    ).toEqual({ propOne: 1, propThree: "test" });
  });
});
