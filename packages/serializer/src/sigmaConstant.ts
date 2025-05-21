import { type ByteInput, hex } from "@fleet-sdk/crypto";
import { SigmaByteReader, SigmaByteWriter, estimateVLQSize } from "./coders";
import { dataSerializer } from "./serializers/dataSerializer";
import { typeSerializer } from "./serializers/typeSerializer";
import type { SCollType, SType } from "./types";
import { descriptors, isColl, isTuple } from "./types/descriptors";

export const MAX_CONSTANT_LENGTH = 4096;

export class SConstant<D = unknown, T extends SType = SType> {
  readonly #type: T;
  readonly #data: D;
  #bytes?: Uint8Array;

  constructor(type: T, data: D) {
    this.#type = type;
    this.#data = type.coerce(data) as D;
  }

  static from<D, T extends SType = SType>(bytes: ByteInput | SigmaByteReader): SConstant<D, T> {
    const reader = bytes instanceof SigmaByteReader ? bytes : new SigmaByteReader(bytes);
    if (reader.isEmpty) throw new Error("Empty constant bytes.");

    const start = reader.cursor;
    const type = typeSerializer.deserialize(reader);
    const data = dataSerializer.deserialize(type, reader);
    return new SConstant(type as T, data as D).#withBytes(reader.bytes.slice(start, reader.cursor));
  }

  #withBytes(bytes: Uint8Array): SConstant<D, T> {
    this.#bytes = bytes;
    return this;
  }

  get type(): T {
    return this.#type;
  }

  get data(): D {
    return this.#data;
  }

  /**
   * Returns the serialized representation of the current instance as a `Uint8Array`.
   * If the bytes have already been computed and cached, returns the cached value.
   * Otherwise, serializes the instance and returns the resulting bytes.
   */
  get bytes(): Uint8Array {
    if (this.#bytes) return this.#bytes;
    return this.serialize();
  }

  /**
   * Serializes the current object into a `Uint8Array`.
   */
  serialize(): Uint8Array {
    const writer = new SigmaByteWriter(guessConstantBytesSize(this.type, this.data));
    typeSerializer.serialize(this.type, writer);
    dataSerializer.serialize(this.data, this.type, writer);

    this.#bytes = writer.toBytes();
    return this.#bytes;
  }

  /**
   * @deprecated use `serialize` instead
   */
  toBytes(): Uint8Array {
    return this.serialize();
  }

  toHex(): string {
    return hex.encode(this.serialize());
  }
}

function guessConstantBytesSize(type: SType, data?: unknown): number {
  const dataSize = 1;

  // left some safe room for integer types
  if (type.code === descriptors.short.code) return dataSize + 8;
  if (type.code === descriptors.int.code) return dataSize + 16;
  if (type.code === descriptors.long.code) return dataSize + 32;
  if (type.code === descriptors.bigInt.code) return dataSize + 64;

  if (type.code === descriptors.bool.code) return dataSize + 1;
  if (type.code === descriptors.byte.code) return dataSize + 1;
  if (type.code === descriptors.unit.code) return dataSize + 0;
  if (type.code === descriptors.groupElement.code) return dataSize + 33;
  if (type.code === descriptors.sigmaProp.code) return dataSize + 35; // only prove DLog is implemented, so it's safe to assume 35 bytes

  // handle collections, but avoid complex types
  if (isColl(type) && !isColl(type.elementsType) && !isTuple(type.elementsType)) {
    const len = (data as Uint8Array).length;
    return (
      dataSize +
      estimateVLQSize(len) +
      guessConstantBytesSize((type as SCollType).elementsType) * len
    );
  }

  return MAX_CONSTANT_LENGTH;
}

/**
 * Decodes a byte input into a Sigma constant of type `SConstant<D, T>`.
 *
 * @template D - The data type of the constant.
 * @template T - The type of the constant.
 * @param value - The value to decode.
 * @returns The decoded constant or `undefined` if the value is `undefined` or decoding fails.
 */
export function decode<D = unknown, T extends SType = SType>(
  value?: ByteInput
): SConstant<D, T> | undefined {
  if (value === undefined) return;

  try {
    return SConstant.from<D, T>(value);
  } catch {
    return;
  }
}

/**
 * Returns the `SType` of the given value.
 *
 * @param value - The value to check the SType of.
 * @returns The SType of the value, or `undefined` if the value is `undefined` or
 * deserialization fails.
 */
export function stypeof(value?: ByteInput): SType | undefined {
  if (!value) return;

  try {
    return typeSerializer.deserialize(new SigmaByteReader(value));
  } catch {
    return;
  }
}

/** @deprecated use `decode` instead */
export function parse<T>(constant: ByteInput): T;
/** @deprecated use `decode` instead */
export function parse<T>(constant: ByteInput, mode: "strict"): T;
/** @deprecated use `decode` instead */
export function parse<T>(constant: ByteInput | undefined, mode: "safe"): T | undefined;
/** @deprecated use `decode` instead */
export function parse<T>(constant: ByteInput | undefined, mode: "strict" | "safe" = "strict") {
  if (mode === "strict") return SConstant.from<T>(constant ?? "").data;
  if (!constant) return;

  try {
    return SConstant.from<T>(constant).data;
  } catch {
    return;
  }
}
