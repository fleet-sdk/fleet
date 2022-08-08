import { Box } from "../../types";
import { ISelectionStrategy } from "./ISelectionStrategy";
import { SelectionTarget } from "./boxSelector";

export type SelectorFunction = (inputs: Box[], target: SelectionTarget) => Box[];

export class CustomSelection implements ISelectionStrategy {
  private readonly _selector: SelectorFunction;

  constructor(selector: SelectorFunction) {
    this._selector = selector;
  }

  select(inputs: Box[], target: SelectionTarget): Box[] {
    return this._selector(inputs, target);
  }
}
