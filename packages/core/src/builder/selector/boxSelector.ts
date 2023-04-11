import {
  _0n,
  Amount,
  Box,
  BoxCandidate,
  BoxId,
  ensureBigInt,
  FilterPredicate,
  first,
  hasDuplicatesBy,
  isEmpty,
  isUndefined,
  OneOrMore,
  orderBy,
  some,
  SortingDirection,
  SortingSelector,
  sumBy,
  TokenTargetAmount,
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
  private _ensureInclusionBoxIds?: Set<BoxId>;

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
    let selected: Box<bigint>[] = [];

    const predicate = this._ensureFilterPredicate;
    const inclusion = this._ensureInclusionBoxIds;

    if (predicate) {
      if (inclusion) {
        selected = unselected.filter((box) => predicate(box) || inclusion.has(box.boxId));
      } else {
        selected = unselected.filter(predicate);
      }
    } else if (inclusion) {
      selected = unselected.filter((box) => inclusion.has(box.boxId));
    }

    if (some(selected)) {
      unselected = unselected.filter((box) => !selected.some((sel) => sel.boxId === box.boxId));

      if (remaining.nanoErgs && remaining.nanoErgs > _0n) {
        remaining.nanoErgs -= sumBy(selected, (input) => input.value);
      }

      if (some(remaining.tokens) && selected.some((input) => !isEmpty(input.assets))) {
        for (const t of remaining.tokens) {
          if (t.amount && t.amount > _0n) {
            t.amount -= utxoSum(selected, t.tokenId);
          }
        }
      }
    }

    if (this._inputsSortSelector) {
      unselected = orderBy(unselected, this._inputsSortSelector, this._inputsSortDir || "asc");
    }

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
      tokens: target.tokens
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
      if (tokenTarget.amount && tokenTarget.amount > totalSelected) {
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

  public ensureInclusion(predicate: FilterPredicate<Box<bigint>>): BoxSelector<T>;
  public ensureInclusion(boxIds: OneOrMore<BoxId>): BoxSelector<T>;
  public ensureInclusion(
    predicateOrBoxIds: FilterPredicate<Box<bigint>> | OneOrMore<BoxId>
  ): BoxSelector<T> {
    if (typeof predicateOrBoxIds === "function") {
      this._ensureFilterPredicate = predicateOrBoxIds;
    } else {
      if (isUndefined(this._ensureInclusionBoxIds)) {
        this._ensureInclusionBoxIds = new Set();
      }

      if (Array.isArray(predicateOrBoxIds)) {
        for (const boxId of predicateOrBoxIds) {
          this._ensureInclusionBoxIds.add(boxId);
        }
      } else {
        this._ensureInclusionBoxIds.add(predicateOrBoxIds);
      }
    }

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
