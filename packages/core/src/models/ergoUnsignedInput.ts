import {
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
import { ErgoBox } from "./ergoBox";

type InputType<T> = T extends "default" ? UnsignedInput : EIP12UnsignedInput;
type DataInputType<T> = T extends "default" ? DataInput : EIP12UnsignedDataInput;
type InputBox<R extends NonMandatoryRegisters> = Box<Amount, R> & {
  extension?: ContextExtension;
};

export class ErgoUnsignedInput<
  R extends NonMandatoryRegisters = NonMandatoryRegisters
> extends ErgoBox<R> {
  private _extension?: ContextExtension;

  public get extension(): ContextExtension | undefined {
    return this._extension;
  }

  constructor(box: InputBox<R>) {
    super(box);

    if (box.extension) {
      this.setContextVars(box.extension);
    }
  }

  public setContextVars(extension: ContextExtension): ErgoUnsignedInput {
    this._extension = extension;

    return this;
  }

  public toUnsignedInputObject<T extends BuildOutputType>(type: T): InputType<T> {
    return {
      ...this.toPlainObject(type),
      extension: this._extension || {}
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
    } else {
      return {
        boxId: this.boxId
      } as DataInputType<T>;
    }
  }
}
