import { unspentBoxes } from "../../../mocks/boxes";
import { AccumulativeSelectionStrategy } from "./accumulativeSelectionStrategy";

describe("Accumulative selection strategy", () => {
  it("Should return untouched inputs if no target is specified", () => {
    const strategy = new AccumulativeSelectionStrategy();
    expect(strategy.select(unspentBoxes)).toBe(unspentBoxes);
  });
});
