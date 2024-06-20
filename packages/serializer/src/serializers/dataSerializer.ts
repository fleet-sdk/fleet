import { assert } from "@fleet-sdk/common";
import { SigmaByteReader, SigmaByteWriter } from "../coders";
import { SConstant } from "../sigmaConstant";
import { isColl, isTuple, SCollType, STupleType, SType } from "../types";
import { descriptors } from "../types/descriptors";

const GROUP_ELEMENT_LENGTH = 33;
const PROVE_DLOG_OP = 0xcd;

export class DataSerializer {
  public static serialize(data: unknown, type: SType, writer: SigmaByteWriter): SigmaByteWriter {
    if (type.embeddable) {
      switch (type.code) {
        case descriptors.bool.code:
          return writer.writeBoolean(data as boolean);
        case descriptors.byte.code:
          return writer.write(data as number);
        case descriptors.short.code:
          return writer.writeShort(data as number);
        case descriptors.int.code:
          return writer.writeInt(data as number);
        case descriptors.long.code:
          return writer.writeLong(data as bigint);
        case descriptors.bigInt.code: {
          return writer.writeBigInt(data as bigint);
        }
        case descriptors.groupElement.code:
          return writer.writeBytes(data as Uint8Array);
        case descriptors.sigmaProp.code: {
          const node = data as SConstant<SConstant<Uint8Array>>;

          if (node.type === descriptors.groupElement) {
            writer.write(PROVE_DLOG_OP);

            return DataSerializer.serialize(node.data, node.type, writer);
          } else {
            throw Error("Serialization error: SigmaProp operation not implemented.");
          }
        }
      }
    } else if (isColl(type)) {
      if (type.elementsType.code === descriptors.byte.code) {
        const isUint8Array = data instanceof Uint8Array;
        assert(isUint8Array, `SColl[Byte] expected an UInt8Array, got ${typeof data}.`);
      } else {
        assert(Array.isArray(data), `SColl expected an array, got ${typeof data}.`);
      }

      writer.writeVLQ(data.length);
      switch (type.elementsType.code) {
        case descriptors.bool.code: {
          return writer.writeBits(data as boolean[]);
        }
        case descriptors.byte.code: {
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
    } else if (type.code === descriptors.unit.code) {
      return writer;
    }

    throw Error(`Serialization error: '0x${type.code.toString(16)}' type not implemented.`);
  }

  static deserialize(type: SType, reader: SigmaByteReader): unknown {
    if (type.embeddable) {
      switch (type.code) {
        case descriptors.bool.code:
          return reader.readBoolean();
        case descriptors.byte.code:
          return reader.readByte();
        case descriptors.short.code:
          return reader.readShort();
        case descriptors.int.code:
          return reader.readInt();
        case descriptors.long.code:
          return reader.readLong();
        case descriptors.bigInt.code:
          return reader.readBigInt();
        case descriptors.groupElement.code:
          return reader.readBytes(GROUP_ELEMENT_LENGTH);
        case descriptors.sigmaProp.code: {
          if (reader.readByte() === PROVE_DLOG_OP) {
            return this.deserialize(descriptors.groupElement, reader);
          }

          break;
        }
      }
    } else {
      switch (type.code) {
        case descriptors.coll.code: {
          const length = reader.readVlq();
          const embeddedType = (type as SCollType).elementsType;

          switch (embeddedType.code) {
            case descriptors.bool.code:
              return reader.readBits(length);
            case descriptors.byte.code:
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
        case descriptors.tuple.code: {
          return (type as STupleType).elementsType.map((t) => this.deserialize(t, reader));
        }
        case descriptors.unit.code: {
          return undefined;
        }
      }
    }

    throw new Error(`Parsing error: '0x${type.code.toString(16)}' type not implemented.`);
  }
}
