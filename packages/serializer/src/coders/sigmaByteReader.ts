import { startsWith } from "@fleet-sdk/common";
import { type ByteInput, ensureBytes, hex } from "@fleet-sdk/crypto";
import { hexToBigInt } from "./bigint";
import { MAX_I8, MAX_U8 } from "./numRanges";
import { readBigVLQ, readVLQ } from "./vlq";
import { zigZag32, zigZag64 } from "./zigZag";

export class SigmaByteReader {
  readonly #bytes: Uint8Array;
  #cursor: number;

  get isEmpty(): boolean {
    return this.#bytes.length === this.#cursor;
  }

  get bytes(): Uint8Array {
    return this.#bytes;
  }

  get cursor(): number {
    return this.#cursor;
  }

  constructor(bytes: ByteInput) {
    this.#bytes = ensureBytes(bytes);
    this.#cursor = 0;
  }

  readArray<T>(readFn: (reader: SigmaByteReader, index: number) => T): Array<T> {
    const length = this.readUInt();
    const items = new Array<T>(length);

    for (let i = 0; i < length; i++) {
      items[i] = readFn(this, i);
    }

    return items;
  }

  readBool(): boolean {
    return this.readByte() === 0x01;
  }

  readBits(length: number): ArrayLike<boolean> {
    const bits = new Array<boolean>(length);
    let bitOffset = 0;

    for (let i = 0; i < length; i++) {
      const bit = (this.#bytes[this.#cursor] >> bitOffset++) & 1;
      bits[i] = bit === 1;

      if (bitOffset === 8) {
        bitOffset = 0;
        this.#cursor++;
      }
    }

    if (bitOffset > 0) this.#cursor++;

    return bits;
  }

  readByte(): number {
    return this.#bytes[this.#cursor++];
  }

  readBytes(length: number): Uint8Array {
    return this.#bytes.subarray(this.#cursor, (this.#cursor += length));
  }

  readUInt(): number {
    return readVLQ(this);
  }

  readBigUInt(): bigint {
    return readBigVLQ(this);
  }

  readI8(): number {
    const byte = this.readByte();
    return byte > MAX_I8 ? byte - (MAX_U8 + 1) : byte;
  }

  readI16(): number {
    return zigZag32.decode(readBigVLQ(this));
  }

  readI32(): number {
    return zigZag32.decode(readBigVLQ(this));
  }

  readI64(): bigint {
    return zigZag64.decode(readBigVLQ(this));
  }

  readI256(): bigint {
    const len = readVLQ(this);
    return hexToBigInt(hex.encode(this.readBytes(len)));
  }

  readRemainingBytes(): Uint8Array {
    return this.readBytes(this.#bytes.length - this.#cursor);
  }

  /**
   * Returns bytes without advancing the cursor.
   */
  peek(count: number, offset = 0): Uint8Array {
    const begin = this.#cursor + offset;
    return this.#bytes.subarray(begin, begin + count);
  }

  /**
   * Checks if the current position in the byte array starts with the given bytes.
   */
  match(bytes: Uint8Array, offset = 0): boolean {
    return startsWith(this.#bytes, bytes, this.#cursor + offset);
  }
}
