import { assert, first, last } from "@fleet-sdk/common";
import type { SigmaByteReader, SigmaByteWriter } from "../coders";
import { SCollType, STupleType, type SType, isColl, isTuple } from "../types";
import {
  PRIMITIVE_TYPE_RANGE,
  constructorCode,
  descriptors,
  getPrimitiveType
} from "../types/descriptors";

export const typeSerializer = {
  serialize(type: SType, writer: SigmaByteWriter) {
    if (type.embeddable) {
      writer.write(type.code);
    } else if (type.code === descriptors.unit.code) {
      writer.write(type.code);
    } else if (type.code === descriptors.box.code) {
      writer.write(type.code);
    } else if (type.code === descriptors.avlTree.code) {
      writer.write(type.code);
    } else if (isColl(type)) {
      if (type.elementsType.embeddable) {
        writer.write(descriptors.coll.simpleCollTypeCode + type.elementsType.code);
      } else if (isColl(type.elementsType)) {
        const nestedColl = type.elementsType;
        if (nestedColl.elementsType.embeddable) {
          writer.write(descriptors.coll.nestedCollTypeCode + nestedColl.elementsType.code);
        } else {
          writer.write(descriptors.coll.simpleCollTypeCode);
          this.serialize(nestedColl, writer);
        }
      } else {
        writer.write(descriptors.coll.simpleCollTypeCode);
        this.serialize(type.elementsType, writer);
      }
    } else if (isTuple(type)) {
      switch (type.elementsType.length) {
        case 2: {
          const left = first(type.elementsType);
          const right = last(type.elementsType);

          if (left.embeddable) {
            if (left.code === right.code) {
              // Symmetric pair of primitive types (`(Int, Int)`, `(Byte,Byte)`, etc.)
              writer.write(descriptors.tuple.symmetricPairTypeCode + left.code);
            } else {
              // Pair of types where first is primitive (`(_, Int)`)
              writer.write(descriptors.tuple.pairOneTypeCode + left.code);
              this.serialize(right, writer);
            }
          } else if (right.embeddable) {
            // Pair of types where second is primitive (`(Int, _)`)
            writer.write(descriptors.tuple.pairTwoTypeCode + right.code);
            this.serialize(left, writer);
          } else {
            // Pair of non-primitive types (`((Int, Byte), (Boolean,Box))`, etc.)
            writer.write(descriptors.tuple.pairOneTypeCode);
            this.serialize(left, writer);
            this.serialize(right, writer);
          }

          return;
        }
        case 3:
          writer.write(descriptors.tuple.tripleTypeCode);
          break;
        case 4:
          writer.write(descriptors.tuple.quadrupleTypeCode);
          break;
        default: {
          const len = type.elementsType.length;
          assert(len >= 2 && len <= 255, "Invalid type: tuples must have between 2 and 255 items.");

          // Generic tuple
          writer.write(descriptors.tuple.genericTupleTypeCode);
          writer.writeUInt(len);
        }
      }

      for (let i = 0; i < type.elementsType.length; i++) {
        this.serialize(type.elementsType[i], writer);
      }
    } else {
      throw new Error("Serialization error: type not implemented.");
    }
  },

  deserialize(r: SigmaByteReader): SType {
    const byte = r.readByte();
    assert(byte > 0, `Parsing Error: Unexpected type code '0x${byte.toString(16)}'`);

    if (byte < descriptors.tuple.genericTupleTypeCode) {
      const ctorCode = Math.floor(byte / PRIMITIVE_TYPE_RANGE);
      const embdCode = Math.floor(byte % PRIMITIVE_TYPE_RANGE);

      switch (ctorCode) {
        case constructorCode.embeddable: {
          return getPrimitiveType(embdCode);
        }
        case constructorCode.simpleColl: {
          const internal = embdCode === 0 ? this.deserialize(r) : getPrimitiveType(embdCode);

          return new SCollType(internal);
        }
        case constructorCode.nestedColl: {
          return new SCollType(new SCollType(getPrimitiveType(embdCode)));
        }
        case constructorCode.pairOne: {
          const internal =
            embdCode === 0
              ? [this.deserialize(r), this.deserialize(r)] // Pair of non-primitive types (`((Int, Byte), (Boolean,Box))`, etc.)
              : [getPrimitiveType(embdCode), this.deserialize(r)]; // Pair of types where first is primitive (`(_, Int)`)

          return new STupleType(internal);
        }
        case constructorCode.pairTwo: {
          const internal =
            embdCode === 0
              ? [this.deserialize(r), this.deserialize(r), this.deserialize(r)] // Triple of types
              : [this.deserialize(r), getPrimitiveType(embdCode)];

          return new STupleType(internal);
        }
        case constructorCode.symmetricPair: {
          const internal =
            embdCode === 0
              ? [this.deserialize(r), this.deserialize(r), this.deserialize(r), this.deserialize(r)] // Quadruple of types
              : [getPrimitiveType(embdCode), getPrimitiveType(embdCode)]; // Symmetric pair of primitive types (`(Int, Int)`, `(Byte,Byte)`, etc.)

          return new STupleType(internal);
        }
      }
    }

    switch (byte) {
      case descriptors.tuple.genericTupleTypeCode: {
        const len = r.readUInt();
        const wrapped = new Array<SType>(len);
        for (let i = 0; i < len; i++) {
          wrapped[i] = this.deserialize(r);
        }

        return new STupleType(wrapped);
      }
      case descriptors.unit.code:
        return descriptors.unit;
      case descriptors.box.code:
        return descriptors.box;
      case descriptors.avlTree.code:
        return descriptors.avlTree;
    }

    throw new Error("Not implemented.");
  }
};
