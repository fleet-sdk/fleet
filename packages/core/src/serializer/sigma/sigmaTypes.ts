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

export interface ISigmaTypeBase {
  readonly code: number;

  readonly embeddable: boolean;
  readonly primitive: boolean;
}

export interface ISigmaConstructorType extends ISigmaTypeBase {
  readonly primitive: false;
  isConstructorOf(typeCode: number): boolean;
}

export interface IPrimitiveSigmaType extends ISigmaTypeBase {
  readonly primitive: true;
  readonly name: string;
}

export type ISigmaType = ISigmaConstructorType | IPrimitiveSigmaType;

export const SBoolType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x01,
  embeddable: true,
  primitive: true,
  name: "SBoolean"
});

export const SByteType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x02,
  embeddable: true,
  primitive: true,
  name: "SByte"
});

export const SShortType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x03,
  embeddable: true,
  primitive: true,
  name: "SShort"
});

export const SIntType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x04,
  embeddable: true,
  primitive: true,
  name: "SInt"
});

export const SLongType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x05,
  embeddable: true,
  primitive: true,
  name: "SLong"
});

export const SBigIntType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x06,
  embeddable: true,
  primitive: true,
  name: "SBigInt"
});

export const SGroupElementType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x07,
  embeddable: true,
  primitive: true,
  name: "SGroupElement"
});

export const SSigmaPropType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x08,
  embeddable: true,
  primitive: true,
  name: "SSigmaProp"
});

export const SUnitType = Object.freeze<IPrimitiveSigmaType>({
  code: 0x62,
  embeddable: false,
  primitive: true,
  name: "SUnit"
});

interface ISCollType extends ISigmaConstructorType {
  simpleCollTypeCode: number;
  nestedCollTypeCode: number;
}

export const SCollType = Object.freeze<ISCollType>({
  code: typeCodeOf(ConstructorCode.SimpleColl),
  simpleCollTypeCode: typeCodeOf(ConstructorCode.SimpleColl),
  nestedCollTypeCode: typeCodeOf(ConstructorCode.NestedColl),
  embeddable: false,
  primitive: false,
  isConstructorOf(typeCode) {
    return (
      typeCode >= this.simpleCollTypeCode &&
      typeCode <= this.nestedCollTypeCode + MAX_PRIMITIVE_TYPE_CODE
    );
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
  isConstructorOf(typeCode) {
    return typeCode >= this.pairOneTypeCode && typeCode <= this.tupleTypeCode;
  }
});

export interface ISigmaValue<T extends ISigmaType = ISigmaType> {
  readonly type: T;
}

export interface ISPrimitive<T> extends ISigmaValue<IPrimitiveSigmaType> {
  value: T;
}

export interface ISColl<T> extends ISigmaValue {
  items: ArrayLike<T>;
  itemsType: ISigmaType;
}

export interface ISTuple extends ISigmaValue {
  items: ISigmaValue[];
}

export function SByte(value: number): ISPrimitive<number>;
export function SByte(): ISigmaType;
export function SByte(value?: number): ISPrimitive<number> | ISigmaType {
  return createPrimitiveValue(SByteType, value);
}

export function SBool(value: boolean): ISPrimitive<boolean>;
export function SBool(): ISigmaType;
export function SBool(value?: boolean): ISPrimitive<boolean> | ISigmaType {
  return createPrimitiveValue(SBoolType, value);
}

export function SShort(value: number): ISPrimitive<number>;
export function SShort(): ISigmaType;
export function SShort(value?: number): ISPrimitive<number> | ISigmaType {
  return createPrimitiveValue(SShortType, value);
}

export function SInt(value: number): ISPrimitive<number>;
export function SInt(): ISigmaType;
export function SInt(value?: number): ISPrimitive<number> | ISigmaType {
  return createPrimitiveValue(SIntType, value);
}

export function SLong(value: number | string | bigint): ISPrimitive<bigint>;
export function SLong(): ISigmaType;
export function SLong(value?: number | string | bigint): ISPrimitive<bigint> | ISigmaType {
  return createPrimitiveValue(SLongType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SBigInt(value: string | bigint): ISPrimitive<bigint>;
export function SBigInt(): ISigmaType;
export function SBigInt(value?: string | bigint): ISPrimitive<bigint> | ISigmaType {
  return createPrimitiveValue(SBigIntType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SUnit(): ISPrimitive<null>;
export function SUnit(): ISigmaType;
export function SUnit(): ISPrimitive<null> | ISigmaType {
  return createPrimitiveValue(SUnitType, null);
}

export function SGroupElement(value: Uint8Array): ISPrimitive<Uint8Array>;
export function SGroupElement(): ISigmaType;
export function SGroupElement(value?: Uint8Array): ISPrimitive<Uint8Array> | ISigmaType {
  return createPrimitiveValue(SGroupElementType, value);
}

export function SSigmaProp(value: ISPrimitive<Uint8Array>): ISPrimitive<ISigmaValue>;
export function SSigmaProp(): ISigmaType;
export function SSigmaProp(value?: ISPrimitive<Uint8Array>): ISPrimitive<ISigmaValue> | ISigmaType {
  return createPrimitiveValue(SSigmaPropType, value);
}

function createPrimitiveValue<T>(
  type: IPrimitiveSigmaType,
  value?: T
): ISPrimitive<T> | ISigmaType {
  return value !== undefined ? { type, value } : type;
}

export function SColl<T>(typeConstructor: () => ISigmaType, items: ArrayLike<T>): ISColl<T> {
  return { type: SCollType, itemsType: typeConstructor(), items };
}

export function STuple(...items: ISigmaValue[]): ISTuple {
  return { type: tupleType, items };
}
