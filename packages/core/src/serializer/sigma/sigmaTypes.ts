import { ensureBigInt, isDefined } from "@fleet-sdk/common";

export const enum ConstructorCode {
  Primitive = 0,

  SimpleColl = 1,
  NestedColl = 2,

  PairOne = 5,
  PairTwo = 6,
  SymmetricPair = 7,
  GenericTuple = 8
}

const typeCodeOf = (constructor: ConstructorCode) => (MAX_PRIMITIVE_TYPE_CODE + 1) * constructor;

const MAX_PRIMITIVE_TYPE_CODE = 0x0b;

export interface ISigmaType {
  readonly code: number;
  readonly embeddable: boolean;
  readonly primitive: boolean;
  readonly name: string;
}

export interface ISigmaConstructorType extends ISigmaType {
  test(typeCode: number): boolean;
}

export const boolType = Object.freeze<ISigmaType>({
  code: 0x01,
  embeddable: true,
  primitive: true,
  name: "SBoolean"
});

export const byteType = Object.freeze<ISigmaType>({
  code: 0x02,
  embeddable: true,
  primitive: true,
  name: "SByte"
});

export const shortType = Object.freeze<ISigmaType>({
  code: 0x03,
  embeddable: true,
  primitive: true,
  name: "SShort"
});

export const intType = Object.freeze<ISigmaType>({
  code: 0x04,
  embeddable: true,
  primitive: true,
  name: "SInt"
});

export const longType = Object.freeze<ISigmaType>({
  code: 0x05,
  embeddable: true,
  primitive: true,
  name: "SLong"
});

export const bigIntType = Object.freeze<ISigmaType>({
  code: 0x06,
  embeddable: true,
  primitive: true,
  name: "SBigInt"
});

export const groupElementType = Object.freeze<ISigmaType>({
  code: 0x07,
  embeddable: true,
  primitive: true,
  name: "SGroupElement"
});

export const sigmaPropType = Object.freeze<ISigmaType>({
  code: 0x08,
  embeddable: true,
  primitive: true,
  name: "SSigmaProp"
});

export const unitType = Object.freeze<ISigmaType>({
  code: 0x62,
  embeddable: false,
  primitive: true,
  name: "SUnit"
});

interface ISCollType extends ISigmaConstructorType {
  nestedTypeCode: number;
}

export const collType = Object.freeze<ISCollType>({
  code: typeCodeOf(ConstructorCode.SimpleColl),
  nestedTypeCode: typeCodeOf(ConstructorCode.NestedColl),
  embeddable: false,
  primitive: false,
  name: "Coll",
  test(typeCode) {
    return typeCode >= this.code && typeCode <= this.nestedTypeCode + MAX_PRIMITIVE_TYPE_CODE;
  }
});

interface ITupleType extends ISigmaConstructorType {
  pairOneTypeCode: number;
  pairTwoTypeCode: number;
  tripleTypeCode: number;
  symmetricPairTypeCode: number;
  quadrupleTypeCode: number;
  tupleTypeCode: number;
}

export const tupleType = Object.freeze<ITupleType>({
  code: typeCodeOf(ConstructorCode.PairOne),
  pairOneTypeCode: typeCodeOf(ConstructorCode.PairOne),
  pairTwoTypeCode: typeCodeOf(ConstructorCode.PairTwo),
  tripleTypeCode: typeCodeOf(ConstructorCode.PairTwo),
  symmetricPairTypeCode: typeCodeOf(ConstructorCode.SymmetricPair),
  quadrupleTypeCode: typeCodeOf(ConstructorCode.SymmetricPair),
  tupleTypeCode: typeCodeOf(ConstructorCode.GenericTuple),
  embeddable: false,
  primitive: false,
  name: "SColl",
  test(typeCode) {
    return typeCode >= this.code && typeCode <= this.tupleTypeCode;
  }
});

export interface ISigmaValue {
  readonly type: ISigmaType;
}

export interface ISPrimitive<T> extends ISigmaValue {
  value: T;
}

export interface ISColl<T> extends ISigmaValue {
  items: ArrayLike<T>;
  itemsType: ISigmaType;
}

export interface ISTuple extends ISigmaValue {
  items: ArrayLike<ISigmaValue>;
}

export function SByte(value: number): ISPrimitive<number>;
export function SByte(): ISigmaType;
export function SByte(value?: number): ISPrimitive<number> | ISigmaType {
  return createPrimitiveValue(byteType, value);
}

export function SBool(value: boolean): ISPrimitive<boolean>;
export function SBool(): ISigmaType;
export function SBool(value?: boolean): ISPrimitive<boolean> | ISigmaType {
  return createPrimitiveValue(boolType, value);
}

export function SShort(value: number): ISPrimitive<number>;
export function SShort(): ISigmaType;
export function SShort(value?: number): ISPrimitive<number> | ISigmaType {
  return createPrimitiveValue(shortType, value);
}

export function SInt(value: number): ISPrimitive<number>;
export function SInt(): ISigmaType;
export function SInt(value?: number): ISPrimitive<number> | ISigmaType {
  return createPrimitiveValue(intType, value);
}

export function SLong(value: number | string | bigint): ISPrimitive<bigint>;
export function SLong(): ISigmaType;
export function SLong(value?: number | string | bigint): ISPrimitive<bigint> | ISigmaType {
  return createPrimitiveValue(longType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SBigInt(value: string | bigint): ISPrimitive<bigint>;
export function SBigInt(): ISigmaType;
export function SBigInt(value?: string | bigint): ISPrimitive<bigint> | ISigmaType {
  return createPrimitiveValue(bigIntType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SUnit(): ISPrimitive<null>;
export function SUnit(): ISigmaType;
export function SUnit(): ISPrimitive<null> | ISigmaType {
  return createPrimitiveValue(unitType, null);
}

export function SGroupElement(value: Uint8Array): ISPrimitive<Uint8Array>;
export function SGroupElement(): ISigmaType;
export function SGroupElement(value?: Uint8Array): ISPrimitive<Uint8Array> | ISigmaType {
  return createPrimitiveValue(groupElementType, value);
}

export function SSigmaProp(value: ISPrimitive<Uint8Array>): ISPrimitive<ISigmaValue>;
export function SSigmaProp(): ISigmaType;
export function SSigmaProp(value?: ISPrimitive<Uint8Array>): ISPrimitive<ISigmaValue> | ISigmaType {
  return createPrimitiveValue(sigmaPropType, value);
}

function createPrimitiveValue<T>(type: ISigmaType, value?: T): ISPrimitive<T> | ISigmaType {
  return value !== undefined ? { type, value } : type;
}

export function SColl<T>(typeConstructor: () => ISigmaType, items: ArrayLike<T>): ISColl<T> {
  return { type: collType, itemsType: typeConstructor(), items };
}

export function STuple(...items: ISigmaValue[]): ISTuple {
  return { type: tupleType, items };
}
