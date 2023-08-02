import { first } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import { isColl, isPrimitiveType, isTuple } from "./assertions";
import { SigmaReader } from "./sigmaReader";
import {
  IPrimitive,
  ISigmaValue,
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

const GROUP_ELEMENT_LENGTH = 33;
const PROVE_DLOG_OP = 0xcd;

export class DataSerializer {
  public static serialize(data: ISigmaValue, writer: SigmaWriter) {
    if (data.type.primitive) {
      switch (data.type) {
        case SBoolType:
          writer.writeBoolean((data as IPrimitive<boolean>).value);
          break;
        case SByteType:
          writer.write((data as IPrimitive<number>).value);
          break;
        case SShortType:
          writer.writeShort((data as IPrimitive<number>).value);
          break;
        case SIntType:
          writer.writeInt((data as IPrimitive<number>).value);
          break;
        case SLongType:
          writer.writeLong((data as IPrimitive<bigint>).value);
          break;
        case SBigIntType: {
          writer.writeBigInt((data as IPrimitive<bigint>).value);
          break;
        }
        case SGroupElementType:
          writer.writeBytes((data as IPrimitive<Uint8Array>).value);
          break;
        case SSigmaPropType: {
          const node = (data as IPrimitive<IPrimitive<Uint8Array>>).value;

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

  static deserialize(type: TypeDescriptor, reader: SigmaReader): unknown {
    if (isPrimitiveType(type)) {
      switch (type) {
        case SBoolType:
          return reader.readBoolean();
        case SByteType:
          return reader.readByte();
        case SShortType:
          return reader.readShort();
        case SIntType:
          return reader.readInt();
        case SLongType:
          return reader.readLong();
        case SBigIntType:
          return reader.readBigInt();
        case SGroupElementType:
          return reader.readBytes(GROUP_ELEMENT_LENGTH);
        case SSigmaPropType: {
          if (reader.readByte() === PROVE_DLOG_OP) {
            return this.deserialize(SGroupElementType, reader);
          }

          break;
        }
        // case PrimitiveTypeCode.Unit:
        // case PrimitiveTypeCode.Box:
        default:
          break;
      }
    } else {
      switch (type.ctor) {
        case SCollType: {
          const length = reader.readVlq();
          const embeddedType = first(type.wrapped);

          switch (embeddedType) {
            case SBoolType:
              return reader.readBits(length);
            case SByteType:
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
        case STupleType: {
          return type.wrapped.map((t) => this.deserialize(t, reader));
        }
      }
    }

    throw new Error("Parsing error: type not implemented.");
  }
}
