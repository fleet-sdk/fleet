import {
  Amount,
  Box,
  BoxCandidate,
  FilterPredicate,
  first,
  isUndefined,
  SortingDirection,
  SortingSelector,
  TokenTargetAmount
} from "@fleet-sdk/common";
import {
  _0n,
  ensureBigInt,
  hasDuplicatesBy,
  isDefined,
  isEmpty,
  orderBy,
  some,
  sumBy,
  utxoSum
} from "@fleet-sdk/common";
import { DuplicateInputSelectionError } from "../../errors/duplicateInputSelectionError";
import { InsufficientInputs } from "../../errors/insufficientInputs";
import { ISelectionStrategy } from "./strategies/ISelectionStrategy";
import { AccumulativeSelectionStrategy } from "./strategies/accumulativeSelectionStrategy";
import { CustomSelectionStrategy, SelectorFunction } from "./strategies/customSelectionStrategy";

export type SelectionTarget = { nanoErgs?: bigint; tokens?: TokenTargetAmount<bigint>[] };

export class BoxSelector<T extends Box<bigint>> {
  private readonly _inputs: Box<bigint>[];
  private _strategy?: ISelectionStrategy;
  private _ensureFilterPredicate?: FilterPredicate<Box<bigint>>;
  private _inputsSortSelector?: SortingSelector<Box<bigint>>;
  private _inputsSortDir?: SortingDirection;

  constructor(inputs: T[]) {
    this._inputs = inputs;
  }

  public defineStrategy(strategy: ISelectionStrategy | SelectorFunction): BoxSelector<T> {
    if (this._isISelectionStrategyImplementation(strategy)) {
      this._strategy = strategy;
    } else {
      this._strategy = new CustomSelectionStrategy(strategy);
    }

    return this;
  }

  public select(target: SelectionTarget): T[] {
    if (!this._strategy) {
      this._strategy = new AccumulativeSelectionStrategy();
    }

    const remaining = this._deepCloneTarget(target);
    let unselected = [...this._inputs];
    let selected!: Box<bigint>[];

    if (isDefined(this._ensureFilterPredicate)) {
      const predicate = this._ensureFilterPredicate;
      selected = unselected.filter(predicate);
      unselected = unselected.filter((input) => !predicate(input));

      if (isDefined(remaining.nanoErgs)) {
        remaining.nanoErgs -= sumBy(selected, (input) => input.value);
      }

      if (isDefined(remaining.tokens) && selected.some((input) => !isEmpty(input.assets))) {
        remaining.tokens.forEach((tokenTarget) => {
          if (tokenTarget.amount) {
            tokenTarget.amount -= utxoSum(selected, tokenTarget.tokenId);
          }
        });
      }
    } else {
      selected = [];
    }

    unselected = this._sort(unselected);
    selected = selected.concat(this._strategy.select(unselected, remaining));

    if (hasDuplicatesBy(selected, (item) => item.boxId)) {
      throw new DuplicateInputSelectionError();
    }

    const unreached = this._getUnreachedTargets(selected, target);
    if (unreached.nanoErgs || some(unreached.tokens)) {
      throw new InsufficientInputs(unreached);
    }

    return selected as T[];
  }

  private _deepCloneTarget(target: SelectionTarget): SelectionTarget {
    return {
      nanoErgs: target.nanoErgs,
      tokens: isDefined(target.tokens)
        ? target.tokens.map((t) => ({ tokenId: t.tokenId, amount: t.amount }))
        : undefined
    };
  }

  private _getUnreachedTargets(inputs: Box<bigint>[], target: SelectionTarget): SelectionTarget {
    const unreached: SelectionTarget = { nanoErgs: undefined, tokens: undefined };
    const selectedNanoergs = sumBy(inputs, (input) => input.value);

    if (target.nanoErgs && target.nanoErgs > selectedNanoergs) {
      unreached.nanoErgs = target.nanoErgs - selectedNanoergs;
    }

    if (isEmpty(target.tokens)) {
      return unreached;
    }

    for (const tokenTarget of target.tokens) {
      const totalSelected = utxoSum(inputs, tokenTarget.tokenId);
      if (isDefined(tokenTarget.amount) && tokenTarget.amount > totalSelected) {
        if (tokenTarget.tokenId === first(inputs).boxId) {
          continue;
        }

        if (isUndefined(unreached.tokens)) {
          unreached.tokens = [];
        }

        unreached.tokens.push({
          tokenId: tokenTarget.tokenId,
          amount: tokenTarget.amount - totalSelected
        });
      }
    }

    return unreached;
  }

  private _sort(inputs: Box<bigint>[]) {
    if (!this._inputsSortSelector) {
      return orderBy(inputs, (input) => input.creationHeight, "asc");
    }

    return orderBy(inputs, this._inputsSortSelector, this._inputsSortDir || "asc");
  }

  public ensureInclusion(predicate: FilterPredicate<Box<bigint>>): BoxSelector<T> {
    this._ensureFilterPredicate = predicate;

    return this;
  }

  public orderBy(
    selector: SortingSelector<Box<bigint>>,
    direction?: SortingDirection
  ): BoxSelector<T> {
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

  public static buildTargetFrom(boxes: Box<Amount>[] | BoxCandidate<Amount>[]): SelectionTarget {
    const tokens: { [tokenId: string]: bigint } = {};
    let nanoErgs = _0n;

    for (const box of boxes) {
      nanoErgs += ensureBigInt(box.value);
      for (const token of box.assets) {
        tokens[token.tokenId] = (tokens[token.tokenId] || _0n) + ensureBigInt(token.amount);
      }
    }

    return {
      nanoErgs,
      tokens: Object.keys(tokens).map((tokenId) => ({ tokenId, amount: tokens[tokenId] }))
    };
  }
}
