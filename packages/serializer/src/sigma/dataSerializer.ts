import { assert } from "@fleet-sdk/common";
import { isColl, isPrimitiveType, isTuple } from "./assertions";
import { SigmaReader } from "./sigmaReader";
import { SCollType, sDescriptors, SigmaConstant, STupleType, SType } from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";

const GROUP_ELEMENT_LENGTH = 33;
const PROVE_DLOG_OP = 0xcd;

export class DataSerializer {
  public static serialize(data: unknown, type: SType, writer: SigmaWriter) {
    if (type.embeddable) {
      switch (type.code) {
        case sDescriptors.bool.code:
          writer.writeBoolean(data as boolean);
          break;
        case sDescriptors.byte.code:
          writer.write(data as number);
          break;
        case sDescriptors.short.code:
          writer.writeShort(data as number);
          break;
        case sDescriptors.int.code:
          writer.writeInt(data as number);
          break;
        case sDescriptors.long.code:
          writer.writeLong(data as bigint);
          break;
        case sDescriptors.bigInt.code: {
          writer.writeBigInt(data as bigint);
          break;
        }
        case sDescriptors.groupElement.code:
          writer.writeBytes(data as Uint8Array);
          break;
        case sDescriptors.sigmaProp.code: {
          const node = data as SigmaConstant<SigmaConstant<Uint8Array>>;

          if (node.type === sDescriptors.groupElement) {
            writer.write(PROVE_DLOG_OP);
            DataSerializer.serialize(node.value, node.type, writer);
          } else {
            throw Error("Not implemented");
          }
          break;
        }
        default:
          throw Error("Not implemented");
      }
    } else if (isColl(type)) {
      if (type.elementsType.code === sDescriptors.byte.code) {
        const assertion = data instanceof Uint8Array;
        assert(assertion, `SColl[Byte] expected an UInt8Array, got ${typeof data}.`);
      } else {
        assert(Array.isArray(data), `SColl expected an array, got ${typeof data}.`);
      }

      writer.writeVLQ(data.length);

      switch (type.elementsType.code) {
        case sDescriptors.bool.code: {
          writer.writeBits(data as boolean[]);
          break;
        }
        case sDescriptors.byte.code: {
          writer.writeBytes(data as Uint8Array);
          break;
        }
        default: {
          for (let i = 0; i < data.length; i++) {
            DataSerializer.serialize(data[i], type.elementsType, writer);
          }
        }
      }
    } else if (isTuple(type)) {
      assert(
        Array.isArray(data),
        `STupleType serialization expected an array, got ${typeof data}.`
      );

      const len = type.elementsType.length;
      for (let i = 0; i < len; i++) {
        // new SigmaConstant(data.type.internalType[i], data.value[i]),
        DataSerializer.serialize(data[i], type.elementsType[i], writer);
      }
    } else if (type.code !== sDescriptors.unit.code) {
      throw Error("Not implemented");
    }
  }

  static deserialize(type: SType, reader: SigmaReader): unknown {
    if (isPrimitiveType(type)) {
      switch (type.code) {
        case sDescriptors.bool.code:
          return reader.readBoolean();
        case sDescriptors.byte.code:
          return reader.readByte();
        case sDescriptors.short.code:
          return reader.readShort();
        case sDescriptors.int.code:
          return reader.readInt();
        case sDescriptors.long.code:
          return reader.readLong();
        case sDescriptors.bigInt.code:
          return reader.readBigInt();
        case sDescriptors.groupElement.code:
          return reader.readBytes(GROUP_ELEMENT_LENGTH);
        case sDescriptors.sigmaProp.code: {
          if (reader.readByte() === PROVE_DLOG_OP) {
            return this.deserialize(sDescriptors.groupElement, reader);
          }

          break;
        }
        default:
          break;
      }
    } else {
      switch (type.code) {
        case sDescriptors.coll.code: {
          const length = reader.readVlq();
          const embeddedType = (type as SCollType).elementsType;

          switch (embeddedType.code) {
            case sDescriptors.bool.code:
              return reader.readBits(length);
            case sDescriptors.byte.code:
              return reader.readBytes(length);
            default: {
              const elements = new Array(length);
              for (let i = 0; i < length; i++) {
                elements[i] = this.deserialize(embeddedType, reader);
              }

              return elements;
            }
          }
        }
        case sDescriptors.tuple.code: {
          return (type as STupleType).elementsType.map((t) => this.deserialize(t, reader));
        }
      }
    }

    throw new Error("Parsing error: type not implemented.");
  }
}
