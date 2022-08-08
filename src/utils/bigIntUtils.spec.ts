import { toBigInt } from "./bigIntUtils";

it("converts string to bigint", () => {
  expect(toBigInt("1298379183")).toBe(1298379183n);
});

it("try to convert a bigint", () => {
  expect(toBigInt(1298379183)).toBe(1298379183n);
});
