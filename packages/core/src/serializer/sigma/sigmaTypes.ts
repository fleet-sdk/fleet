import { ensureBigInt, isDefined } from "@fleet-sdk/common";

export const enum ConstructorCode {
  Embeddable = 0,

  SimpleColl = 1,
  NestedColl = 2,

  Option = 3,
  OptionCollection = 4,

  PairOne = 5,
  PairTwo = 6,
  SymmetricPair = 7,
  GenericTuple = 8
}

const MAX_PRIMITIVE_TYPE_CODE = 0x0b;
export const PRIMITIVE_TYPE_RANGE = MAX_PRIMITIVE_TYPE_CODE + 0x01;

const typeCodeOf = (constructor: ConstructorCode) => PRIMITIVE_TYPE_RANGE * constructor;

export interface ISigmaTypeBase {
  readonly code: number;

  readonly embeddable: boolean;
  readonly primitive: boolean;
}

export interface IConstructorType extends ISigmaTypeBase {
  readonly primitive: false;
  readonly embeddable: false;
  isConstructorOf(typeCode: number): boolean;
}

export interface IPrimitiveType extends ISigmaTypeBase {
  readonly primitive: true;
  readonly name: string;
}

export interface IEmbeddableType extends IPrimitiveType {
  readonly embeddable: true;
}

export type SigmaType = IConstructorType | IPrimitiveType | IEmbeddableType;
export type TypeDescriptor = IPrimitiveType | { ctor: IConstructorType; wrapped: TypeDescriptor[] };

export const SBoolType = Object.freeze<IEmbeddableType>({
  code: 0x01,
  embeddable: true,
  primitive: true,
  name: "SBoolean"
});

export const SByteType = Object.freeze<IEmbeddableType>({
  code: 0x02,
  embeddable: true,
  primitive: true,
  name: "SByte"
});

export const SShortType = Object.freeze<IEmbeddableType>({
  code: 0x03,
  embeddable: true,
  primitive: true,
  name: "SShort"
});

export const SIntType = Object.freeze<IEmbeddableType>({
  code: 0x04,
  embeddable: true,
  primitive: true,
  name: "SInt"
});

export const SLongType = Object.freeze<IEmbeddableType>({
  code: 0x05,
  embeddable: true,
  primitive: true,
  name: "SLong"
});

export const SBigIntType = Object.freeze<IEmbeddableType>({
  code: 0x06,
  embeddable: true,
  primitive: true,
  name: "SBigInt"
});

export const SGroupElementType = Object.freeze<IEmbeddableType>({
  code: 0x07,
  embeddable: true,
  primitive: true,
  name: "SGroupElement"
});

export const SSigmaPropType = Object.freeze<IEmbeddableType>({
  code: 0x08,
  embeddable: true,
  primitive: true,
  name: "SSigmaProp"
});

export const SUnitType = Object.freeze<IPrimitiveType>({
  code: 0x62,
  embeddable: false,
  primitive: true,
  name: "SUnit"
});

interface ISCollType extends IConstructorType {
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

interface ITupleType extends IConstructorType {
  pairOneTypeCode: number;
  pairTwoTypeCode: number;
  tripleTypeCode: number;
  symmetricPairTypeCode: number;
  quadrupleTypeCode: number;
  genericTupleTypeCode: number;
}

export const STupleType = Object.freeze<ITupleType>({
  code: typeCodeOf(ConstructorCode.PairOne),
  pairOneTypeCode: typeCodeOf(ConstructorCode.PairOne),
  pairTwoTypeCode: typeCodeOf(ConstructorCode.PairTwo),
  tripleTypeCode: typeCodeOf(ConstructorCode.PairTwo),
  symmetricPairTypeCode: typeCodeOf(ConstructorCode.SymmetricPair),
  quadrupleTypeCode: typeCodeOf(ConstructorCode.SymmetricPair),
  genericTupleTypeCode: typeCodeOf(ConstructorCode.GenericTuple),
  embeddable: false,
  primitive: false,
  isConstructorOf(typeCode) {
    return typeCode >= this.pairOneTypeCode && typeCode <= this.genericTupleTypeCode;
  }
});

export interface ISigmaValue<T extends SigmaType = SigmaType> {
  readonly type: T;
}

export interface IPrimitive<T> extends ISigmaValue<IPrimitiveType> {
  value: T;
}

export interface IColl<T> extends ISigmaValue {
  items: ArrayLike<T>;
  itemsType: SigmaType;
}

export interface ITuple extends ISigmaValue {
  items: ISigmaValue[];
}

export function SByte(value: number): IPrimitive<number>;
export function SByte(): SigmaType;
export function SByte(value?: number): IPrimitive<number> | SigmaType {
  return createPrimitiveValue(SByteType, value);
}

export function SBool(value: boolean): IPrimitive<boolean>;
export function SBool(): SigmaType;
export function SBool(value?: boolean): IPrimitive<boolean> | SigmaType {
  return createPrimitiveValue(SBoolType, value);
}

export function SShort(value: number): IPrimitive<number>;
export function SShort(): SigmaType;
export function SShort(value?: number): IPrimitive<number> | SigmaType {
  return createPrimitiveValue(SShortType, value);
}

export function SInt(value: number): IPrimitive<number>;
export function SInt(): SigmaType;
export function SInt(value?: number): IPrimitive<number> | SigmaType {
  return createPrimitiveValue(SIntType, value);
}

export function SLong(value: number | string | bigint): IPrimitive<bigint>;
export function SLong(): SigmaType;
export function SLong(value?: number | string | bigint): IPrimitive<bigint> | SigmaType {
  return createPrimitiveValue(SLongType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SBigInt(value: string | bigint): IPrimitive<bigint>;
export function SBigInt(): SigmaType;
export function SBigInt(value?: string | bigint): IPrimitive<bigint> | SigmaType {
  return createPrimitiveValue(SBigIntType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SUnit(): IPrimitive<null>;
export function SUnit(): SigmaType;
export function SUnit(): IPrimitive<null> | SigmaType {
  return createPrimitiveValue(SUnitType, null);
}

export function SGroupElement(value: Uint8Array): IPrimitive<Uint8Array>;
export function SGroupElement(): SigmaType;
export function SGroupElement(value?: Uint8Array): IPrimitive<Uint8Array> | SigmaType {
  return createPrimitiveValue(SGroupElementType, value);
}

export function SSigmaProp(value: IPrimitive<Uint8Array>): IPrimitive<ISigmaValue>;
export function SSigmaProp(): SigmaType;
export function SSigmaProp(value?: IPrimitive<Uint8Array>): IPrimitive<ISigmaValue> | SigmaType {
  return createPrimitiveValue(SSigmaPropType, value);
}

function createPrimitiveValue<T>(type: IPrimitiveType, value?: T): IPrimitive<T> | SigmaType {
  return value !== undefined ? { type, value } : type;
}

export function SColl<T>(typeConstructor: () => SigmaType, items: ArrayLike<T>): IColl<T> {
  return { type: SCollType, itemsType: typeConstructor(), items };
}

export function STuple(...items: ISigmaValue[]): ITuple {
  return { type: STupleType, items };
}
