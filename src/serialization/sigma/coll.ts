import { ByteColl } from "./byteColl";

export function SColl(bytes: Buffer): Buffer {
  if (!Buffer.isBuffer(bytes)) {
    throw Error("Not implemented");
  }

  return new ByteColl(bytes).toBytes();
}
