import { hexToBytes } from "@noble/hashes/utils";
import { vlqEncode } from "../vlq";
import { SigmaByteReader } from "./sigmaByteReader";
import { SigmaByteWriter } from "./sigmaByteWriter";
import { SigmaTypeCode } from "./sigmaTypeCode";
import { IPrimitiveSigmaType, ISigmaType } from "./sigmaTypes";
import { isColl, isPrimitiveType, isPrimitiveTypeCode } from "./utils";

export class DataSerializer {
  public static serialize(data: ISigmaType, writer: SigmaByteWriter) {
    if (isPrimitiveType(data)) {
      switch (data.type) {
        case SigmaTypeCode.Boolean:
          writer.writeBoolean((data as IPrimitiveSigmaType<boolean>).value);
          break;
        case SigmaTypeCode.Byte:
          writer.write((data as IPrimitiveSigmaType<number>).value);
          break;
        case SigmaTypeCode.Short:
        case SigmaTypeCode.Int:
          writer.writeNumber((data as IPrimitiveSigmaType<number>).value);
          break;
        case SigmaTypeCode.Long:
          writer.writeLong((data as IPrimitiveSigmaType<bigint>).value);
          break;
        case SigmaTypeCode.BigInt: {
          writer.writeBigInt((data as IPrimitiveSigmaType<bigint>).value);
          break;
        }
        case SigmaTypeCode.GroupElement:
          writer.writeBytes((data as IPrimitiveSigmaType<Uint8Array>).value);
          break;
        case SigmaTypeCode.SigmaProp: {
          const node = (data as IPrimitiveSigmaType<ISigmaType>).value;
          if (node.type === SigmaTypeCode.GroupElement) {
            writer.write(0xcd); // CreateProveDlog operation
            DataSerializer.serialize(node, writer);
          } else {
            throw Error("Not implemented");
          }
          break;
        }
        case SigmaTypeCode.Unit: // same as void, don't need to save anything
          break;
        case SigmaTypeCode.Box:
        default:
          throw Error("Not implemented");
      }
    } else if (isColl(data)) {
      if (typeof data.value === "string") {
        writer.writeBytes(vlqEncode(data.value.length / 2));
      } else {
        writer.writeBytes(vlqEncode(data.value.length));
      }

      switch (data.elementsType) {
        case SigmaTypeCode.Boolean: {
          writer.writeBits(data.value as boolean[]);
          break;
        }
        case SigmaTypeCode.Byte: {
          let bytes!: Uint8Array;
          if (typeof data.value === "string") {
            bytes = hexToBytes(data.value);
          } else {
            bytes = Uint8Array.from(data.value as number[]);
          }

          writer.writeBytes(bytes);
          break;
        }
        default: {
          for (let i = 0; i < data.value.length; i++) {
            DataSerializer.serialize(
              { type: data.elementsType, value: data.value[i] } as ISigmaType,
              writer
            );
          }
        }
      }
    } else {
      throw Error("Not implemented");
    }
  }

  static deserialize(typeCode: SigmaTypeCode, reader: SigmaByteReader): unknown {
    if (isPrimitiveTypeCode(typeCode)) {
      switch (typeCode) {
        case SigmaTypeCode.Boolean:
          return reader.readBoolean();
        case SigmaTypeCode.Byte:
          return reader.readByte();
        case SigmaTypeCode.Short:
        case SigmaTypeCode.Int:
          return reader.readNumber();
        case SigmaTypeCode.Long:
          return reader.readLong();
        // case SigmaTypeCode.BigInt:
        case SigmaTypeCode.GroupElement:
          return reader.readBytes(34);
        // case SigmaTypeCode.SigmaProp:
        // case SigmaTypeCode.Unit:
        // case SigmaTypeCode.Box:
        // default:
        //   break;
      }
    }

    throw new Error("Type parsing not yet implemented.");
  }
}
