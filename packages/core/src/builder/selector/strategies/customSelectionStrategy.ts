import { Box } from "@fleet-sdk/common";
import { SelectionTarget } from "../boxSelector";
import { ISelectionStrategy } from "./ISelectionStrategy";

export type SelectorFunction = (
  inputs: Box<bigint>[],
  target?: SelectionTarget
) => Box<bigint>[];

/**
 * Custom selection strategy supports custom selections implementations.
 */
export class CustomSelectionStrategy implements ISelectionStrategy {
  private readonly _selector: SelectorFunction;

  constructor(selector: SelectorFunction) {
    this._selector = selector;
  }

  select(inputs: Box<bigint>[], target?: SelectionTarget): Box<bigint>[] {
    return this._selector(inputs, target);
  }
}
