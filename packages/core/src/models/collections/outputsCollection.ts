import {
  _0n,
  BoxSummary,
  Collection,
  isDefined,
  isUndefined,
  OneOrMore,
  some
} from "@fleet-sdk/common";
import { OutputBuilder } from "../../builder/outputBuilder";
import { SelectionTarget } from "../../builder/selector/boxSelector";
import { NotFoundError } from "../../errors";

function setsum<K>(map: Map<K, bigint>, key: K, value: bigint) {
  return map.set(key, (map.get(key) || _0n) + value);
}

export class OutputsCollection extends Collection<OutputBuilder, OutputBuilder> {
  constructor(outputs?: OneOrMore<OutputBuilder>) {
    super();

    if (isDefined(outputs)) {
      this.add(outputs);
    }
  }

  protected map(output: OutputBuilder) {
    return output;
  }

  remove(output: OutputBuilder): number;
  remove(index: number): number;
  remove(outputs: OutputBuilder | number): number {
    let index = -1;
    if (typeof outputs === "number") {
      if (this.isOutOfBounds(outputs)) {
        throw new RangeError(`Index '${outputs}' is out of range.`);
      }

      index = outputs;
    } else {
      index = this.items.lastIndexOf(outputs);

      if (this.isOutOfBounds(index)) {
        throw new NotFoundError(
          "The output you are trying to remove is not present in the outputs collection."
        );
      }
    }

    this.items.splice(index, 1);

    return this.length;
  }

  clone(): OutputsCollection {
    return new OutputsCollection(this.items);
  }

  sum(basis?: SelectionTarget | BoxSummary): BoxSummary {
    const tokens = new Map<string, bigint>();
    let nanoErgs = _0n;

    if (basis) {
      if (basis.nanoErgs) {
        nanoErgs = basis.nanoErgs;
      }

      if (some(basis.tokens)) {
        for (const token of basis.tokens) {
          if (isUndefined(token.amount)) continue;

          setsum(tokens, token.tokenId, token.amount);
        }
      }
    }

    for (const box of this.items) {
      nanoErgs += box.value;
      for (const token of box.assets) {
        if (token.tokenId) setsum(tokens, token.tokenId, token.amount);
      }
    }

    return {
      nanoErgs,
      tokens: Array.from(tokens, ([tokenId, amount]) => ({ tokenId, amount }))
    };
  }
}
