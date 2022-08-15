import { orderBy as lodashOrderBy } from "lodash";
import { InsufficientInputs, InsufficientInputsError } from "../../errors/insufficientInputsError";
import { Box, FilterPredicate, SortingDirection, SortingSelector, TokenAmount } from "../../types";
import { isEmpty, some } from "../../utils/arrayUtils";
import { sumBy } from "../../utils/bigIntUtils";
import { sumByTokenId } from "../../utils/boxUtils";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";
import { AccumulativeSelectionStrategy } from "./strategies/accumulativeSelectionStrategy";
import { CustomSelectionStrategy, SelectorFunction } from "./strategies/customSelectionStrategy";

export type SelectionTarget = { nanoErgs: bigint; tokens?: TokenAmount<bigint>[] };

export class BoxSelector {
  private readonly _inputs: Box<bigint>[];
  private readonly _target: SelectionTarget;
  private _strategy?: ISelectionStrategy;
  private _ensureFilterPredicate?: FilterPredicate<Box<bigint>>;
  private _inputsSortSelector?: SortingSelector<Box<bigint>>;
  private _inputsSortDir?: SortingDirection;

  constructor(inputs: Box<bigint>[], target: SelectionTarget) {
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

    const target = { ...this._target };
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

    unselected = this._sort(unselected);
    selected = selected.concat(this._strategy.select(unselected, target));

    const unreached = this._getUnreachedTargets(selected, this._target);
    if (some(unreached)) {
      throw new InsufficientInputsError(unreached);
    }

    return selected;
  }

  private _getUnreachedTargets(inputs: Box<bigint>[], target: SelectionTarget): InsufficientInputs {
    const unreached: InsufficientInputs = {};
    const selectedNanoergs = sumBy(inputs, (input) => input.value);

    if (target.nanoErgs > selectedNanoergs) {
      unreached["nanoErgs"] = target.nanoErgs - selectedNanoergs;
    }

    if (isEmpty(target.tokens)) {
      return unreached;
    }

    for (const tokenTarget of target.tokens) {
      const totalSelected = sumByTokenId(inputs, tokenTarget.tokenId);
      if (tokenTarget.amount > totalSelected) {
        unreached[tokenTarget.tokenId] = tokenTarget.amount - totalSelected;
      }
    }

    return unreached;
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
