import { sumBy, utxoSum } from "@fleet-sdk/common";
import { regularBoxesMock } from "../../../tests/mocks/mockBoxes";
import { AccumulativeSelectionStrategy } from "./accumulativeSelectionStrategy";

describe("Accumulative selection strategy", () => {
  it("Should return an empty array if empty target: { nanoErgs: 0 }", () => {
    const selector = new AccumulativeSelectionStrategy();
    expect(selector.select(regularBoxesMock, { nanoErgs: 0n })).toEqual([]);
  });

  it("Should select inputs for nanoErgs only with target amount", () => {
    const selector = new AccumulativeSelectionStrategy();
    const target = { nanoErgs: 10000n };
    const boxes = selector.select(regularBoxesMock, target);

    expect(boxes).toHaveLength(1);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(10000n);
  });

  it("Should select all inputs with nanoErgs if no target amount is specified", () => {
    const selector = new AccumulativeSelectionStrategy();
    const boxes = selector.select(regularBoxesMock, { nanoErgs: undefined });

    expect(boxes).toHaveLength(regularBoxesMock.length);
  });

  it("Should select all inputs with a given token if no target amount is specified", () => {
    const selector = new AccumulativeSelectionStrategy();

    const boxes = selector.select(regularBoxesMock, {
      tokens: [{ tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283" }]
    });

    expect(boxes).toHaveLength(3);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(10000n);
  });

  it("Should select all inputs with a given token if no target amount is specified - multiple tokenIds", () => {
    const selector = new AccumulativeSelectionStrategy();

    const boxes = selector.select(regularBoxesMock, {
      tokens: [
        { tokenId: "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283" },
        { tokenId: "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b" }
      ]
    });

    expect(boxes).toHaveLength(4);
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(10000n);
  });

  it("Should select inputs for tokens", () => {
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
    const boxes = selector.select(regularBoxesMock, target);

    expect(boxes).toHaveLength(1); // should try to reuse already selected inputs
    expect(sumBy(boxes, (x) => x.value)).toBeGreaterThanOrEqual(target.nanoErgs);
    expect(
      utxoSum(boxes, "0cd8c9f416e5b1ca9f986a7f10a84191dfb85941619e49e53c0dc30ebf83324b")
    ).toBeGreaterThanOrEqual(100n);
    expect(
      utxoSum(boxes, "007fd64d1ee54d78dd269c8930a38286caa28d3f29d27cadcb796418ab15c283")
    ).toBeGreaterThanOrEqual(10n);
  });
});
