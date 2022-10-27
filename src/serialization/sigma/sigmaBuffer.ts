import { toBigInt } from "../../utils/bigIntUtils";
import { VLQ } from "../vlq";
import { ZigZag } from "../zigZag";

export class SigmaBuffer {
  private _bytes!: Uint8Array;
  private _cursor!: number;

  public get length() {
    return this._cursor;
  }

  constructor(maxLength: number) {
    this._bytes = new Uint8Array(maxLength);
    this._cursor = 0;
  }

  public putBoolean(value: boolean): SigmaBuffer {
    this.put(value === true ? 0x01 : 0x00);

    return this;
  }

  public putBooleans(elements: boolean[]): SigmaBuffer {
    for (let i = 0; i < elements.length; i++) {
      this.putBoolean(elements[i]);
    }

    return this;
  }

  public putInt(value: number): SigmaBuffer {
    this.putBytes(VLQ.encode(ZigZag.encode(toBigInt(value))));

    return this;
  }

  public put(byte: number): SigmaBuffer {
    this._bytes[this._cursor++] = byte;

    return this;
  }

  public putBytes(bytes: Uint8Array): SigmaBuffer {
    this._bytes.set(bytes, this._cursor);
    this._cursor += bytes.length;

    return this;
  }

  public putBits(bits: ArrayLike<boolean>): SigmaBuffer {
    let bitOffset = 0;

    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        this._bytes[this._cursor] |= 1 << bitOffset++;
      } else {
        this._bytes[this._cursor] &= ~(1 << bitOffset++);
      }

      if (bitOffset == 8) {
        bitOffset = 0;
        this._cursor++;
      }
    }

    if (bitOffset > 0) {
      this._cursor++;
    }

    return this;
  }

  public toBuffer(): Buffer {
    return Buffer.from(this._bytes.subarray(0, this._cursor));
  }
}
