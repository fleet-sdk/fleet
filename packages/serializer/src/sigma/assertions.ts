import {
  PRIMITIVE_TYPE_RANGE,
  SCollType,
  sDescriptors,
  SPrimitiveType,
  STupleType,
  SType
} from "./sigmaTypes";

export function isColl(type: SType): type is SCollType {
  return sDescriptors.coll.isConstructorOf(type.code);
}

export function isTuple(type: SType): type is STupleType<SType> {
  return sDescriptors.tuple.isConstructorOf(type.code);
}

export function isPrimitiveType(type: SType): type is SPrimitiveType<unknown> {
  return (type as SType).code < PRIMITIVE_TYPE_RANGE;
}
