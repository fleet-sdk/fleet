import { assert } from "@fleet-sdk/common";
import { SigmaReader } from "./sigmaReader";
import {
  isColl,
  isTuple,
  SCollType,
  sDescriptors,
  SigmaConstant,
  STupleType,
  SType
} from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";

const GROUP_ELEMENT_LENGTH = 33;
const PROVE_DLOG_OP = 0xcd;

export class DataSerializer {
  public static serialize(data: unknown, type: SType, writer: SigmaWriter): SigmaWriter {
    if (type.embeddable) {
      switch (type.code) {
        case sDescriptors.bool.code:
          return writer.writeBoolean(data as boolean);
        case sDescriptors.byte.code:
          return writer.write(data as number);
        case sDescriptors.short.code:
          return writer.writeShort(data as number);
        case sDescriptors.int.code:
          return writer.writeInt(data as number);
        case sDescriptors.long.code:
          return writer.writeLong(data as bigint);
        case sDescriptors.bigInt.code: {
          return writer.writeBigInt(data as bigint);
        }
        case sDescriptors.groupElement.code:
          return writer.writeBytes(data as Uint8Array);
        case sDescriptors.sigmaProp.code: {
          const node = data as SigmaConstant<SigmaConstant<Uint8Array>>;

          if (node.type === sDescriptors.groupElement) {
            writer.write(PROVE_DLOG_OP);

            return DataSerializer.serialize(node.value, node.type, writer);
          } else {
            throw Error("Serialization error: SigmaProp operation not implemented.");
          }
        }
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
          return writer.writeBits(data as boolean[]);
        }
        case sDescriptors.byte.code: {
          return writer.writeBytes(data as Uint8Array);
        }
        default: {
          for (let i = 0; i < data.length; i++) {
            DataSerializer.serialize(data[i], type.elementsType, writer);
          }

          return writer;
        }
      }
    } else if (isTuple(type)) {
      assert(
        Array.isArray(data),
        `STupleType serialization expected an array, got ${typeof data}.`
      );

      const len = type.elementsType.length;
      for (let i = 0; i < len; i++) {
        DataSerializer.serialize(data[i], type.elementsType[i], writer);
      }

      return writer;
    } else if (type.code === sDescriptors.unit.code) {
      return writer;
    }

    throw Error(`Serialization error: '0x${type.code}' type not implemented.`);
  }

  static deserialize(type: SType, reader: SigmaReader): unknown {
    if (type.embeddable) {
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
        case sDescriptors.unit.code: {
          return undefined;
        }
      }
    }

    throw new Error(`Parsing error: '0x${type.code}' type not implemented.`);
  }
}
