import { blake2b256, type Coder, hex } from "@fleet-sdk/crypto";
import { bigIntToHex } from "./bigint";
import { writeBigVLQ, writeVLQ } from "./vlq";
import { zigZagEncode, zigZag32, zigZagEncodeBigInt } from "./zigZag";

export class SigmaByteWriter {
  readonly #bytes: Uint8Array;
  #cursor: number;

  public get length() {
    return this.#cursor;
  }

  constructor(length: number) {
    this.#bytes = new Uint8Array(length);
    this.#cursor = 0;
  }

  public writeBoolean(value: boolean): SigmaByteWriter {
    this.write(value === true ? 0x01 : 0x00);

    return this;
  }

  public writeVLQ(value: number): SigmaByteWriter {
    return writeVLQ(this, value);
  }

  public writeBigVLQ(value: bigint): SigmaByteWriter {
    return writeBigVLQ(this, value);
  }

  public writeShort(value: number): SigmaByteWriter {
    this.writeVLQ(zigZagEncode(value));
    return this;
  }

  public writeInt(value: number): SigmaByteWriter {
    return this.writeBigVLQ(zigZag32.encode(value));
  }

  public writeLong(value: bigint): SigmaByteWriter {
    this.writeBigVLQ(zigZagEncodeBigInt(value));
    return this;
  }

  public write(byte: number): SigmaByteWriter {
    this.#bytes[this.#cursor++] = byte;
    return this;
  }

  public writeBytes(bytes: ArrayLike<number>): SigmaByteWriter {
    this.#bytes.set(bytes, this.#cursor);
    this.#cursor += bytes.length;
    return this;
  }

  public writeHex(bytesHex: string): SigmaByteWriter {
    return this.writeBytes(hex.decode(bytesHex));
  }

  public writeBits(bits: ArrayLike<boolean>): SigmaByteWriter {
    let bitOffset = 0;

    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        this.#bytes[this.#cursor] |= 1 << bitOffset++;
      } else {
        this.#bytes[this.#cursor] &= ~(1 << bitOffset++);
      }

      if (bitOffset === 8) {
        bitOffset = 0;
        this.#cursor++;
      }
    }

    if (bitOffset > 0) this.#cursor++;

    return this;
  }

  public writeBigInt(value: bigint): SigmaByteWriter {
    const hex = bigIntToHex(value);
    return this.writeVLQ(hex.length / 2).writeHex(hex);
  }

  public writeChecksum(length = 4, hashFn = blake2b256): SigmaByteWriter {
    const hash = hashFn(this.toBytes());
    return this.writeBytes(length ? hash.subarray(0, length) : hash);
  }

  public encode<T>(coder: Coder<Uint8Array, T>): T {
    return coder.encode(this.toBytes());
  }

  public toBytes(): Uint8Array {
    if (this.#cursor === this.#bytes.length) return this.#bytes;
    return this.#bytes.subarray(0, this.#cursor);
  }
}
