import { unspentBoxes } from "../../../mocks/boxes";
import { Box } from "../../../types";
import { CustomSelection } from "./customSelectionStrategy";

describe("Custom selection strategy", () => {
  it("Should use custom selection function to select boxes", () => {
    const mockSelector = jest.fn((inputs: Box[]) => {
      return inputs;
    });
    const selection = new CustomSelection(mockSelector);

    expect(selection.select(unspentBoxes, { nanoErgs: 1000000n })).toBe(unspentBoxes);
    expect(mockSelector).toBeCalled();
  });
});
