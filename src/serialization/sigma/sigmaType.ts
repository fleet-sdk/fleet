import { SigmaPrimaryTypeCode } from "./sigmaPrimaryTypeCode";

export abstract class SigmaType {
  protected readonly _typeCode!: SigmaPrimaryTypeCode;

  protected constructor(typeCode: SigmaPrimaryTypeCode) {
    this._typeCode = typeCode;
  }

  public abstract toBytes(): Buffer;
  public abstract toString(): string;
}
