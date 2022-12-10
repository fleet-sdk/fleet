import { _0n, BoxAmounts, isDefined, isUndefined, some } from "@fleet-sdk/common";
import { OutputBuilder } from "../../builder/outputBuilder";
import { SelectionTarget } from "../../builder/selector/boxSelector";
import { NotFoundError } from "../../errors";
import { Collection } from "./collection";

export type AddOutputOptions = { index: number };

export class OutputsCollection extends Collection<OutputBuilder, OutputBuilder> {
  constructor(outputs?: OutputBuilder | OutputBuilder[]) {
    super();

    if (isDefined(outputs)) {
      this.add(outputs);
    }
  }

  protected override _addOne(output: OutputBuilder, options?: AddOutputOptions): number {
    if (isDefined(options) && isDefined(options.index)) {
      if (this._isIndexOutOfBounds(options.index)) {
        throw new RangeError(`Index '${options.index}' is out of range.`);
      }

      this._items.splice(options.index, 0, output);
    } else {
      this._items.push(output);
    }

    return this._items.length;
  }

  public override add(
    outputs: OutputBuilder | OutputBuilder[],
    options?: AddOutputOptions
  ): number {
    if (Array.isArray(outputs) && isDefined(options) && isDefined(options.index)) {
      return this._addOneOrMore(outputs.reverse(), options);
    }

    return this._addOneOrMore(outputs, options);
  }

  public remove(output: OutputBuilder): number;
  public remove(index: number): number;
  public remove(outputs: OutputBuilder | number): number {
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

    if (index > -1) {
      this._items.splice(index, 1);
    }

    return this.length;
  }

  public clone(): OutputsCollection {
    return new OutputsCollection(this._items);
  }

  public sum(basis?: SelectionTarget | BoxAmounts): BoxAmounts {
    const tokens: { [tokenId: string]: bigint } = {};
    let nanoErgs = _0n;

    if (basis) {
      if (basis.nanoErgs) {
        nanoErgs = basis.nanoErgs;
      }

      if (some(basis.tokens)) {
        for (const token of basis.tokens) {
          if (isUndefined(token.amount)) {
            continue;
          }

          tokens[token.tokenId] = (tokens[token.tokenId] || _0n) + token.amount;
        }
      }
    }

    for (const box of this._items) {
      nanoErgs += box.value;
      for (const token of box.tokens) {
        tokens[token.tokenId] = (tokens[token.tokenId] || _0n) + token.amount;
      }
    }

    return {
      nanoErgs,
      tokens: Object.keys(tokens).map((tokenId) => ({ tokenId, amount: tokens[tokenId] }))
    };
  }
}
