import { assert, first, last } from "@fleet-sdk/common";
import { isColl, isTuple } from "./assertions";
import { SigmaReader } from "./sigmaReader";
import {
  ConstructorCode,
  ISigmaValue,
  PRIMITIVE_TYPE_RANGE,
  SBigIntType,
  SBoolType,
  SByteType,
  SCollType,
  SGroupElementType,
  SIntType,
  SLongType,
  SShortType,
  SSigmaPropType,
  STupleType,
  SUnitType,
  TypeDescriptor
} from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";

export class TypeSerializer {
  static serialize(value: ISigmaValue, buffer: SigmaWriter) {
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
              buffer.write(STupleType.symmetricPairTypeCode + left.type.code);
            } else {
              // Pair of types where first is primitive (`(_, Int)`)
              buffer.write(STupleType.pairOneTypeCode + left.type.code);
              this.serialize(right, buffer);
            }
          } else if (right.type.embeddable) {
            // Pair of types where second is primitive (`(Int, _)`)
            buffer.write(STupleType.pairTwoTypeCode + right.type.code);
            this.serialize(left, buffer);
          } else {
            // Pair of non-primitive types (`((Int, Byte), (Boolean,Box))`, etc.)
            buffer.write(STupleType.pairOneTypeCode);
            this.serialize(left, buffer);
            this.serialize(right, buffer);
          }

          return;
        }
        case 3:
          buffer.write(STupleType.tripleTypeCode);
          break;
        case 4:
          buffer.write(STupleType.quadrupleTypeCode);
          break;
        default: {
          const len = value.items.length;
          assert(len >= 2 && len <= 255, "Invalid type: tuples must have between 2 and 255 items.");

          // Generic tuple
          buffer.write(STupleType.tupleTypeCode);
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

  static deserialize(r: SigmaReader): TypeDescriptor {
    const currentByte = r.readByte();
    assert(currentByte > 0, `Parsing Error: Unexpected type code '0x${currentByte.toString(16)}'`);

    if (currentByte < STupleType.tupleTypeCode) {
      const ctorCode = Math.floor(currentByte / PRIMITIVE_TYPE_RANGE);
      const embdCode = Math.floor(currentByte % PRIMITIVE_TYPE_RANGE);

      switch (ctorCode) {
        case ConstructorCode.Embeddable: {
          return getEmbeddableType(embdCode);
        }
        case ConstructorCode.SimpleColl: {
          const wrapped = embdCode === 0 ? this.deserialize(r) : getEmbeddableType(embdCode);

          return { ctor: SCollType, wrapped: [wrapped] };
        }
        case ConstructorCode.NestedColl: {
          const wrapped = embdCode === 0 ? this.deserialize(r) : getEmbeddableType(embdCode);

          return { ctor: SCollType, wrapped: [{ ctor: SCollType, wrapped: [wrapped] }] };
        }
        case ConstructorCode.PairOne: {
          const wrapped =
            embdCode === 0
              ? [this.deserialize(r), this.deserialize(r)] // Pair of non-primitive types (`((Int, Byte), (Boolean,Box))`, etc.)
              : [getEmbeddableType(embdCode), this.deserialize(r)]; // Pair of types where first is primitive (`(_, Int)`)

          return { ctor: STupleType, wrapped };
        }
        case ConstructorCode.PairTwo: {
          const wrapped =
            embdCode === 0
              ? [this.deserialize(r), this.deserialize(r), this.deserialize(r)] // Triple of types
              : [this.deserialize(r), getEmbeddableType(embdCode)];

          return { ctor: SCollType, wrapped };
        }
        case ConstructorCode.SymmetricPair: {
          const wrapped =
            embdCode === 0
              ? [this.deserialize(r), this.deserialize(r), this.deserialize(r), this.deserialize(r)] // Quadruple of types
              : [getEmbeddableType(embdCode), getEmbeddableType(embdCode)]; // Symmetric pair of primitive types (`(Int, Int)`, `(Byte,Byte)`, etc.)

          return { ctor: SCollType, wrapped };
        }
      }
    } else {
      switch (currentByte) {
        case ConstructorCode.GenericTuple: {
          const len = r.readVlq();
          const wrapped = new Array<TypeDescriptor>(len);
          for (let i = 0; i < len; i++) {
            wrapped[i] = this.deserialize(r);
          }

          return { ctor: STupleType, wrapped };
        }
        case SUnitType.code: {
          return SUnitType;
        }
      }
    }

    throw new Error("Not implemented.");
  }
}

function getEmbeddableType(typeCode: number) {
  switch (typeCode) {
    case SBoolType.code:
      return SBoolType;
    case SByteType.code:
      return SByteType;
    case SShortType.code:
      return SShortType;
    case SIntType.code:
      return SIntType;
    case SLongType.code:
      return SLongType;
    case SBigIntType.code:
      return SBigIntType;
    case SGroupElementType.code:
      return SGroupElementType;
    case SSigmaPropType.code:
    default:
      return SSigmaPropType;
  }
}
