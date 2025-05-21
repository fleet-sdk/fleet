import { type Coder, blake2b256, hex } from "@fleet-sdk/crypto";
import { bigIntToHex } from "./bigint";
import {
  MAX_I16,
  MAX_I32,
  MAX_I64,
  MAX_I256,
  MIN_I16,
  MIN_I32,
  MIN_I64,
  MIN_I256
} from "./numRanges";
import { writeBigVLQ, writeVLQ } from "./vlq";
import { zigZag32, zigZag64 } from "./zigZag";

export class SigmaByteWriter {
  readonly #bytes: Uint8Array;
  #cursor: number;

  get length() {
    return this.#cursor;
  }

  constructor(length: number) {
    this.#bytes = new Uint8Array(length);
    this.#cursor = 0;
  }

  writeBool(value: boolean): SigmaByteWriter {
    this.write(value === true ? 0x01 : 0x00);
    return this;
  }

  writeUInt(value: number): SigmaByteWriter {
    return writeVLQ(this, value);
  }

  writeBigUInt(value: bigint): SigmaByteWriter {
    return writeBigVLQ(this, value);
  }

  writeI16(value: number): SigmaByteWriter {
    if (value < MIN_I16 || value > MAX_I16) {
      throw new RangeError(`Value ${value} is out of range for a 16-bit integer`);
    }

    this.writeBigUInt(zigZag32.encode(value));
    return this;
  }

  writeI32(value: number): SigmaByteWriter {
    if (value < MIN_I32 || value > MAX_I32) {
      throw new RangeError(`Value ${value} is out of range for a 32-bit integer`);
    }

    return this.writeBigUInt(zigZag32.encode(value));
  }

  writeI64(value: bigint): SigmaByteWriter {
    if (value < MIN_I64 || value > MAX_I64) {
      throw new RangeError(`Value ${value} is out of range for a 64-bit integer`);
    }

    return this.writeBigUInt(zigZag64.encode(value));
  }

  writeI256(value: bigint): SigmaByteWriter {
    if (value < MIN_I256 || value > MAX_I256) {
      throw new RangeError(`Value ${value} is out of range for a 256-bit integer`);
    }

    const hex = bigIntToHex(value);
    return this.writeUInt(hex.length / 2).writeHex(hex);
  }

  write(byte: number): SigmaByteWriter {
    this.#bytes[this.#cursor++] = byte;
    return this;
  }

  writeBytes(bytes: ArrayLike<number>): SigmaByteWriter {
    this.#bytes.set(bytes, this.#cursor);
    this.#cursor += bytes.length;
    return this;
  }

  writeHex(bytesHex: string): SigmaByteWriter {
    return this.writeBytes(hex.decode(bytesHex));
  }

  writeBits(bits: ArrayLike<boolean>): SigmaByteWriter {
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

  writeChecksum(length = 4, hashFn = blake2b256): SigmaByteWriter {
    const hash = hashFn(this.toBytes());
    return this.writeBytes(length ? hash.subarray(0, length) : hash);
  }

  /**
   * Writes a length-delimited array of items to the byte stream using a provided
   * serializer function.
   *
   * @typeParam T - The type of items in the array.
   * @param items - The array of items to serialize and write.
   * @param serializer - A function that serializes each item and writes it using the provided SigmaByteWriter.
   * @returns The current instance of SigmaByteWriter for method chaining.
   */
  writeArray<T>(
    items: T[],
    serializer: (writer: SigmaByteWriter, item: T) => void
  ): SigmaByteWriter {
    this.writeUInt(items.length);
    if (items.length === 0) return this;

    for (const item of items) {
      serializer(this, item);
    }

    return this;
  }

  encode<T>(coder: Coder<Uint8Array, T>): T {
    return coder.encode(this.toBytes());
  }

  toBytes(): Uint8Array {
    if (this.#cursor === this.#bytes.length) return this.#bytes;
    return this.#bytes.subarray(0, this.#cursor);
  }
}
