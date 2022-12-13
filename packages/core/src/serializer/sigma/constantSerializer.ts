import { HexString } from "@fleet-sdk/common";
import { DataSerializer } from "./dataSerializer";
import { SigmaByteReader } from "./sigmaByteReader";
import { SigmaByteWriter } from "./sigmaByteWriter";
import { ISigmaType } from "./sigmaTypes";
import { TypeSerializer } from "./typeSerializer";

export const MAX_CONSTANT_TYPES_LENGTH = 100;
export const MAX_CONSTANT_CONTENT_LENGTH = 4096;
export const MAX_CONSTANT_LENGTH = MAX_CONSTANT_TYPES_LENGTH + MAX_CONSTANT_CONTENT_LENGTH;

export function SConstant(content: ISigmaType): HexString {
  const writer = new SigmaByteWriter(MAX_CONSTANT_LENGTH);

  TypeSerializer.serialize(content, writer);
  DataSerializer.serialize(content, writer);

  return writer.toHex();
}

export function SParse<T>(content: HexString | Uint8Array): T {
  const reader = new SigmaByteReader(content);
  const type = reader.readType();

  return DataSerializer.deserialize(type, reader) as T;
}
