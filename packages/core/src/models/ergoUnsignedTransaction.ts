import {
  type BoxCandidate,
  type BoxSummary,
  type BuildOutputType,
  type EIP12UnsignedTransaction,
  type UnsignedTransaction,
  utxoDiff,
  utxoSum
} from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeTransaction } from "@fleet-sdk/serializer";
import type { ErgoUnsignedInput } from "./ergoUnsignedInput";

type Input = ErgoUnsignedInput;
type Output = BoxCandidate<bigint>;
type ReadOnlyInputs = readonly Input[];
type ReadOnlyOutputs = readonly Output[];

type TransactionType<T> = T extends "default"
  ? UnsignedTransaction
  : EIP12UnsignedTransaction;

export class ErgoUnsignedTransaction {
  readonly #inputs!: ReadOnlyInputs;
  readonly #dataInputs!: ReadOnlyInputs;
  readonly #outputs!: ReadOnlyOutputs;

  constructor(inputs: Input[], dataInputs: Input[], outputs: Output[]) {
    this.#inputs = Object.freeze(inputs);
    this.#dataInputs = Object.freeze(dataInputs);
    this.#outputs = Object.freeze(outputs);
  }

  get id(): string {
    return hex.encode(blake2b256(this.toBytes()));
  }

  get inputs(): ReadOnlyInputs {
    return this.#inputs;
  }

  get dataInputs(): ReadOnlyInputs {
    return this.#dataInputs;
  }

  get outputs(): ReadOnlyOutputs {
    return this.#outputs;
  }

  get burning(): BoxSummary {
    const diff = utxoDiff(utxoSum(this.inputs), utxoSum(this.outputs));
    if (diff.tokens.length > 0) {
      diff.tokens = diff.tokens.filter((x) => x.tokenId !== this.inputs[0].boxId);
    }

    return diff;
  }

  toPlainObject(): UnsignedTransaction;
  toPlainObject<T extends BuildOutputType>(type: T): TransactionType<T>;
  toPlainObject<T extends BuildOutputType>(type?: T): TransactionType<T> {
    return {
      inputs: this.inputs.map((input) => input.toUnsignedInputObject(type || "default")),
      dataInputs: this.dataInputs.map((input) => input.toPlainObject(type || "default")),
      outputs: this.outputs.map(stringifyBoxAmounts)
    } as TransactionType<T>;
  }

  toEIP12Object(): EIP12UnsignedTransaction {
    return this.toPlainObject("EIP-12");
  }

  toBytes(): Uint8Array {
    return serializeTransaction({
      inputs: this.inputs.map((input) => input.toUnsignedInputObject("default")),
      dataInputs: this.dataInputs.map((input) => input.toPlainObject("default")),
      outputs: this.outputs
    }).toBytes();
  }
}

function stringifyBoxAmounts<T>(output: BoxCandidate<bigint>): T {
  return {
    ...output,
    value: output.value.toString(),
    assets: output.assets.map((token) => ({
      tokenId: token.tokenId,
      amount: token.amount.toString()
    }))
  } as T;
}
