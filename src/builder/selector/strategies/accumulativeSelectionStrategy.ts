import { Box } from "../../../types";
import { SelectionTarget } from "../boxSelector";
import { ISelectionStrategy } from "./ISelectionStrategy";

export class AccumulativeSelectionStrategy implements ISelectionStrategy {
  select(inputs: Box[], target?: SelectionTarget): Box[] {
    if (!target) {
      return inputs;
    }

    return inputs;
  }
}
