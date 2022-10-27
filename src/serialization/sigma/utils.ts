import { IPrimarySigmaType, ISigmaCollection, ISigmaType } from "./sigmaTypes";

export function isEmbeddable(typeCode: number): boolean {
  return typeCode >= 0x01 && typeCode <= 0x0b;
}

export function isPrimaryType<T>(data: ISigmaType): data is IPrimarySigmaType<T> {
  return !isConstructorType(data);
}

export function isColl<T>(data: ISigmaType): data is ISigmaCollection<T> {
  return data.type >= 0x0c && data.type <= 0x23;
}

export function isConstructorType(data: ISigmaType): boolean {
  return data.type >= 0x0c && data.type <= 0x60;
}
