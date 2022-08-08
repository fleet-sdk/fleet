import { Box, TokenAmount } from "../../types";
import { CustomSelection, SelectorFunction } from "./customSelection";
import { ISelectionStrategy, isISelectionStrategyImplementation } from "./ISelectionStrategy";

export type SelectionTarget = { nanoErgs: bigint; tokens?: TokenAmount<bigint>[] };

export class BoxSelector {
  private readonly _inputs: Box[];
  private readonly _target: SelectionTarget;
  private _strategy?: ISelectionStrategy;

  constructor(inputs: Box[], target: SelectionTarget) {
    this._inputs = inputs;
    this._target = target;
  }

  public defineStrategy(strategy: ISelectionStrategy | SelectorFunction): BoxSelector {
    if (isISelectionStrategyImplementation(strategy)) {
      this._strategy = strategy;
    } else {
      this._strategy = new CustomSelection(strategy);
    }

    return this;
  }

  public select(): Box[] {
    // return this._selector(this._inputs, this._target);
    throw Error("Not implemented");
  }

  public ensureInclusion(selector: (box: Box) => boolean): BoxSelector {
    throw Error("Not implemented");
  }

  public orderBy(selector: (box: Box) => boolean): BoxSelector {
    throw Error("Not implemented");
  }
}
