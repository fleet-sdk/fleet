import { unspentBoxes } from "../../../mocks/boxes";
import { Box } from "../../../types";
import { CustomSelectionStrategy } from "./customSelectionStrategy";

describe("Custom selection strategy", () => {
  it("Should use custom selection function to select boxes", () => {
    const mockSelector = jest.fn((inputs: Box[]) => {
      return inputs;
    });
    const selection = new CustomSelectionStrategy(mockSelector);

    expect(selection.select(unspentBoxes)).toBe(unspentBoxes);
    expect(mockSelector).toBeCalled();
  });
});
