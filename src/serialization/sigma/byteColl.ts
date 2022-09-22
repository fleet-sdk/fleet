import { VLQ } from "../vlq";
import { SigmaConstructorTypeCode } from "./sigmaConstructorTypeCode";
import { SigmaPrimaryTypeCode } from "./sigmaPrimaryTypeCode";
import { SigmaType } from "./sigmaType";

export class ByteColl extends SigmaType {
  private _bytes: Buffer;

  constructor(bytes: Buffer) {
    super(SigmaConstructorTypeCode.Coll + SigmaPrimaryTypeCode.Byte);

    this._bytes = bytes;
  }

  public toBytes(): Buffer {
    return Buffer.from([this._typeCode, ...VLQ.encode(this._bytes.length), ...this._bytes]);
  }

  public toString(): string {
    return this.toBytes().toString("hex");
  }
}
