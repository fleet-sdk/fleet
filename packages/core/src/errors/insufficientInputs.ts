import { some } from "@fleet-sdk/common";
import { SelectionTarget } from "../builder/selector/boxSelector";

export class InsufficientInputs extends Error {
  readonly unreached: SelectionTarget;

  constructor(unreached: SelectionTarget) {
    const strings = [];
    if (unreached.nanoErgs) {
      strings.push(buildString("nanoErgs", unreached.nanoErgs));
    }

    if (some(unreached.tokens)) {
      for (const token of unreached.tokens) {
        strings.push(buildString(token.tokenId, token.amount));
      }
    }

    super(`Insufficient inputs:${strings.join()}`);

    this.unreached = unreached;
  }
}

function buildString(tokenId: string, amount?: bigint): string {
  return `\n  > ${tokenId}: ${amount?.toString()}`;
}
