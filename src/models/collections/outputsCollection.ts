import { OutputBuilder } from "../../builder/outputBuilder";
import { NotFoundError } from "../../errors";
import { Collection } from "./collection";

export class OutputsCollection extends Collection<OutputBuilder> {
  constructor(outputs?: OutputBuilder | OutputBuilder[]) {
    super();

    if (outputs) {
      this.add(outputs);
    }
  }

  private _add(outputBuilder: OutputBuilder) {
    this._items.push(outputBuilder);
  }

  public add(output: OutputBuilder): OutputsCollection;
  public add(outputs: OutputBuilder[]): OutputsCollection;
  public add(outputs: OutputBuilder | OutputBuilder[]): OutputsCollection;
  public add(outputs: OutputBuilder | OutputBuilder[]): OutputsCollection {
    if (!Array.isArray(outputs)) {
      this._add(outputs);

      return this;
    }

    for (const output of outputs) {
      this._add(output);
    }

    return this;
  }

  public remove(output: OutputBuilder): OutputsCollection;
  public remove(index: number): OutputsCollection;
  public remove(outputs: OutputBuilder | number): OutputsCollection {
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

    return this;
  }
}
