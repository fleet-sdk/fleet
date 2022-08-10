import { mockUnspentBoxes } from "../mocks/mockBoxes";
import { sumByTokenId } from "./boxUtils";

describe("Box sumByTokenId", () => {
  it("Should sum correctly", () => {
    const inputs = mockUnspentBoxes.filter((input) =>
      [
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d",
        "467b6867c6726cc5484be3cbddbf55c30c0a71594a20c1ac28d35b5049632444",
        "2555e34138d276905fe0bc19240bbeca10f388a71f7b4d2f65a7d0bfd23c846d"
      ].includes(input.boxId)
    );

    expect(
      sumByTokenId(inputs, "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")
    ).toBe(3819n);
  });

  it("Should return zero for empty arrays", () => {
    expect(
      sumByTokenId([], "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")
    ).toBe(0n);
  });
});
