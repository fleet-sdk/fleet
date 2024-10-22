import type {
  Amount,
  Box,
  BuildOutputType,
  ContextExtension,
  DataInput,
  EIP12UnsignedDataInput,
  EIP12UnsignedInput,
  NonMandatoryRegisters,
  UnsignedInput
} from "@fleet-sdk/common";
import type { ConstantInput } from "../builder";
import { ErgoBox } from "./ergoBox";

type InputType<T> = T extends "default" ? UnsignedInput : EIP12UnsignedInput;
type DataInputType<T> = T extends "default" ? DataInput : EIP12UnsignedDataInput;
type InputBox<R extends NonMandatoryRegisters> = Box<Amount, R> & {
  extension?: ContextExtension;
};
type ContextExtensionInput = ContextExtension<ConstantInput>;

export class ErgoUnsignedInput<
  R extends NonMandatoryRegisters = NonMandatoryRegisters
> extends ErgoBox<R> {
  #extension?: ContextExtension;

  public get extension(): ContextExtension | undefined {
    return this.#extension;
  }

  constructor(box: InputBox<R>) {
    super(box);
    if (box.extension) this.setContextExtension(box.extension);
  }

  public setContextExtension(extension: ContextExtensionInput): ErgoUnsignedInput {
    const vars: ContextExtension = {};
    for (const key in extension) {
      const c = extension[key] as ConstantInput;
      if (!c) continue;

      vars[key as unknown as keyof ContextExtension] =
        typeof c === "string" ? c : c.toHex();
    }

    this.#extension = vars;

    return this;
  }

  /**
   * @deprecated use `setContextExtension` instead.
   */
  public setContextVars(extension: ContextExtensionInput): ErgoUnsignedInput {
    return this.setContextExtension(extension);
  }

  public toUnsignedInputObject<T extends BuildOutputType>(type: T): InputType<T> {
    return {
      ...this.toPlainObject(type),
      extension: this.#extension || {}
    } as InputType<T>;
  }

  public toPlainObject<T extends BuildOutputType>(type: T): DataInputType<T> {
    if (type === "EIP-12") {
      return {
        boxId: this.boxId,
        value: this.value.toString(),
        ergoTree: this.ergoTree,
        creationHeight: this.creationHeight,
        assets: this.assets.map((asset) => ({
          tokenId: asset.tokenId,
          amount: asset.amount.toString()
        })),
        additionalRegisters: this.additionalRegisters,
        transactionId: this.transactionId,
        index: this.index
      } as DataInputType<T>;
    }

    return { boxId: this.boxId } as DataInputType<T>;
  }
}
