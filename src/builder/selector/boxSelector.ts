import { orderBy as lodashOrderBy } from "lodash";
import { Box, FilterPredicate, SortingDirection, SortingSelector, TokenAmount } from "../../types";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";
import { AccumulativeSelectionStrategy } from "./strategies/accumulativeSelectionStrategy";
import { CustomSelectionStrategy, SelectorFunction } from "./strategies/customSelectionStrategy";
import { sumBy } from "../../utils/bigIntUtils";
import { isEmpty } from "../../utils/arrayUtils";
import { sumByTokenId } from "../../utils/boxUtils";

export type SelectionTarget = { nanoErgs: bigint; tokens?: TokenAmount<bigint>[] };

export class BoxSelector {
  private readonly _inputs: Box<bigint>[];
  private readonly _target?: SelectionTarget;
  private _strategy?: ISelectionStrategy;
  private _inputsSortSelector?: SortingSelector<Box<bigint>>;
  private _inputsSortDir?: SortingDirection;
  private _ensureFilterPredicate?: FilterPredicate<Box<bigint>>;

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
      this._strategy = new AccumulativeSelectionStrategy();
    }

    const target = this._target ? { ...this._target } : undefined;
    let unselected = this._inputs;
    let selected = this._ensureFilterPredicate
      ? unselected.filter(this._ensureFilterPredicate)
      : [];

    if (this._ensureFilterPredicate) {
      const predicate = this._ensureFilterPredicate;
      unselected = unselected.filter((input) => !predicate(input));

      if (target) {
        target.nanoErgs -= sumBy(selected, (input) => input.value);
        if (target.tokens && selected.some((input) => !isEmpty(input.assets))) {
          target.tokens.forEach((tokenTarget) => {
            tokenTarget.amount -= sumByTokenId(selected, tokenTarget.tokenId);
          });
        }
      }
    }
    console.log(target);
    unselected = this._sort(unselected);
    selected = selected.concat(this._strategy.select(unselected, target));

    return selected;
  }

  private _sort(inputs: Box<bigint>[]) {
    if (!this._inputsSortSelector) {
      return lodashOrderBy(inputs, (input) => input.creationHeight, "asc");
    }

    return lodashOrderBy(inputs, this._inputsSortSelector, this._inputsSortDir || "asc");
  }

  public ensureInclusion(predicate: FilterPredicate<Box<bigint>>): BoxSelector {
    this._ensureFilterPredicate = predicate;

    return this;
  }

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
