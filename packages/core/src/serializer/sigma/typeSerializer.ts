import { SigmaByteWriter } from "./sigmaByteWriter";
import { ISigmaType } from "./sigmaTypes";
import { isColl, isEmbeddableTypeCode, isPrimitiveType } from "./utils";

export class TypeSerializer {
  public static serialize(value: ISigmaType, buffer: SigmaByteWriter) {
    if (isPrimitiveType(value)) {
      buffer.write(value.type);
    } else if (isColl(value)) {
      if (isEmbeddableTypeCode(value.elementsType)) {
        buffer.write(value.type + value.elementsType);
      }
    }
  }
}
