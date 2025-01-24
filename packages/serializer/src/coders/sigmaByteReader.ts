import { isEmpty } from "@fleet-sdk/common";
import { type ByteInput, ensureBytes, hex } from "@fleet-sdk/crypto";
import { hexToBigInt } from "./bigint";
import { readBigVLQ, readVLQ } from "./vlq";
import { zigZag32, zigZag64 } from "./zigZag";
import { MAX_I8, MAX_U8 } from "./numRanges";

export class SigmaByteReader {
  readonly #bytes: Uint8Array;
  #cursor: number;

  public get isEmpty(): boolean {
    return isEmpty(this.#bytes);
  }

  constructor(bytes: ByteInput) {
    this.#bytes = ensureBytes(bytes);
    this.#cursor = 0;
  }

  public readBool(): boolean {
    return this.readByte() === 0x01;
  }

  public readBits(length: number): ArrayLike<boolean> {
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

  public readByte(): number {
    return this.#bytes[this.#cursor++];
  }

  public readBytes(length: number): Uint8Array {
    return this.#bytes.subarray(this.#cursor, (this.#cursor += length));
  }

  public readVlq(): number {
    return readVLQ(this);
  }

  public readI8(): number {
    const byte = this.readByte();
    return byte > MAX_I8 ? byte - (MAX_U8 + 1) : byte;
  }

  public readI16(): number {
    return zigZag32.decode(readBigVLQ(this));
  }

  public readI32(): number {
    return zigZag32.decode(readBigVLQ(this));
  }

  public readI64(): bigint {
    return zigZag64.decode(readBigVLQ(this));
  }

  public readI256(): bigint {
    const len = readVLQ(this);
    return hexToBigInt(hex.encode(this.readBytes(len)));
  }
}
