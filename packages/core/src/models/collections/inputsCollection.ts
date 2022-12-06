import { Amount, Box, BoxId } from "@fleet-sdk/common";
import { isDefined } from "@fleet-sdk/common";
import { DuplicateInputError, NotFoundError } from "../../errors";
import { ErgoUnsignedInput } from "../ergoUnsignedInput";
import { Collection } from "./collection";

export class InputsCollection extends Collection<ErgoUnsignedInput> {
  constructor();
  constructor(box: Box<Amount>);
  constructor(boxes: Box<Amount>[]);
  constructor(boxes?: Box<Amount> | Box<Amount>[]) {
    super();

    if (isDefined(boxes)) {
      this.add(boxes);
    }
  }

  public add(box: Box<Amount>): InputsCollection;
  public add(boxes: Box<Amount>[]): InputsCollection;
  public add(boxes: Box<Amount> | Box<Amount>[]): InputsCollection;
  public add(boxOrBoxes: Box<Amount> | Box<Amount>[]): InputsCollection {
    if (!Array.isArray(boxOrBoxes)) {
      this._add(boxOrBoxes);

      return this;
    }

    for (const box of boxOrBoxes) {
      this._add(box);
    }

    return this;
  }

  private _add(box: Box<Amount>): void {
    if (this._items.some((item) => item.boxId === box.boxId)) {
      throw new DuplicateInputError(box.boxId);
    }

    this._items.push(box instanceof ErgoUnsignedInput ? box : new ErgoUnsignedInput(box));
  }

  public remove(boxId: BoxId): InputsCollection;
  public remove(index: number): InputsCollection;
  public remove(boxIdOrIndex: BoxId | number): InputsCollection {
    let index = -1;
    if (typeof boxIdOrIndex === "number") {
      if (this._isIndexOutOfBounds(boxIdOrIndex)) {
        throw new RangeError(`Index '${boxIdOrIndex}' is out of range.`);
      }

      index = boxIdOrIndex;
    } else {
      index = this._items.findIndex((box) => box.boxId === boxIdOrIndex);

      if (this._isIndexOutOfBounds(index)) {
        throw new NotFoundError(
          "The input you are trying to remove is not present in the inputs collection."
        );
      }
    }

    if (index > -1) {
      this._items.splice(index, 1);
    }

    return this;
  }
}
