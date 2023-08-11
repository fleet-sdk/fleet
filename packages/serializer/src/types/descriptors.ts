import { SType } from "./base";
import { SCollType, STupleType } from "./generics";
import { SUnitType } from "./monomorphics";
import {
  SBigIntType,
  SBoolType,
  SByteType,
  SGroupElementType,
  SIntType,
  SLongType,
  SShortType,
  SSigmaPropType
} from "./primitives";

export const constructorCode = Object.freeze({
  embeddable: 0,

  simpleColl: 1,
  nestedColl: 2,

  option: 3,
  optionCollection: 4,

  pairOne: 5,
  pairTwo: 6,
  symmetricPair: 7,
  genericTuple: 8
});

const MAX_PRIMITIVE_TYPE_CODE = 0x0b;
export const PRIMITIVE_TYPE_RANGE = MAX_PRIMITIVE_TYPE_CODE + 0x01;
const typeCodeOf = (constructor: number) => PRIMITIVE_TYPE_RANGE * constructor;

const collDescriptor = Object.freeze({
  code: typeCodeOf(constructorCode.simpleColl),
  simpleCollTypeCode: typeCodeOf(constructorCode.simpleColl),
  nestedCollTypeCode: typeCodeOf(constructorCode.nestedColl),
  embeddable: false
}) satisfies SType;

const tupleDescriptor = Object.freeze({
  code: typeCodeOf(constructorCode.pairOne),
  pairOneTypeCode: typeCodeOf(constructorCode.pairOne),
  pairTwoTypeCode: typeCodeOf(constructorCode.pairTwo),
  tripleTypeCode: typeCodeOf(constructorCode.pairTwo),
  symmetricPairTypeCode: typeCodeOf(constructorCode.symmetricPair),
  quadrupleTypeCode: typeCodeOf(constructorCode.symmetricPair),
  genericTupleTypeCode: typeCodeOf(constructorCode.genericTuple),
  embeddable: false
}) satisfies SType;

export const descriptors = {
  bool: new SBoolType(),
  byte: new SByteType(),
  short: new SShortType(),
  int: new SIntType(),
  long: new SLongType(),
  bigInt: new SBigIntType(),
  groupElement: new SGroupElementType(),
  sigmaProp: new SSigmaPropType(),
  unit: new SUnitType(),
  coll: collDescriptor,
  tuple: tupleDescriptor
} satisfies { [key: string]: SType };

export function isColl(type: SType): type is SCollType {
  return (
    type.code >= descriptors.coll.simpleCollTypeCode &&
    type.code <= descriptors.coll.nestedCollTypeCode + MAX_PRIMITIVE_TYPE_CODE
  );
}

export function isTuple(type: SType): type is STupleType {
  return (
    type.code >= descriptors.tuple.pairOneTypeCode &&
    type.code <= descriptors.tuple.genericTupleTypeCode
  );
}

export function getPrimitiveType(typeCode: number) {
  switch (typeCode) {
    case descriptors.bool.code:
      return descriptors.bool;
    case descriptors.byte.code:
      return descriptors.byte;
    case descriptors.short.code:
      return descriptors.short;
    case descriptors.int.code:
      return descriptors.int;
    case descriptors.long.code:
      return descriptors.long;
    case descriptors.bigInt.code:
      return descriptors.bigInt;
    case descriptors.groupElement.code:
      return descriptors.groupElement;
    case descriptors.sigmaProp.code:
      return descriptors.sigmaProp;
    default:
      throw new Error(`The type code '0x${typeCode}' is not a valid primitive type code.`);
  }
}
