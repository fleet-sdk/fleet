import { orderBy as lodashOrderBy } from "lodash";
import { Box, SortingDirection, SortingSelector, TokenAmount } from "../../types";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";
import { CustomSelectionStrategy, SelectorFunction } from "./strategies/customSelectionStrategy";

export type SelectionTarget = { nanoErgs: bigint; tokens?: TokenAmount<bigint>[] };

export class BoxSelector {
  private readonly _inputs: Box<bigint>[];
  private readonly _target?: SelectionTarget;
  private _strategy?: ISelectionStrategy;
  private _inputsSortSelector?: SortingSelector<Box<bigint>>;
  private _inputsSortDir?: SortingDirection;

  constructor(inputs: Box<bigint>[], target?: SelectionTarget) {
    this._inputs = inputs;
    this._target = target;
  }

  public defineStrategy(strategy: ISelectionStrategy | SelectorFunction): BoxSelector {
    if (this._isISelectionStrategyImplementation(strategy)) {
      this._strategy = strategy;
    } else {
      this._strategy = new CustomSelectionStrategy(strategy);
    }

    return this;
  }

  public select(): Box<bigint>[] {
    if (!this._strategy) {
      return this._sort(this._inputs);
    }

    return this._strategy.select(this._sort(this._inputs), this._target);
  }

  private _sort(inputs: Box<bigint>[]) {
    if (!this._inputsSortSelector) {
      return lodashOrderBy(inputs, (input) => input.creationHeight, "asc");
    }

    return lodashOrderBy(inputs, this._inputsSortSelector, this._inputsSortDir || "asc");
  }

  // public ensureInclusion(selector: (box: Box) => boolean): BoxSelector {
  //   throw Error("Not implemented");
  // }

  public orderBy(
    selector: SortingSelector<Box<bigint>>,
    direction?: SortingDirection
  ): BoxSelector {
    this._inputsSortSelector = selector;
    this._inputsSortDir = direction;

    return this;
  }

  private _isISelectionStrategyImplementation(obj: unknown): obj is ISelectionStrategy {
    if ((obj as ISelectionStrategy).select) {
      return true;
    }

    return false;
  }
}
