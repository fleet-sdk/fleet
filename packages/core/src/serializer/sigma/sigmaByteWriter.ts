import { _0n } from "@fleet-sdk/common";
import { bytesToHex } from "@noble/hashes/utils";
import { vlqEncode, vqlEncodeBigInt } from "../vlq";
import { zigZagEncode, zigZagEncodeBigInt } from "../zigZag";

export class SigmaByteWriter {
  private _bytes!: Uint8Array;
  private _cursor!: number;

  public get length() {
    return this._cursor;
  }

  constructor(maxLength: number) {
    this._bytes = new Uint8Array(maxLength);
    this._cursor = 0;
  }

  public writeBoolean(value: boolean): SigmaByteWriter {
    this.write(value === true ? 0x01 : 0x00);

    return this;
  }

  public writeBooleans(elements: boolean[]): SigmaByteWriter {
    for (let i = 0; i < elements.length; i++) {
      this.writeBoolean(elements[i]);
    }

    return this;
  }

  public writeNumber(value: number): SigmaByteWriter {
    this.writeBytes(vlqEncode(zigZagEncode(value)));

    return this;
  }

  public writeLong(value: bigint): SigmaByteWriter {
    this.writeBytes(vqlEncodeBigInt(zigZagEncodeBigInt(value)));

    return this;
  }

  public write(byte: number): SigmaByteWriter {
    this._bytes[this._cursor++] = byte;

    return this;
  }

  public writeBytes(bytes: Uint8Array): SigmaByteWriter {
    this._bytes.set(bytes, this._cursor);
    this._cursor += bytes.length;

    return this;
  }

  public writeHex(hex: string): SigmaByteWriter {
    if (hex.length % 2) {
      throw new Error("Invalid hex padding");
    }

    for (let i = 0; i < hex.length / 2; i++) {
      const j = i * 2;
      const byte = Number.parseInt(hex.slice(j, j + 2), 16);

      if (Number.isNaN(byte) || byte < 0) {
        throw new Error("Invalid byte sequence");
      }

      this.write(byte);
    }

    return this;
  }

  public writeBits(bits: ArrayLike<boolean>): SigmaByteWriter {
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

  public writeBigInt(number: bigint): SigmaByteWriter {
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

    this.writeBytes(vlqEncode(hex.length / 2));
    this.writeHex(hex);

    return this;
  }

  public toHex(): string {
    return bytesToHex(this._bytes.subarray(0, this._cursor));
  }

  public toBytes(): Uint8Array {
    return this._bytes.subarray(0, this._cursor);
  }
}
