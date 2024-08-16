import {
  _0n,
  type BoxSummary,
  Collection,
  isDefined,
  isUndefined,
  type OneOrMore,
  some
} from "@fleet-sdk/common";
import type { OutputBuilder } from "../../builder/outputBuilder";
import type { SelectionTarget } from "../../builder/selector/boxSelector";
import { NotFoundError } from "../../errors";

function setSum<K>(map: Map<K, bigint>, key: K, value: bigint) {
  return map.set(key, (map.get(key) || _0n) + value);
}

export class OutputsCollection extends Collection<OutputBuilder, OutputBuilder> {
  constructor(outputs?: OneOrMore<OutputBuilder>) {
    super();
    if (isDefined(outputs)) this.add(outputs);
  }

  protected _map(output: OutputBuilder) {
    return output;
  }

  remove(output: OutputBuilder): number;
  remove(index: number): number;
  remove(outputs: OutputBuilder | number): number {
    let index = -1;
    if (typeof outputs === "number") {
      if (this._isIndexOutOfBounds(outputs)) {
        throw new RangeError(`Index '${outputs}' is out of range.`);
      }

      index = outputs;
    } else {
      index = this._items.lastIndexOf(outputs);

      if (this._isIndexOutOfBounds(index)) {
        throw new NotFoundError(
          "The output you are trying to remove is not present in the outputs collection."
        );
      }
    }

    this._items.splice(index, 1);

    return this.length;
  }

  clone(): OutputsCollection {
    return new OutputsCollection(this._items);
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

          setSum(tokens, token.tokenId, token.amount);
        }
      }
    }

    for (const box of this._items) {
      nanoErgs += box.value;
      for (const token of box.assets) {
        if (token.tokenId) setSum(tokens, token.tokenId, token.amount);
      }
    }

    return {
      nanoErgs,
      tokens: Array.from(tokens, ([tokenId, amount]) => ({ tokenId, amount }))
    };
  }
}
