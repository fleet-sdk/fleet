import { bigIntToHex } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { writeBigVLQ, writeVLQ } from "./vlq";
import { zigZagEncode, zigZagEncodeBigInt } from "./zigZag";

export class SigmaWriter {
  readonly #bytes: Uint8Array;
  #cursor: number;

  public get length() {
    return this.#cursor;
  }

  constructor(maxLength: number) {
    this.#bytes = new Uint8Array(maxLength);
    this.#cursor = 0;
  }

  public writeBoolean(value: boolean): SigmaWriter {
    this.write(value === true ? 0x01 : 0x00);

    return this;
  }

  public writeVLQ(value: number): SigmaWriter {
    return writeVLQ(this, value);
  }

  public writeBigVLQ(value: bigint): SigmaWriter {
    return writeBigVLQ(this, value);
  }

  public writeShort(value: number): SigmaWriter {
    this.writeVLQ(zigZagEncode(value));

    return this;
  }

  public writeInt(value: number): SigmaWriter {
    this.writeLong(BigInt(value));

    return this;
  }

  public writeLong(value: bigint): SigmaWriter {
    this.writeBigVLQ(zigZagEncodeBigInt(value));

    return this;
  }

  public write(byte: number): SigmaWriter {
    this.#bytes[this.#cursor++] = byte;

    return this;
  }

  public writeBytes(bytes: Uint8Array): SigmaWriter {
    this.#bytes.set(bytes, this.#cursor);
    this.#cursor += bytes.length;

    return this;
  }

  public writeHex(hex: string): SigmaWriter {
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

  public writeBits(bits: ArrayLike<boolean>): SigmaWriter {
    let bitOffset = 0;

    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        this.#bytes[this.#cursor] |= 1 << bitOffset++;
      } else {
        this.#bytes[this.#cursor] &= ~(1 << bitOffset++);
      }

      if (bitOffset == 8) {
        bitOffset = 0;
        this.#cursor++;
      }
    }

    if (bitOffset > 0) {
      this.#cursor++;
    }

    return this;
  }

  public writeBigInt(value: bigint): SigmaWriter {
    const hex = bigIntToHex(value);
    this.writeVLQ(hex.length / 2);
    this.writeHex(hex);

    return this;
  }

  public toHex(): string {
    return hex.encode(this.toBytes());
  }

  public toBytes(): Uint8Array {
    return this.#bytes.subarray(0, this.#cursor);
  }
}
