import { removeUndefined } from "./objectUtils";

describe("Remove undefined fields", () => {
  it("Should remove", () => {
    expect(
      removeUndefined({ propOne: 1, propTwo: undefined, propThree: "test", nullProp: null })
    ).toEqual({ propOne: 1, propThree: "test" });
  });
});
