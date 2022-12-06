import { Box } from "@fleet-sdk/common";
import { SelectionTarget } from "../boxSelector";

export interface ISelectionStrategy {
  select(inputs: Box<bigint>[], target?: SelectionTarget): Box<bigint>[];
}
