import { isEmpty } from "@fleet-sdk/common";
import { type ByteInput, ensureBytes, hex } from "@fleet-sdk/crypto";
import { hexToBigInt } from "./bigint";
import { readBigVLQ, readVLQ } from "./vlq";
import { zigZagDecode, zigZagDecodeBigInt, zigZag32 } from "./zigZag";

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

  public readBoolean(): boolean {
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

  public readShort(): number {
    return Number(zigZagDecode(readVLQ(this)));
  }

  public readInt(): number {
    return zigZag32.decode(readBigVLQ(this));
  }

  public readLong(): bigint {
    return zigZagDecodeBigInt(readBigVLQ(this));
  }

  public readBigInt(): bigint {
    const len = readVLQ(this);
    return hexToBigInt(hex.encode(this.readBytes(len)));
  }
}
