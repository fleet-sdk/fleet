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
  select(inputs: Box<bigint>[], target?: SelectionTarget): Box<bigint>[] {
    if (!target) {
      return inputs;
    }

    let selection: Box<bigint>[] = [];
    if (!isEmpty(target.tokens)) {
      selection = this._selectTokens(inputs, target.tokens);
    }

    const selectedNanoErgs = sumBy(selection, (input) => input.value);
    if (selectedNanoErgs < target.nanoErgs) {
      selection = selection.concat(this._select(inputs, target.nanoErgs - selectedNanoErgs));
    }

    return selection;
  }

  private _selectTokens(inputs: Box<bigint>[], targets: TokenAmount<bigint>[]): Box<bigint>[] {
    let selection: Box<bigint>[] = [];

    for (const target of targets) {
      const targetAmount = target.amount - sumByTokenId(selection, target.tokenId);
      if (targetAmount <= 0n) {
        continue;
      }

      selection = selection.concat(this._select(inputs, targetAmount, target.tokenId));
    }

    return selection;
  }

  private _select(inputs: Box<bigint>[], target: bigint, tokenId?: TokenId): Box<bigint>[] {
    let acc = 0n;
    const selection: Box<bigint>[] = [];

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

    return selection;
  }
}
