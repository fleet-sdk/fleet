import { SigmaPrimaryTypeCode } from "./sigmaPrimaryTypeCode";

export abstract class SigmaType {
  protected readonly typeCode!: SigmaPrimaryTypeCode;

  protected constructor(typeCode: SigmaPrimaryTypeCode) {
    this.typeCode = typeCode;
  }

  public abstract toBytes(): Buffer;
  public abstract toString(): string;
}
