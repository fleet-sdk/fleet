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
        // case SigmaTypeCode.BigInt:
        // case SigmaTypeCode.GroupElement:
        // case SigmaTypeCode.SigmaProp:
        // case SigmaTypeCode.Any:
        case SigmaTypeCode.Unit:
          break;
        // case SigmaTypeCode.Box:
        // case SigmaTypeCode.AvlTree:
        // case SigmaTypeCode.Context:
        // case SigmaTypeCode.Header:
        // case SigmaTypeCode.PreHeader:
        // case SigmaTypeCode.Global:
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
    }
  }
}
