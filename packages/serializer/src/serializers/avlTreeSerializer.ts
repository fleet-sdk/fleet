import { hex } from "@fleet-sdk/crypto";
import type { SigmaByteReader } from "../coders";

export interface AvlTreeFlags {
  insertAllowed: boolean;
  updateAllowed: boolean;
  removeAllowed: boolean;
}

export interface AvlTreeData extends AvlTreeFlags {
  digest: string;
  keyLength: number;
  valueLengthOpt?: number;
}

const DIGEST_SIZE = 33;

const enum AvlTreeFlag {
  InsertAllowed = 0x01,
  UpdateAllowed = 0x02,
  RemoveAllowed = 0x04
}

export function deserializeAvlTree(reader: SigmaByteReader): AvlTreeData {
  const digest = hex.encode(reader.readBytes(DIGEST_SIZE));
  const { insertAllowed, updateAllowed, removeAllowed } = parseFlags(reader.readByte());
  const keyLength = reader.readUInt();
  const valueLengthOpt = reader.readOption((r) => r.readUInt());

  return {
    digest,
    insertAllowed,
    updateAllowed,
    removeAllowed,
    keyLength,
    valueLengthOpt
  };
}

function parseFlags(byte: number): AvlTreeFlags {
  return {
    insertAllowed: (byte & AvlTreeFlag.InsertAllowed) !== 0,
    updateAllowed: (byte & AvlTreeFlag.UpdateAllowed) !== 0,
    removeAllowed: (byte & AvlTreeFlag.RemoveAllowed) !== 0
  };
}
