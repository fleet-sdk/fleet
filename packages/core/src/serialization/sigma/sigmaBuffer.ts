import { _0n, ensureBigInt } from "@fleet-sdk/common";
import { bytesToHex } from "@noble/hashes/utils";
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
    this.putBytes(VLQ.encode(ZigZag.encode(ensureBigInt(value))));

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

  public putHex(hex: string): SigmaBuffer {
    if (hex.length % 2) {
      throw new Error("Invalid hex padding");
    }

    for (let i = 0; i < hex.length / 2; i++) {
      const j = i * 2;
      const byte = Number.parseInt(hex.slice(j, j + 2), 16);

      if (Number.isNaN(byte) || byte < 0) {
        throw new Error("Invalid byte sequence");
      }

      this.put(byte);
    }

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

  public putBigInt(number: bigint): SigmaBuffer {
    if (number < _0n) {
      throw new Error("Negative BigInt values are not supported Fleet serializer.");
    }

    let hex = number.toString(16);
    if (hex.length % 2) {
      hex = "0" + hex;
    } else if (Number.parseInt(hex.substring(0, 1), 16) >= 8) {
      // maximum positive need to prepend 0 otherwise results in negative number
      hex = "00" + hex;
    }

    this.putBytes(VLQ.encode(hex.length / 2));
    this.putHex(hex);

    return this;
  }

  public toHex(): string {
    return bytesToHex(this._bytes.subarray(0, this._cursor));
  }

  public toBytes(): Uint8Array {
    return this._bytes.subarray(0, this._cursor);
  }
}
