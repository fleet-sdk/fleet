import { hex } from "@fleet-sdk/crypto";
import { type SigmaByteReader, SigmaByteWriter } from "../coders";

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

export function serializeAvlTree(
  data: AvlTreeData,
  writer: SigmaByteWriter = new SigmaByteWriter(4_096)
): SigmaByteWriter {
  return writer // (DIGEST_SIZE + 1 + 4 + 1 + 4 /** flags, key len, opt flag, opt value */)
    .writeBytes(hex.decode(data.digest))
    .write(serializeFlags(data))
    .writeUInt(data.keyLength)
    .writeOption(data.valueLengthOpt, (w) => w.writeUInt(data.valueLengthOpt as number));
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

function serializeFlags(flags: AvlTreeFlags): number {
  let byte = 0x0;
  if (flags.insertAllowed) byte |= AvlTreeFlag.InsertAllowed;
  if (flags.updateAllowed) byte |= AvlTreeFlag.UpdateAllowed;
  if (flags.removeAllowed) byte |= AvlTreeFlag.RemoveAllowed;
  return byte;
}
