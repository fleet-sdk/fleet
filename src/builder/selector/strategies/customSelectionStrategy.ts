import { Box } from "../../../types";
import { SelectionTarget } from "../boxSelector";
import { ISelectionStrategy } from "./ISelectionStrategy";

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
