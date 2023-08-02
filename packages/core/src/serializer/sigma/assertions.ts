import {
  IColl,
  IPrimitiveType,
  ISigmaValue,
  ITuple,
  SCollType,
  SigmaType,
  STupleType,
  TypeDescriptor
} from "./sigmaTypes";

export function isColl<T>(data: ISigmaValue): data is IColl<T> {
  return SCollType.isConstructorOf(data.type.code);
}

export function isTuple(data: ISigmaValue): data is ITuple {
  return STupleType.isConstructorOf(data.type.code);
}

export function isPrimitiveType(type: TypeDescriptor): type is IPrimitiveType {
  return (type as SigmaType).code !== undefined;
}
