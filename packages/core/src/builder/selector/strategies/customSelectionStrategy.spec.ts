import { Box } from "@fleet-sdk/common";
import { describe, expect, it, vi } from "vitest";
import { regularBoxesMock } from "../../../tests/mocks/mockBoxes";
import { CustomSelectionStrategy } from "./customSelectionStrategy";

describe("Custom selection strategy", () => {
  it("Should use custom selection function to select boxes", () => {
    const mockSelector = vi.fn((inputs: Box<bigint>[]) => {
      return inputs;
    });
    const selection = new CustomSelectionStrategy(mockSelector);

    expect(selection.select(regularBoxesMock)).toBe(regularBoxesMock);
    expect(mockSelector).toBeCalled();
  });
});
