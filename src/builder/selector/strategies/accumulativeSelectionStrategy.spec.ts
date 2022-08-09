import { mockUnspentBoxes } from "../../../mocks/mockBoxes";
import { sumBy } from "../../../utils/bigIntUtils";
import { AccumulativeSelectionStrategy } from "./accumulativeSelectionStrategy";

describe("Accumulative selection strategy", () => {
  it("Should return untouched inputs if no target is specified", () => {
    const selector = new AccumulativeSelectionStrategy();
    expect(selector.select(mockUnspentBoxes)).toEqual(mockUnspentBoxes);
  });

  it("Should select for nanoErgs only", () => {
    const selector = new AccumulativeSelectionStrategy();
    const target = { nanoErgs: 10000n };
    const boxes = selector.select(mockUnspentBoxes, target);

    expect(boxes).toHaveLength(1);
    expect(sumBy(mockUnspentBoxes, (x) => x.value)).toBeGreaterThanOrEqual(10000n);
  });

  it("Should select for nanoErgs only", () => {
    const selector = new AccumulativeSelectionStrategy();
    const target = {
      nanoErgs: 100000n,
      tokens: [
        {
          tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b",
          amount: 100n
        },
        {
          tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283",
          amount: 10n
        }
      ]
    };
    const boxes = selector.select(mockUnspentBoxes, target);

    expect(boxes.length).toBeLessThan(mockUnspentBoxes.length);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(target.nanoErgs);
    expect(
      sumBy(
        boxes.flatMap((x) => x.assets).filter((x) => x.tokenId == target.tokens[0].tokenId),
        (x) => x.amount
      )
    ).toBeGreaterThanOrEqual(target.tokens[0].amount);
  });
});
