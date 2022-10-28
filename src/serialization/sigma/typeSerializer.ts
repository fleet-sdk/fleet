import { SigmaBuffer } from "./sigmaBuffer";
import { ISigmaType } from "./sigmaTypes";
import { isColl, isEmbeddable, isPrimitiveType } from "./utils";

export class TypeSerializer {
  public static serialize(value: ISigmaType, buffer: SigmaBuffer) {
    if (isPrimitiveType(value)) {
      buffer.put(value.type);
    } else if (isColl(value)) {
      if (isEmbeddable(value.elementsType)) {
        buffer.put(value.type + value.elementsType);
      }
    }
  }
}
