import { Box, TokenId, TokenTargetAmount } from "../../../types";
import { isEmpty } from "../../../utils/arrayUtils";
import { _0n } from "../../../utils/bigIntLiterals";
import { sumBy } from "../../../utils/bigIntUtils";
import { sumByTokenId } from "../../../utils/boxUtils";
import { isUndefined } from "../../../utils/objectUtils";
import { SelectionTarget } from "../boxSelector";
import { ISelectionStrategy } from "./ISelectionStrategy";

/**
 * Accumulative selection strategy accumulates inputs until the target
 * value is reached, skipping detrimental inputs.
 */
export class AccumulativeSelectionStrategy implements ISelectionStrategy {
  private _inputs!: Box<bigint>[];

  select(inputs: Box<bigint>[], target: SelectionTarget): Box<bigint>[] {
    this._inputs = inputs;

    let selection: Box<bigint>[] = [];
    if (!isEmpty(target.tokens)) {
      selection = this._selectTokens(target.tokens);
    }

    const selectedNanoErgs = sumBy(selection, (input) => input.value);
    if (
      (isUndefined(target.nanoErgs) && isEmpty(target.tokens)) ||
      (!isUndefined(target.nanoErgs) && selectedNanoErgs < target.nanoErgs)
    ) {
      const targetAmount = !isUndefined(target.nanoErgs)
        ? target.nanoErgs - selectedNanoErgs
        : undefined;

      selection = selection.concat(this._select(targetAmount));
    }

    return selection;
  }

  private _selectTokens(targets: TokenTargetAmount<bigint>[]): Box<bigint>[] {
    let selection: Box<bigint>[] = [];

    for (const target of targets) {
      const targetAmount = !isUndefined(target.amount)
        ? target.amount - sumByTokenId(selection, target.tokenId)
        : undefined;

      if (targetAmount && targetAmount <= _0n) {
        continue;
      }

      selection = selection.concat(this._select(targetAmount, target.tokenId));
    }

    return selection;
  }

  private _select(target?: bigint, tokenId?: TokenId): Box<bigint>[] {
    let acc = _0n;
    let selection: Box<bigint>[] = [];

    if (isUndefined(target)) {
      if (tokenId) {
        selection = this._inputs.filter((x) => x.assets.some((asset) => asset.tokenId === tokenId));
      } else {
        selection = this._inputs;
      }
    } else {
      for (let i = 0; i < this._inputs.length && acc < target; i++) {
        if (tokenId) {
          for (const token of this._inputs[i].assets) {
            if (token.tokenId !== tokenId) {
              continue;
            }

            acc += token.amount;
            selection.push(this._inputs[i]);
          }
        } else {
          acc += this._inputs[i].value;
          selection.push(this._inputs[i]);
        }
      }
    }

    if (!isEmpty(selection)) {
      this._inputs = this._inputs.filter((input) => !selection.includes(input));
    }

    return selection;
  }
}
