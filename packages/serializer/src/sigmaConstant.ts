import { assert, isUndefined } from "@fleet-sdk/common";
import { ByteInput, hex } from "@fleet-sdk/crypto";
import { SigmaByteReader, SigmaByteWriter } from "./coders";
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

  static from<D, T extends SType = SType>(bytes: ByteInput): SConstant<D, T> {
    assert(bytes.length > 0, "Empty constant bytes.");

    const reader = new SigmaByteReader(bytes);
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
    const writer = new SigmaByteWriter(MAX_CONSTANT_LENGTH);
    TypeSerializer.serialize(this.type, writer);
    DataSerializer.serialize(this.data, this.type, writer);

    return writer.toBytes();
  }

  toHex(): string {
    return hex.encode(this.toBytes());
  }
}

export function decode<T>(value: ByteInput | undefined): T | undefined;
export function decode<T, K>(
  value: ByteInput | undefined,
  coder: (input: T) => K
): K | undefined;
export function decode<T, K>(
  value: ByteInput | undefined,
  coder?: (input: T) => K
): T | K | undefined {
  if (isUndefined(value)) return;
  const data = parse<T>(value, "safe");
  if (isUndefined(data)) return;

  return coder ? coder(data) : data;
}

/** @deprecated use `decode` instead */
export function parse<T>(constant: ByteInput): T;
/** @deprecated use `decode` instead */
export function parse<T>(constant: ByteInput, mode: "strict"): T;
/** @deprecated use `decode` instead */
export function parse<T>(
  constant: ByteInput | undefined,
  mode: "safe"
): T | undefined;
/** @deprecated use `decode` instead */
export function parse<T>(
  constant: ByteInput | undefined,
  mode: "strict" | "safe" = "strict"
) {
  if (mode === "strict") return SConstant.from<T>(constant ?? "").data;
  if (!constant) return;

  try {
    return SConstant.from<T>(constant).data;
  } catch {
    return;
  }
}
