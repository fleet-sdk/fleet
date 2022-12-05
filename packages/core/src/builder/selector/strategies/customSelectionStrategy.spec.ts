import { regularBoxesMock } from "../../../tests/mocks/mockBoxes";
import { Box } from "../../../types";
import { CustomSelectionStrategy } from "./customSelectionStrategy";

describe("Custom selection strategy", () => {
  it("Should use custom selection function to select boxes", () => {
    const mockSelector = jest.fn((inputs: Box<bigint>[]) => {
      return inputs;
    });
    const selection = new CustomSelectionStrategy(mockSelector);

    expect(selection.select(regularBoxesMock)).toBe(regularBoxesMock);
    expect(mockSelector).toBeCalled();
  });
});
