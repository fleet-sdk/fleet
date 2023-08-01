import { HexString } from "@fleet-sdk/common";
import { DataSerializer } from "./dataSerializer";
import { SigmaReader } from "./sigmaReader";
import { ISigmaValue } from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";
import { TypeSerializer } from "./typeSerializer";

export const MAX_CONSTANT_TYPES_LENGTH = 100;
export const MAX_CONSTANT_CONTENT_LENGTH = 4096;
export const MAX_CONSTANT_LENGTH = MAX_CONSTANT_TYPES_LENGTH + MAX_CONSTANT_CONTENT_LENGTH;

export function SConstant(value: ISigmaValue): HexString {
  const writer = new SigmaWriter(MAX_CONSTANT_LENGTH);

  TypeSerializer.serialize(value, writer);
  DataSerializer.serialize(value, writer);

  return writer.toHex();
}

export function SParse<T>(content: HexString | Uint8Array): T {
  const reader = new SigmaReader(content);
  const type = reader.readByte();

  return DataSerializer.deserialize(type, reader) as T;
}
