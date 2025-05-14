import { type Box, type TokenId, type TokenTargetAmount, isDefined, some } from "@fleet-sdk/common";
import { _0n, isEmpty, isUndefined, sumBy, utxoSum } from "@fleet-sdk/common";
import type { SelectionTarget } from "../boxSelector";
import type { ISelectionStrategy } from "./ISelectionStrategy";

/**
 * Accumulative selection strategy accumulates inputs until the target amounts
 * value is reached, skipping detrimental inputs.
 */
export class AccumulativeSelectionStrategy implements ISelectionStrategy {
  private _inputs!: Box<bigint>[];

  select(inputs: Box<bigint>[], target: SelectionTarget): Box<bigint>[] {
    this._inputs = inputs;

    let selection: Box<bigint>[] = [];
    if (some(target.tokens)) {
      selection = this._selectTokens(target.tokens);
    }

    const selectedNanoErgs = sumBy(selection, (input) => input.value);
    if (
      (isUndefined(target.nanoErgs) && isEmpty(target.tokens)) ||
      (isDefined(target.nanoErgs) && selectedNanoErgs < target.nanoErgs)
    ) {
      const targetAmount = isDefined(target.nanoErgs)
        ? target.nanoErgs - selectedNanoErgs
        : undefined;

      selection = selection.concat(this._select(targetAmount));
    }

    return selection;
  }

  private _selectTokens(targets: TokenTargetAmount<bigint>[]): Box<bigint>[] {
    let selection: Box<bigint>[] = [];

    for (const target of targets) {
      const targetAmount = isDefined(target.amount)
        ? target.amount - utxoSum(selection, target.tokenId)
        : undefined;

      if (targetAmount && targetAmount <= _0n) {
        continue;
      }

      selection = selection.concat(this._select(targetAmount, target.tokenId));
    }

    return selection;
  }

  private _select(target?: bigint, tokenId?: TokenId): Box<bigint>[] {
    const inputs = this._inputs;
    let acc = _0n;
    let selection: Box<bigint>[] = [];

    if (isUndefined(target)) {
      if (tokenId) {
        selection = inputs.filter((x) => x.assets.some((asset) => asset.tokenId === tokenId));
      } else {
        selection = inputs;
      }
    } else {
      for (let i = 0; i < inputs.length && acc < target; i++) {
        if (tokenId) {
          for (const token of inputs[i].assets) {
            if (token.tokenId !== tokenId) {
              continue;
            }

            acc += token.amount;
            selection.push(inputs[i]);
          }
        } else {
          acc += inputs[i].value;
          selection.push(inputs[i]);
        }
      }
    }

    if (some(selection)) {
      this._inputs = this._inputs.filter((input) => !selection.includes(input));
    }

    return selection;
  }
}
