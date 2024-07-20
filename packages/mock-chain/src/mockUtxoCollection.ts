import {
  type Amount,
  type Box,
  type BoxCandidate,
  type BoxId,
  Collection,
  ensureUTxOBigInt,
  isUndefined,
  type OneOrMore
} from "@fleet-sdk/common";
import { isDefined } from "@fleet-sdk/common";
import { DuplicateInputError, NotFoundError } from "@fleet-sdk/core";
import { mockUTxO } from "./objectMocking";
import type { MockUTxOInput } from "./party/mockChainParty";

function isUTxOCandidate(
  candidate: BoxCandidate<Amount> | Box<Amount>
): candidate is BoxCandidate<Amount> {
  return isUndefined(candidate.boxId);
}

export class MockUTxOCollection extends Collection<Box<bigint>, MockUTxOInput> {
  constructor();
  constructor(box: Box<Amount>);
  constructor(boxes: Box<Amount>[]);
  constructor(boxes?: OneOrMore<Box<Amount>>) {
    super();

    if (isDefined(boxes)) {
      this.add(boxes);
    }
  }

  protected override _map(utxo: BoxCandidate<Amount> | Box<Amount>): Box<bigint> {
    if (isUTxOCandidate(utxo)) {
      return mockUTxO(ensureUTxOBigInt(utxo));
    }

    return ensureUTxOBigInt(utxo);
  }

  protected override _addOne(utxo: Box<Amount>): number {
    if (this._items.some((item) => item.boxId === utxo.boxId)) {
      throw new DuplicateInputError(utxo.boxId);
    }

    return super._addOne(utxo);
  }

  public clear() {
    this._items.length = 0;
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
          "The UTxO you are trying to remove is not present in the UTxOs collection."
        );
      }
    }

    this._items.splice(index, 1);

    return this.length;
  }

  public some(predicate: (item: Box<bigint>) => unknown): boolean {
    return this._items.some(predicate);
  }

  public exists(boxId: string): boolean {
    return this._items.some((x) => x.boxId === boxId);
  }
}
