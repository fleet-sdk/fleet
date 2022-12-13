import { ISigmaType } from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";
import { isColl, isEmbeddable, isPrimitiveType } from "./utils";

export class TypeSerializer {
  public static serialize(value: ISigmaType, buffer: SigmaWriter) {
    if (isPrimitiveType(value)) {
      buffer.write(value.type);
    } else if (isColl(value)) {
      if (isEmbeddable(value.elementsType)) {
        buffer.write(value.type + value.elementsType);
      }
    }
  }
}
