import { BytesInput, hex } from "@fleet-sdk/crypto";
import { SigmaReader, SigmaWriter } from "./coders";
import { DataSerializer } from "./serializers/dataSerializer";
import { TypeSerializer } from "./serializers/typeSerializer";
import { SType } from "./types";

export const MAX_CONSTANT_LENGTH = 4096;

export class SConstant<D = unknown, T extends SType = SType> {
  readonly #type: T;
  readonly #data: D;

  constructor(type: T, data: D) {
    this.#type = type;
    this.#data = type.coerce(data) as D;
  }

  static from<D, T extends SType = SType>(bytes: BytesInput): SConstant<D, T> {
    const reader = new SigmaReader(bytes);
    const type = TypeSerializer.deserialize(reader);
    const data = DataSerializer.deserialize(type, reader);

    return new SConstant(type as T, data as D);
  }

  get type(): T {
    return this.#type;
  }

  get data(): D {
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

export function parse<T>(bytes: BytesInput): T;
export function parse<T>(bytes: BytesInput, mode: "strict"): T;
export function parse<T>(bytes: BytesInput, mode: "safe"): T | undefined;
export function parse<T>(bytes: BytesInput, mode: "strict" | "safe" = "strict") {
  if (mode === "strict") return SConstant.from<T>(bytes).data;
  if (!bytes) return;

  try {
    return SConstant.from<T>(bytes).data;
  } catch {
    return;
  }
}
