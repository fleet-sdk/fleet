import { first, last } from "@fleet-sdk/common";
import { isColl, isTuple } from "./assertions";
import { ISigmaValue, tupleType } from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";

export class TypeSerializer {
  public static serialize(value: ISigmaValue, buffer: SigmaWriter) {
    if (value.type.primitive) {
      buffer.write(value.type.code);
    } else if (isColl(value)) {
      if (value.itemsType.embeddable) {
        buffer.write(value.type.code + value.itemsType.code);
      }
    } else if (isTuple(value)) {
      switch (value.items.length) {
        case 2: {
          const left = first(value.items);
          const right = last(value.items);

          if (left.type.embeddable) {
            if (left.type.code === right.type.code) {
              // Symmetric pair of primitive types (`(Int, Int)`, `(Byte,Byte)`, etc.)
              buffer.write(tupleType.symmetricPairTypeCode + left.type.code);
            } else {
              // Pair of types where first is primitive (`(_, Int)`)
              buffer.write(tupleType.pair1TypeCode + left.type.code);
              this.serialize(right, buffer);
            }
          } else if (right.type.embeddable) {
            // Pair of types where second is primitive (`(Int, _)`)
            buffer.write(tupleType.pair2TypeCode + right.type.code);
            this.serialize(left, buffer);
          } else {
            // Pair of non-primitive types (`((Int, Byte), (Boolean,Box))`, etc.)
            buffer.write(tupleType.pair1TypeCode);
            this.serialize(left, buffer);
            this.serialize(right, buffer);
          }
          break;
        }
        default:
          throw new Error("Not implemented");
      }
    }
  }
}
