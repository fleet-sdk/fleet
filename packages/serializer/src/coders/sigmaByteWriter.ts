import { blake2b256, type Coder, hex } from "@fleet-sdk/crypto";
import { bigIntToHex } from "./bigint";
import { writeBigVLQ, writeVLQ } from "./vlq";
import { zigZag32, zigZag64 } from "./zigZag";
import {
  MIN_I16,
  MAX_I16,
  MIN_I32,
  MAX_I32,
  MIN_I64,
  MAX_I64,
  MIN_I256,
  MAX_I256
} from "./numRanges";

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

  public writeBool(value: boolean): SigmaByteWriter {
    this.write(value === true ? 0x01 : 0x00);

    return this;
  }

  public writeVLQ(value: number): SigmaByteWriter {
    return writeVLQ(this, value);
  }

  public writeBigVLQ(value: bigint): SigmaByteWriter {
    return writeBigVLQ(this, value);
  }

  public writeI16(value: number): SigmaByteWriter {
    if (value < MIN_I16 || value > MAX_I16) {
      throw new RangeError(`Value ${value} is out of range for a 16-bit integer`);
    }

    this.writeBigVLQ(zigZag32.encode(value));
    return this;
  }

  public writeI32(value: number): SigmaByteWriter {
    if (value < MIN_I32 || value > MAX_I32) {
      throw new RangeError(`Value ${value} is out of range for a 32-bit integer`);
    }

    return this.writeBigVLQ(zigZag32.encode(value));
  }

  public writeI64(value: bigint): SigmaByteWriter {
    if (value < MIN_I64 || value > MAX_I64) {
      throw new RangeError(`Value ${value} is out of range for a 64-bit integer`);
    }

    return this.writeBigVLQ(zigZag64.encode(value));
  }

  public writeI256(value: bigint): SigmaByteWriter {
    if (value < MIN_I256 || value > MAX_I256) {
      throw new RangeError(`Value ${value} is out of range for a 256-bit integer`);
    }

    const hex = bigIntToHex(value);
    return this.writeVLQ(hex.length / 2).writeHex(hex);
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
