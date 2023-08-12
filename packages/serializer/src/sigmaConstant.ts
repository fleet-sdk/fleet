import { hex } from "@fleet-sdk/crypto";
import { SigmaReader, SigmaWriter } from "./coders";
import { DataSerializer } from "./serializers/dataSerializer";
import { TypeSerializer } from "./serializers/typeSerializer";
import { SType } from "./types";

export const MAX_CONSTANT_LENGTH = 4096;

export class SigmaConstant<V = unknown, T extends SType = SType> {
  readonly #type: T;
  readonly #data: V;

  constructor(type: T, data: V) {
    this.#type = type;
    this.#data = type.coerce(data) as V;
  }

  static from<D, T extends SType = SType>(bytes: Uint8Array | string): SigmaConstant<D, T> {
    const reader = new SigmaReader(bytes);
    const type = TypeSerializer.deserialize(reader);
    const data = DataSerializer.deserialize(type, reader);

    return new SigmaConstant(type as T, data as D);
  }

  get type(): T {
    return this.#type;
  }

  get data(): V {
    return this.#data;
  }

  toBytes(): Uint8Array {
    const writer = new SigmaWriter(MAX_CONSTANT_LENGTH);
    TypeSerializer.serialize(this.type, writer);
    DataSerializer.serialize(this.data, this.type, writer);

    return writer.toBytes();
  }

  toHex(): string {
    return hex.encode(this.toBytes());
  }
}
