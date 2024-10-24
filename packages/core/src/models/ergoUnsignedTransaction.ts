import {
  type BoxSummary,
  type PlainObjectType,
  type EIP12UnsignedTransaction,
  type UnsignedTransaction,
  utxoDiff,
  utxoSum,
  FleetError
} from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeTransaction } from "@fleet-sdk/serializer";
import { TransactionBuilder } from "../builder";
import type { ErgoUnsignedInput } from "./ergoUnsignedInput";
import type { ErgoBox } from "./ergoBox";
import type { ErgoBoxCandidate } from "./ergoBoxCandidate";
import { ErgoUnsignedTransactionChain } from "./ergoUnsignedTransactionChain";

type TransactionType<T> = T extends "default"
  ? UnsignedTransaction
  : EIP12UnsignedTransaction;

export type ChainCallback = (
  child: TransactionBuilder,
  parent: ErgoUnsignedTransaction
) => TransactionBuilder | ErgoUnsignedTransaction | ErgoUnsignedTransactionChain;

export class ErgoUnsignedTransaction {
  readonly #inputs: ErgoUnsignedInput[];
  readonly #dataInputs: ErgoUnsignedInput[];
  readonly #outputCandidates: ErgoBoxCandidate[];

  #child?: ErgoUnsignedTransaction;
  #outputs?: ErgoBox[];
  #change?: ErgoBox[];
  #id?: string;
  #builder?: TransactionBuilder;

  constructor(
    inputs: ErgoUnsignedInput[],
    dataInputs: ErgoUnsignedInput[],
    outputs: ErgoBoxCandidate[],
    builder?: TransactionBuilder
  ) {
    this.#inputs = inputs;
    this.#dataInputs = dataInputs;
    this.#outputCandidates = outputs;
    this.#builder = builder;
  }

  get id(): string {
    if (!this.#id) {
      this.#id = hex.encode(blake2b256(this.toBytes()));
    }

    return this.#id;
  }

  get inputs(): ErgoUnsignedInput[] {
    return this.#inputs;
  }

  get dataInputs(): ErgoUnsignedInput[] {
    return this.#dataInputs;
  }

  get outputs(): ErgoBox[] {
    if (!this.#outputs) {
      this.#outputs = this.#outputCandidates.map((x, i) => x.toBox(this.id, i));
    }

    return this.#outputs;
  }

  get change(): ErgoBox[] {
    if (!this.#change) {
      this.#change = this.outputs.filter((x) => x.change);
    }

    return this.#change;
  }

  get burning(): BoxSummary {
    const diff = utxoDiff(utxoSum(this.inputs), utxoSum(this.#outputCandidates));
    if (diff.tokens.length > 0) {
      diff.tokens = diff.tokens.filter((x) => x.tokenId !== this.inputs[0].boxId);
    }

    return diff;
  }

  get child(): ErgoUnsignedTransaction | undefined {
    return this.#child;
  }

  chain(callback: ChainCallback): ErgoUnsignedTransactionChain {
    if (!this.#builder) {
      throw new FleetError(
        "Cannot chain transactions without a parent TransactionBuilder"
      );
    }

    const height = this.#builder.creationHeight;
    const builder = new TransactionBuilder(height).from(this.change);
    if (this.#builder.fee) builder.payFee(this.#builder.fee);
    if (this.#builder.changeAddress) builder.sendChangeTo(this.#builder.changeAddress);

    const response = callback(builder, this);
    if (response instanceof TransactionBuilder) {
      this.#child = response.build();
    } else if (response instanceof ErgoUnsignedTransactionChain) {
      this.#child = response.first();
    } else {
      this.#child = response;
    }

    return new ErgoUnsignedTransactionChain(this);
  }

  toPlainObject(): UnsignedTransaction;
  toPlainObject<T extends PlainObjectType>(type: T): TransactionType<T>;
  toPlainObject<T extends PlainObjectType>(type?: T): TransactionType<T> {
    return {
      inputs: this.inputs.map((input) => input.toPlainObject(type ?? "minimal")),
      dataInputs: this.dataInputs.map((input) =>
        input.toDataInputPlainObject(type ?? "minimal")
      ),
      outputs: this.#outputCandidates.map((output) => output.toPlainObject())
    } as TransactionType<T>;
  }

  toEIP12Object(): EIP12UnsignedTransaction {
    return this.toPlainObject("EIP-12");
  }

  toBytes(): Uint8Array {
    return serializeTransaction({
      inputs: this.inputs,
      dataInputs: this.dataInputs,
      outputs: this.#outputCandidates
    }).toBytes();
  }
}
