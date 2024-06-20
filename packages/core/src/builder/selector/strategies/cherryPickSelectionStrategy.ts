import { Box, orderBy } from "@fleet-sdk/common";
import { SelectionTarget } from "../boxSelector";
import { AccumulativeSelectionStrategy } from "./accumulativeSelectionStrategy";

/**
 * The Cherry Pick strategy accumulates inputs until the target amounts trying
 * to pick inputs with as less as possible unused tokens.
 */
export class CherryPickSelectionStrategy extends AccumulativeSelectionStrategy {
  public override select(
    inputs: Box<bigint>[],
    target: SelectionTarget
  ): Box<bigint>[] {
    const orderedInputs = orderBy(
      inputs,
      (x) => new Set(x.assets.map((asset) => asset.tokenId)).size,
      "asc"
    );

    return super.select(orderedInputs, target);
  }
}
