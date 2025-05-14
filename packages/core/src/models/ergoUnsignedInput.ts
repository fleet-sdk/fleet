import type {
  Amount,
  Box,
  ContextExtension,
  DataInput,
  EIP12UnsignedDataInput,
  EIP12UnsignedInput,
  NonMandatoryRegisters,
  PlainObjectType,
  UnsignedInput
} from "@fleet-sdk/common";
import type { ConstantInput } from "../builder";
import { ErgoBox } from "./ergoBox";

type InputBox<R extends NonMandatoryRegisters> = Box<Amount, R> & {
  extension?: ContextExtension;
};
type ContextExtensionInput = ContextExtension<ConstantInput>;

export class ErgoUnsignedInput<
  R extends NonMandatoryRegisters = NonMandatoryRegisters
> extends ErgoBox<R> {
  #extension?: ContextExtension;

  get extension(): ContextExtension {
    return this.#extension || {};
  }

  constructor(box: InputBox<R>) {
    super(box);
    if (box.extension) this.setContextExtension(box.extension);
  }

  setContextExtension(extension: ContextExtensionInput): ErgoUnsignedInput {
    const vars: ContextExtension = {};
    for (const key in extension) {
      const c = extension[key] as ConstantInput;
      if (!c) continue;

      vars[key as unknown as keyof ContextExtension] = typeof c === "string" ? c : c.toHex();
    }

    this.#extension = vars;

    return this;
  }

  /**
   * @deprecated use `setContextExtension` instead.
   */
  setContextVars(extension: ContextExtensionInput): ErgoUnsignedInput {
    return this.setContextExtension(extension);
  }

  override toPlainObject(type: "EIP-12"): EIP12UnsignedInput;
  override toPlainObject(type: "minimal"): UnsignedInput;
  override toPlainObject(type: PlainObjectType): EIP12UnsignedInput | UnsignedInput;
  override toPlainObject(type: PlainObjectType): EIP12UnsignedInput | UnsignedInput {
    return { ...super.toPlainObject(type), extension: this.extension };
  }

  toDataInputPlainObject(type: "EIP-12"): EIP12UnsignedDataInput;
  toDataInputPlainObject(type: "minimal"): DataInput;
  toDataInputPlainObject(type: PlainObjectType): EIP12UnsignedDataInput | DataInput;
  toDataInputPlainObject(type: PlainObjectType): EIP12UnsignedDataInput | DataInput {
    return super.toPlainObject(type);
  }
}
