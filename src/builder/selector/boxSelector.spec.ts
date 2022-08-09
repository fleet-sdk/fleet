import { mockUnspentBoxes } from "../../mocks/mockBoxes";
import { Box } from "../../types";
import { BoxSelector } from "./boxSelector";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";

describe("Box selector", () => {
  it("Should use specified selection strategy class implementation", () => {
    class CustomStrategy implements ISelectionStrategy {
      select(inputs: Box<bigint>[]): Box<bigint>[] {
        return inputs;
      }
    }

    const strategy = new CustomStrategy();
    const selectSpy = jest.spyOn(strategy, "select");
    const selector = new BoxSelector(mockUnspentBoxes).defineStrategy(strategy);

    expect(selector.select()).toBe(mockUnspentBoxes);
    expect(selectSpy).toBeCalled();
  });

  it("Should use specified selection strategy function", () => {
    const mockSelectorFunction = jest.fn((inputs: Box<bigint>[]) => {
      return inputs;
    });

    const selector = new BoxSelector(mockUnspentBoxes).defineStrategy(mockSelectorFunction);

    expect(selector.select()).toBe(mockUnspentBoxes);
    expect(mockSelectorFunction).toBeCalled();
  });

  it("Should fallback to a default selection strategy if nothing is specified", () => {
    const selector = new BoxSelector(mockUnspentBoxes).select();

    expect(selector?.length).toBeGreaterThanOrEqual(1);
  });
});
