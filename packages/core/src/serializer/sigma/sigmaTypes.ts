import { ensureBigInt, isDefined } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";

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

export interface IEmbeddableType<I, O> extends IPrimitiveType {
  readonly embeddable: true;
  coerce(input: I): O;
}

export type SigmaType = IConstructorType | IPrimitiveType | IEmbeddableType<unknown, unknown>;
export type TypeDescriptor = IPrimitiveType | { ctor: IConstructorType; wrapped: TypeDescriptor[] };

export const SBoolType = Object.freeze<IEmbeddableType<boolean, boolean>>({
  code: 0x01,
  embeddable: true,
  primitive: true,
  name: "SBoolean",
  coerce: (input) => input
});

export interface ISByteType extends IEmbeddableType<number, number> {
  name: "SByte";
}

export const SByteType = Object.freeze<ISByteType>({
  code: 0x02,
  embeddable: true,
  primitive: true,
  name: "SByte",
  coerce: (input) => input
});

export const SShortType = Object.freeze<IEmbeddableType<number, number>>({
  code: 0x03,
  embeddable: true,
  primitive: true,
  name: "SShort",
  coerce: (input) => input
});

export const SIntType = Object.freeze<IEmbeddableType<number, number>>({
  code: 0x04,
  embeddable: true,
  primitive: true,
  name: "SInt",
  coerce: (input) => input
});

export const SLongType = Object.freeze<IEmbeddableType<number | string | bigint, bigint>>({
  code: 0x05,
  embeddable: true,
  primitive: true,
  name: "SLong",
  coerce: (input) => ensureBigInt(input)
});

export const SBigIntType = Object.freeze<IEmbeddableType<number | string | bigint, bigint>>({
  code: 0x06,
  embeddable: true,
  primitive: true,
  name: "SBigInt",
  coerce: (input) => ensureBigInt(input)
});

export const SGroupElementType = Object.freeze<IEmbeddableType<Uint8Array, Uint8Array>>({
  code: 0x07,
  embeddable: true,
  primitive: true,
  name: "SGroupElement",
  coerce: (input) => input
});

export const SSigmaPropType = Object.freeze<
  IEmbeddableType<IPrimitive<Uint8Array>, IPrimitive<Uint8Array>>
>({
  code: 0x08,
  embeddable: true,
  primitive: true,
  name: "SSigmaProp",
  coerce: (input) => input
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

export interface IColl extends ISigmaValue {
  value: ArrayLike<unknown>;
  wrappedType: SigmaType;
}

export interface ITuple extends ISigmaValue {
  value: ISigmaValue[];
}

export function SByte(value: number): IPrimitive<number>;
export function SByte(value?: number): typeof SByteType;
export function SByte(value?: number) {
  return createPrimitiveValue(SByteType, value);
}

export function SBool(value: boolean): IPrimitive<boolean>;
export function SBool(value?: boolean): typeof SBoolType;
export function SBool(value?: boolean) {
  return createPrimitiveValue(SBoolType, value);
}

export function SShort(value: number): IPrimitive<number>;
export function SShort(value?: number): typeof SShortType;
export function SShort(value?: number) {
  return createPrimitiveValue(SShortType, value);
}

export function SInt(value: number): IPrimitive<number>;
export function SInt(value?: number): typeof SIntType;
export function SInt(value?: number) {
  return createPrimitiveValue(SIntType, value);
}

export function SLong(value: number | string | bigint): IPrimitive<bigint>;
export function SLong(value?: number | string | bigint): typeof SLongType;
export function SLong(value?: number | string | bigint) {
  return createPrimitiveValue(SLongType, isDefined(value) ? SLongType.coerce(value) : undefined);
}

export function SBigInt(value: string | bigint): IPrimitive<bigint>;
export function SBigInt(value?: string | bigint): typeof SBigIntType;
export function SBigInt(value?: string | bigint) {
  return createPrimitiveValue(
    SBigIntType,
    isDefined(value) ? SBigIntType.coerce(value) : undefined
  );
}

export function SUnit(): IPrimitive<null>;
export function SUnit(): SigmaType;
export function SUnit(): IPrimitive<null> | SigmaType {
  return createPrimitiveValue(SUnitType, null);
}

export function SGroupElement(value: Uint8Array): IPrimitive<Uint8Array>;
export function SGroupElement(value?: Uint8Array): typeof SGroupElementType;
export function SGroupElement(value?: Uint8Array) {
  return createPrimitiveValue(SGroupElementType, value);
}

export function SSigmaProp(value: IPrimitive<Uint8Array>): IPrimitive<ISigmaValue>;
export function SSigmaProp(value?: IPrimitive<Uint8Array>): typeof SSigmaPropType;
export function SSigmaProp(value?: IPrimitive<Uint8Array>): IPrimitive<ISigmaValue> | SigmaType {
  return createPrimitiveValue(SSigmaPropType, value);
}

function createPrimitiveValue<I, O>(
  type: IEmbeddableType<I, O> | IPrimitiveType,
  value?: O
): IPrimitive<O> | IEmbeddableType<I, O> | IPrimitiveType {
  return value !== undefined ? { type, value } : type;
}

export function SColl(type: () => ISByteType, items: Uint8Array | string): IColl;
export function SColl<T>(
  type: () => IEmbeddableType<T, Uint8Array>,
  items: Uint8Array | string
): IColl;
export function SColl<T>(type: (arg?: T) => SigmaType, items: T[]): IColl;
export function SColl<T>(type: (arg?: T) => SigmaType, items: T[] | Uint8Array | string): IColl {
  const wrappedType = (type as () => SigmaType)();

  if (typeof items === "string") {
    items = hex.decode(items);
  } else if (wrappedType.embeddable && !(items instanceof Uint8Array)) {
    items = items.map((i) => (wrappedType as IEmbeddableType<unknown, T>).coerce(i));
  }

  return { type: SCollType, wrappedType, value: items };
}

SColl(SGroupElement, Uint8Array.from([1]));
SColl(SGroupElement, "");
// SColl(SBigInt, [1n, "1", true]);
// SColl(SBool, [true, false, 1])

export function STuple(...items: ISigmaValue[]): ITuple {
  return { type: STupleType, value: items };
}
