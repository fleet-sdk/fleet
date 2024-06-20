import type { Box } from "@fleet-sdk/common";
import type { SelectionTarget } from "../boxSelector";

export interface ISelectionStrategy {
  select(inputs: Box<bigint>[], target?: SelectionTarget): Box<bigint>[];
}
