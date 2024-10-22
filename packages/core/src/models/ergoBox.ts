import type {
  Amount,
  Box,
  NonMandatoryRegisters,
  BoxCandidate,
  TokenAmount,
  PlainObjectType,
  DataInput
} from "@fleet-sdk/common";
import { FleetError, isDefined } from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeBox } from "@fleet-sdk/serializer";
import { ErgoBoxCandidate } from "./ergoBoxCandidate";
import { isUndefined } from "packages/common/src";

export class ErgoBox<R extends NonMandatoryRegisters = NonMandatoryRegisters> {
  #candidate: ErgoBoxCandidate<R>;

  #boxId?: string;
  #transactionId: string;
  #index: number;

  get value(): bigint {
    return this.#candidate.value;
  }

  get ergoTree(): string {
    return this.#candidate.ergoTree;
  }

  get creationHeight(): number {
    return this.#candidate.creationHeight;
  }

  get assets(): TokenAmount<bigint>[] {
    return this.#candidate.assets;
  }

  get additionalRegisters(): R {
    return this.#candidate.additionalRegisters;
  }

  get boxId(): string {
    if (!this.#boxId) {
      this.#boxId = hex.encode(blake2b256(serializeBox(this).toBytes()));
    }

    return this.#boxId;
  }

  get transactionId(): string {
    return this.#transactionId;
  }

  get index(): number {
    return this.#index;
  }

  get change(): boolean {
    return !!this.#candidate.flags?.change;
  }

  constructor(candidate: ErgoBoxCandidate<R>, transactionId: string, index: number);
  constructor(box: Box<Amount, R>);
  constructor(
    box: Box<Amount, R> | ErgoBoxCandidate<R>,
    transactionId?: string,
    index?: number
  ) {
    if (isBox(box)) {
      this.#candidate = new ErgoBoxCandidate(box);
      this.#transactionId = box.transactionId;
      this.#index = box.index;
      this.#boxId = box.boxId;
    } else {
      if (!transactionId || isUndefined(index)) {
        throw new FleetError(
          "TransactionId and Index must be provided for Box generation."
        );
      }

      this.#candidate = box instanceof ErgoBoxCandidate ? box : new ErgoBoxCandidate(box);
      this.#transactionId = transactionId;
      this.#index = index;
    }
  }

  toPlainObject(type: "minimal"): DataInput;
  toPlainObject(type: "EIP-12"): Box<string>;
  toPlainObject(type: PlainObjectType): Box<string> | DataInput;
  toPlainObject(type: PlainObjectType): Box<string> | DataInput {
    if (type === "minimal") return { boxId: this.boxId };

    return {
      boxId: this.boxId,
      ...this.#candidate.toPlainObject(),
      transactionId: this.transactionId,
      index: this.index
    };
  }

  toCandidate(): ErgoBoxCandidate<R> {
    return this.#candidate;
  }

  public isValid(): boolean {
    return ErgoBox.validate(this);
  }

  static validate(box: Box<Amount> | ErgoBox): boolean {
    const bytes = serializeBox(box).toBytes();
    const hash = hex.encode(blake2b256(bytes));

    return box.boxId === hash;
  }
}

function isBox<T extends Amount>(box: Box<Amount> | BoxCandidate<Amount>): box is Box<T> {
  const castedBox = box as Box<T>;
  return !!castedBox.boxId && !!castedBox.transactionId && isDefined(castedBox.index);
}
