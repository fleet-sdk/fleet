import { Box } from "../../types";
import { CustomSelection } from "./customSelection";

describe("custom selection strategy", () => {
  it("binds selection function", () => {
    const select = (box: Box[]) => {
      return box;
    };

    const selection = new CustomSelection(select);
    expect(selection.select).toBe(select);
  });
});
