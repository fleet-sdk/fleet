import {
  BoxCandidate,
  BoxSummary,
  BuildOutputType,
  EIP12UnsignedTransaction,
  UnsignedTransaction,
  utxoDiff,
  utxoSum
} from "@fleet-sdk/common";
import { blake2b256, hex } from "@fleet-sdk/crypto";
import { serializeTransaction } from "../serializer/sigma/transactionSerializer";
import { ErgoUnsignedInput } from "./ergoUnsignedInput";

type Input = ErgoUnsignedInput;
type Output = BoxCandidate<bigint>;
type ReadOnlyInputs = readonly Input[];
type ReadOnlyOutputs = readonly Output[];

type TransactionType<T> = T extends "default" ? UnsignedTransaction : EIP12UnsignedTransaction;

export class ErgoUnsignedTransaction {
  private readonly _inputs!: ReadOnlyInputs;
  private readonly _dataInputs!: ReadOnlyInputs;
  private readonly _outputs!: ReadOnlyOutputs;

  constructor(inputs: Input[], dataInputs: Input[], outputs: Output[]) {
    this._inputs = Object.freeze(inputs);
    this._dataInputs = Object.freeze(dataInputs);
    this._outputs = Object.freeze(outputs);
  }

  get id(): string {
    return hex.encode(blake2b256(this.toBytes()));
  }

  get inputs(): ReadOnlyInputs {
    return this._inputs;
  }

  get dataInputs(): ReadOnlyInputs {
    return this._dataInputs;
  }

  get outputs(): ReadOnlyOutputs {
    return this._outputs;
  }

  get burning(): BoxSummary {
    return utxoDiff(utxoSum(this.inputs), utxoSum(this.outputs));
  }

  toPlainObject(): UnsignedTransaction;
  toPlainObject<T extends BuildOutputType>(outputType: T): TransactionType<T>;
  toPlainObject<T extends BuildOutputType>(outputType?: T): TransactionType<T> {
    return {
      inputs: this.inputs.map((input) => input.toUnsignedInputObject(outputType || "default")),
      dataInputs: this.dataInputs.map((input) => input.toPlainObject(outputType || "default")),
      outputs: this.outputs.map((output) => _stringifyBoxAmounts(output))
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

function _stringifyBoxAmounts<T>(output: BoxCandidate<bigint>): T {
  return {
    ...output,
    value: output.value.toString(),
    assets: output.assets.map((token) => ({
      tokenId: token.tokenId,
      amount: token.amount.toString()
    }))
  } as T;
}
