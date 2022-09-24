import { Box, TokenAmount, TokenId } from "../../../types";
import { isEmpty } from "../../../utils/arrayUtils";
import { sumBy } from "../../../utils/bigIntUtils";
import { sumByTokenId } from "../../../utils/boxUtils";
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
    if (selectedNanoErgs < target.nanoErgs) {
      selection = selection.concat(this._select(target.nanoErgs - selectedNanoErgs));
    }

    return selection;
  }

  private _selectTokens(targets: TokenAmount<bigint>[]): Box<bigint>[] {
    let selection: Box<bigint>[] = [];

    for (const target of targets) {
      const targetAmount = target.amount - sumByTokenId(selection, target.tokenId);
      if (targetAmount <= 0n) {
        continue;
      }

      selection = selection.concat(this._select(targetAmount, target.tokenId));
    }

    return selection;
  }

  private _select(target: bigint, tokenId?: TokenId): Box<bigint>[] {
    let acc = 0n;
    const selection: Box<bigint>[] = [];

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

    if (!isEmpty(selection)) {
      this._inputs = this._inputs.filter((input) => !selection.includes(input));
    }

    return selection;
  }
}
