import { Amount, Box, BoxId, Collection, OneOrMore } from "@fleet-sdk/common";
import { isDefined } from "@fleet-sdk/common";
import { DuplicateInputError, NotFoundError } from "../../errors";
import { ErgoUnsignedInput } from "../ergoUnsignedInput";

export class InputsCollection extends Collection<
  ErgoUnsignedInput,
  Box<Amount>
> {
  constructor();
  constructor(box: Box<Amount>);
  constructor(boxes: Box<Amount>[]);
  constructor(boxes?: OneOrMore<Box<Amount>>) {
    super();

    if (isDefined(boxes)) {
      this.add(boxes);
    }
  }

  protected override _map(
    input: Box<Amount> | ErgoUnsignedInput
  ): ErgoUnsignedInput {
    return input instanceof ErgoUnsignedInput
      ? input
      : new ErgoUnsignedInput(input);
  }

  protected override _addOne(box: Box<Amount>): number {
    if (this._items.some((item) => item.boxId === box.boxId)) {
      throw new DuplicateInputError(box.boxId);
    }

    return super._addOne(box);
  }

  public remove(boxId: BoxId): number;
  public remove(index: number): number;
  public remove(boxIdOrIndex: BoxId | number): number {
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

    this._items.splice(index, 1);

    return this.length;
  }
}
