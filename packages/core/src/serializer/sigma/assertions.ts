import { collType, ISColl, ISigmaValue, ISTuple, tupleType } from "./sigmaTypes";

export function isColl<T>(data: ISigmaValue): data is ISColl<T> {
  return collType.test(data.type.code);
}

export function isTuple(data: ISigmaValue): data is ISTuple {
  return tupleType.test(data.type.code);
}

export function isPrimitiveTypeCode(typeCode: number): boolean {
  return !isConstructorTypeCode(typeCode);
}

export function isConstructorTypeCode(type: number): boolean {
  return type >= collType.code && type <= tupleType.tupleTypeCode;
}
