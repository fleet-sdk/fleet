import { unspentBoxes } from "../../mocks/boxes";
import { Box } from "../../types";
import { BoxSelector } from "./boxSelector";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";

describe("Box selector", () => {
  it("Should use specified selection strategy class implementation", () => {
    class CustomStrategy implements ISelectionStrategy {
      select(inputs: Box[]): Box[] {
        return inputs;
      }
    }

    const strategy = new CustomStrategy();
    const selectSpy = jest.spyOn(strategy, "select");
    const selector = new BoxSelector(unspentBoxes, { nanoErgs: 1000000n }).defineStrategy(strategy);

    expect(selector.select()).toBe(unspentBoxes);
    expect(selectSpy).toBeCalled();
  });

  it("Should use specified selection strategy function", () => {
    const mockSelectorFunction = jest.fn((inputs: Box[]) => {
      return inputs;
    });

    const selector = new BoxSelector(unspentBoxes, { nanoErgs: 1000000n }).defineStrategy(
      mockSelectorFunction
    );

    expect(selector.select()).toBe(unspentBoxes);
    expect(mockSelectorFunction).toBeCalled();
  });
});
