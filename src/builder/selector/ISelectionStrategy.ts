import { Box } from "../../types";
import { SelectionTarget } from "./boxSelector";

export interface ISelectionStrategy {
  select(inputs: Box[], target: SelectionTarget): Box[];
}

export function isISelectionStrategyImplementation(obj: any): obj is ISelectionStrategy {
  if ((obj as ISelectionStrategy).select) {
    return true;
  }

  return false;
}
