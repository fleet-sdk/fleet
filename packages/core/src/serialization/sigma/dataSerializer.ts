import { VLQ } from "../vlq";
import { SigmaBuffer } from "./sigmaBuffer";
import { SigmaTypeCode } from "./sigmaTypeCode";
import { IPrimitiveSigmaType, ISigmaType } from "./sigmaTypes";
import { isColl, isPrimitiveType } from "./utils";

export class DataSerializer {
  public static serialize(data: ISigmaType, buffer: SigmaBuffer) {
    if (isPrimitiveType(data)) {
      switch (data.type) {
        case SigmaTypeCode.Boolean:
          buffer.putBoolean((data as IPrimitiveSigmaType<boolean>).value);
          break;
        case SigmaTypeCode.Byte:
          buffer.put((data as IPrimitiveSigmaType<number>).value);
          break;
        case SigmaTypeCode.Short:
        case SigmaTypeCode.Int:
        case SigmaTypeCode.Long:
          buffer.putInt((data as IPrimitiveSigmaType<number>).value);
          break;
        case SigmaTypeCode.BigInt: {
          buffer.putBigInt((data as IPrimitiveSigmaType<bigint>).value);
          break;
        }
        case SigmaTypeCode.GroupElement:
          buffer.putBytes((data as IPrimitiveSigmaType<Uint8Array>).value);
          break;
        case SigmaTypeCode.SigmaProp: {
          const node = (data as IPrimitiveSigmaType<ISigmaType>).value;
          if (node.type === SigmaTypeCode.GroupElement) {
            buffer.put(0xcd); // CreateProveDlog operation
            DataSerializer.serialize(node, buffer);
          } else {
            throw Error("Not implemented");
          }
          break;
        }
        case SigmaTypeCode.Unit: // same as void, don't need to save anything
          break;
        // case SigmaTypeCode.Box:
        default:
          throw Error("Not implemented");
      }
    } else if (isColl(data)) {
      buffer.putBytes(VLQ.encode(data.value.length));

      switch (data.elementsType) {
        case SigmaTypeCode.Boolean:
          buffer.putBits(data.value as boolean[]);
          break;
        case SigmaTypeCode.Byte:
          buffer.putBytes(Uint8Array.from(data.value as number[]));
          break;
        default:
          for (let i = 0; i < data.value.length; i++) {
            DataSerializer.serialize(
              { value: data.value[i], type: data.elementsType } as ISigmaType,
              buffer
            );
          }
      }
    } else {
      throw Error("Not implemented");
    }
  }
}
