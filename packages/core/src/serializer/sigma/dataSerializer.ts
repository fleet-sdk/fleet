import { hex } from "@fleet-sdk/crypto";
import { isColl, isPrimitiveTypeCode, isTuple } from "./assertions";
import { SigmaReader } from "./sigmaReader";
import {
  bigIntType,
  boolType,
  byteType,
  collType,
  groupElementType,
  intType,
  ISigmaPrimitiveValue,
  ISigmaValue,
  longType,
  shortType,
  sigmaPropType,
  unitType
} from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";

const GROUP_ELEMENT_LENGTH = 33;
const PROVE_DLOG_OP = 0xcd;

export class DataSerializer {
  public static serialize(data: ISigmaValue, writer: SigmaWriter) {
    if (data.type.primitive) {
      switch (data.type.code) {
        case boolType.code:
          writer.writeBoolean((data as ISigmaPrimitiveValue<boolean>).value);
          break;
        case byteType.code:
          writer.write((data as ISigmaPrimitiveValue<number>).value);
          break;
        case shortType.code:
          writer.writeShort((data as ISigmaPrimitiveValue<number>).value);
          break;
        case intType.code:
          writer.writeInt((data as ISigmaPrimitiveValue<number>).value);
          break;
        case longType.code:
          writer.writeLong((data as ISigmaPrimitiveValue<bigint>).value);
          break;
        case bigIntType.code: {
          writer.writeBigInt((data as ISigmaPrimitiveValue<bigint>).value);
          break;
        }
        case groupElementType.code:
          writer.writeBytes((data as ISigmaPrimitiveValue<Uint8Array>).value);
          break;
        case sigmaPropType.code: {
          const node = (data as ISigmaPrimitiveValue<ISigmaValue>).value;
          if (node.type.code === groupElementType.code) {
            writer.write(PROVE_DLOG_OP);
            DataSerializer.serialize(node, writer);
          } else {
            throw Error("Not implemented");
          }
          break;
        }
        case unitType.code: // same as void, don't need to save anything
          break;
        // case PrimitiveTypeCode.Box:
        default:
          throw Error("Not implemented");
      }
    } else if (isColl(data)) {
      if (typeof data.items === "string") {
        writer.writeVLQ(data.items.length / 2);
      } else {
        writer.writeVLQ(data.items.length);
      }

      switch (data.itemsType.code) {
        case boolType.code: {
          writer.writeBits(data.items as boolean[]);
          break;
        }
        case byteType.code: {
          let bytes!: Uint8Array;
          if (typeof data.items === "string") {
            bytes = hex.decode(data.items);
          } else {
            bytes = Uint8Array.from(data.items as number[]);
          }

          writer.writeBytes(bytes);
          break;
        }
        default: {
          for (let i = 0; i < data.items.length; i++) {
            DataSerializer.serialize(
              { type: data.itemsType, value: data.items[i] } as ISigmaValue,
              writer
            );
          }
        }
      }
    } else if (isTuple(data)) {
      const len = data.items.length;
      for (let i = 0; i < len; i++) {
        DataSerializer.serialize(data.items[i], writer);
      }
    } else {
      throw Error("Not implemented");
    }
  }

  static deserialize(typeCode: number, reader: SigmaReader): unknown {
    if (isPrimitiveTypeCode(typeCode)) {
      switch (typeCode) {
        case boolType.code:
          return reader.readBoolean();
        case byteType.code:
          return reader.readByte();
        case shortType.code:
          return reader.readShort();
        case intType.code:
          return reader.readInt();
        case longType.code:
          return reader.readLong();
        case bigIntType.code:
          return reader.readBigInt();
        case groupElementType.code:
          return reader.readBytes(GROUP_ELEMENT_LENGTH);
        case sigmaPropType.code: {
          if (reader.readByte() === PROVE_DLOG_OP) {
            return this.deserialize(groupElementType.code, reader);
          }

          break;
        }
        // case PrimitiveTypeCode.Unit:
        // case PrimitiveTypeCode.Box:
        default:
          break;
      }
    } else if (collType.test(typeCode)) {
      const embeddedType = typeCode - collType.code;
      const length = reader.readVlq();

      switch (embeddedType) {
        case boolType.code: {
          return reader.readBits(length);
        }
        case byteType.code: {
          return reader.readBytes(length);
        }
        default: {
          const elements = new Array(length);

          for (let i = 0; i < length; i++) {
            elements[i] = this.deserialize(embeddedType, reader);
          }

          return elements;
        }
      }
    }

    throw new Error("Parsing error: type not implemented.");
  }
}
