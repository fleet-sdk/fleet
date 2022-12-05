import { Box } from "../../../types";
import { SelectionTarget } from "../boxSelector";

export interface ISelectionStrategy {
  select(inputs: Box<bigint>[], target?: SelectionTarget): Box<bigint>[];
}
