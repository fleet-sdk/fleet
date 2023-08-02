import { hex } from "@fleet-sdk/crypto";
import { isColl, isPrimitiveTypeCode, isTuple } from "./assertions";
import { SigmaReader } from "./sigmaReader";
import {
  ISigmaValue,
  ISPrimitive,
  SBigIntType,
  SBoolType,
  SByteType,
  SCollType,
  SGroupElementType,
  SIntType,
  SLongType,
  SShortType,
  SSigmaPropType,
  SUnitType
} from "./sigmaTypes";
import { SigmaWriter } from "./sigmaWriter";

const GROUP_ELEMENT_LENGTH = 33;
const PROVE_DLOG_OP = 0xcd;

export class DataSerializer {
  public static serialize(data: ISigmaValue, writer: SigmaWriter) {
    if (data.type.primitive) {
      switch (data.type) {
        case SBoolType:
          writer.writeBoolean((data as ISPrimitive<boolean>).value);
          break;
        case SByteType:
          writer.write((data as ISPrimitive<number>).value);
          break;
        case SShortType:
          writer.writeShort((data as ISPrimitive<number>).value);
          break;
        case SIntType:
          writer.writeInt((data as ISPrimitive<number>).value);
          break;
        case SLongType:
          writer.writeLong((data as ISPrimitive<bigint>).value);
          break;
        case SBigIntType: {
          writer.writeBigInt((data as ISPrimitive<bigint>).value);
          break;
        }
        case SGroupElementType:
          writer.writeBytes((data as ISPrimitive<Uint8Array>).value);
          break;
        case SSigmaPropType: {
          const node = (data as ISPrimitive<ISPrimitive<Uint8Array>>).value;

          if (node.type === SGroupElementType) {
            writer.write(PROVE_DLOG_OP);
            DataSerializer.serialize(node, writer);
          } else {
            throw Error("Not implemented");
          }
          break;
        }
        case SUnitType: // same as void, don't need to save anything
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

      switch (data.itemsType) {
        case SBoolType: {
          writer.writeBits(data.items as boolean[]);
          break;
        }
        case SByteType: {
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
        case SBoolType.code:
          return reader.readBoolean();
        case SByteType.code:
          return reader.readByte();
        case SShortType.code:
          return reader.readShort();
        case SIntType.code:
          return reader.readInt();
        case SLongType.code:
          return reader.readLong();
        case SBigIntType.code:
          return reader.readBigInt();
        case SGroupElementType.code:
          return reader.readBytes(GROUP_ELEMENT_LENGTH);
        case SSigmaPropType.code: {
          if (reader.readByte() === PROVE_DLOG_OP) {
            return this.deserialize(SGroupElementType.code, reader);
          }

          break;
        }
        // case PrimitiveTypeCode.Unit:
        // case PrimitiveTypeCode.Box:
        default:
          break;
      }
    } else if (SCollType.isConstructorOf(typeCode)) {
      const embeddedType = typeCode - SCollType.simpleCollTypeCode;
      const length = reader.readVlq();

      switch (embeddedType) {
        case SBoolType.code: {
          return reader.readBits(length);
        }
        case SByteType.code: {
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
