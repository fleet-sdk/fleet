import { HexString } from "@fleet-sdk/common";
import { DataSerializer } from "./dataSerializer";
import { SigmaBuffer } from "./sigmaBuffer";
import { ISigmaType } from "./sigmaTypes";
import { TypeSerializer } from "./typeSerializer";

export const MAX_CONSTANT_TYPES_LENGTH = 100;
export const MAX_CONSTANT_CONTENT_LENGTH = 4096;
export const MAX_CONSTANT_LENGTH = MAX_CONSTANT_TYPES_LENGTH + MAX_CONSTANT_CONTENT_LENGTH;

class SigmaConstant {
  public static serialize(content: ISigmaType): SigmaBuffer {
    const sigmaBuffer = new SigmaBuffer(MAX_CONSTANT_LENGTH);
    TypeSerializer.serialize(content, sigmaBuffer);
    DataSerializer.serialize(content, sigmaBuffer);

    return sigmaBuffer;
  }
}

export function SConstant(content: ISigmaType): HexString {
  return SigmaConstant.serialize(content).toHex();
}
