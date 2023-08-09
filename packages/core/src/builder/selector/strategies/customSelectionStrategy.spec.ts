import { Box } from "@fleet-sdk/common";
import { regularBoxes } from "_test-vectors";
import { describe, expect, it, vi } from "vitest";
import { CustomSelectionStrategy } from "./customSelectionStrategy";

describe("Custom selection strategy", () => {
  it("Should use custom selection function to select boxes", () => {
    const mockSelector = vi.fn((inputs: Box<bigint>[]) => {
      return inputs;
    });
    const selection = new CustomSelectionStrategy(mockSelector);

    expect(selection.select(regularBoxes)).toBe(regularBoxes);
    expect(mockSelector).toBeCalled();
  });
});
