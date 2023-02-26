import { HexString, isEmpty } from "@fleet-sdk/common";
import { hexToBytes } from "@noble/hashes/utils";
import { vlqDecode, vlqDecodeBigInt } from "../vlq";
import { zigZagDecode, zigZagDecodeBigInt } from "../zigZag";
import { SigmaTypeCode } from "./sigmaTypeCode";

export class SigmaByteReader {
  private _bytes!: Uint8Array;
  private _cursor!: number;

  public get isEmpty(): boolean {
    return isEmpty(this._bytes);
  }

  constructor(bytes: HexString | Uint8Array) {
    if (typeof bytes === "string") {
      this._bytes = hexToBytes(bytes);
    } else {
      this._bytes = bytes;
    }

    this._cursor = 0;
  }

  public readBoolean(): boolean {
    return this.readByte() === 0x01;
  }

  public readByte(): number {
    return this._bytes[this._cursor++];
  }

  public readBytes(length: number): Uint8Array {
    const bytes = this._bytes.subarray(this._cursor, length);
    this._cursor += length;

    return bytes;
  }

  public readType(): SigmaTypeCode {
    return this.readByte();
  }

  public readNumber(): number {
    return Number(zigZagDecode(vlqDecode(this)));
  }

  public readLong(): bigint {
    return zigZagDecodeBigInt(vlqDecodeBigInt(this));
  }
}
