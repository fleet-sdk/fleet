import { ISColl, ISigmaValue, ISTuple, SCollType, tupleType } from "./sigmaTypes";

export function isColl<T>(data: ISigmaValue): data is ISColl<T> {
  return SCollType.isConstructorOf(data.type.code);
}

export function isTuple(data: ISigmaValue): data is ISTuple {
  return tupleType.isConstructorOf(data.type.code);
}

export function isPrimitiveTypeCode(typeCode: number): boolean {
  return !isConstructorTypeCode(typeCode);
}

export function isConstructorTypeCode(type: number): boolean {
  return type >= SCollType.code && type <= tupleType.tupleTypeCode;
}
