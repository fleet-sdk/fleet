import { SigmaTypeCode } from "./sigmaTypeCode";
import { IPrimitiveSigmaType, ISigmaCollection, ISigmaType } from "./sigmaTypes";

export function isPrimitiveType<T>(data: ISigmaType): data is IPrimitiveSigmaType<T> {
  return !isConstructorTypeCode(data.type);
}

export function isColl<T>(data: ISigmaType): data is ISigmaCollection<T> {
  return data.type >= 0x0c && data.type <= 0x23;
}

export function isEmbeddableTypeCode(typeCode: number): boolean {
  return typeCode >= 0x01 && typeCode <= 0x0b;
}

export function isPrimitiveTypeCode(typeCode: SigmaTypeCode): boolean {
  return !isConstructorTypeCode(typeCode);
}

export function isConstructorTypeCode(type: SigmaTypeCode): boolean {
  return type >= 0x0c && type <= 0x60;
}
