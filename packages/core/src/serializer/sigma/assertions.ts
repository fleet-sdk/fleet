import { collType, ISCollValue, ISigmaValue, ISTupleValue, tupleType } from "./sigmaTypes";

export function isColl<T>(data: ISigmaValue): data is ISCollValue<T> {
  return collType.test(data.type.code);
}

export function isTuple(data: ISigmaValue): data is ISTupleValue {
  return tupleType.test(data.type.code);
}

export function isPrimitiveTypeCode(typeCode: number): boolean {
  return !isConstructorTypeCode(typeCode);
}

export function isConstructorTypeCode(type: number): boolean {
  return type >= collType.code && type <= tupleType.tupleTypeCode;
}
