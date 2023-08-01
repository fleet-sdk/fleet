import { assert, first, last } from "@fleet-sdk/common";
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
              buffer.write(tupleType.pairOneTypeCode + left.type.code);
              this.serialize(right, buffer);
            }
          } else if (right.type.embeddable) {
            // Pair of types where second is primitive (`(Int, _)`)
            buffer.write(tupleType.pairTwoTypeCode + right.type.code);
            this.serialize(left, buffer);
          } else {
            // Pair of non-primitive types (`((Int, Byte), (Boolean,Box))`, etc.)
            buffer.write(tupleType.pairOneTypeCode);
            this.serialize(left, buffer);
            this.serialize(right, buffer);
          }

          return;
        }
        case 3: {
          // Triple of types
          buffer.write(tupleType.tripleTypeCode);
          break;
        }
        case 4: {
          // Quadruple of types
          buffer.write(tupleType.quadrupleTypeCode);
          break;
        }
        default: {
          const len = value.items.length;
          assert(len >= 2 && len <= 255, "Invalid type: tuples must have between 2 and 255 items.");

          buffer.write(tupleType.tupleTypeCode);
          buffer.writeVLQ(len);
        }
      }

      for (let i = 0; i < value.items.length; i++) {
        this.serialize(value.items[i], buffer);
      }
    } else {
      throw new Error("Serialization error: type not implemented.");
    }
  }
}
