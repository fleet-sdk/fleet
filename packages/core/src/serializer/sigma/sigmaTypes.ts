import { ensureBigInt, isDefined } from "@fleet-sdk/common";

const COLL_CONSTR_ID = 1;
const NESTED_COLL_CONSTR_ID = 2;

const PAIR1_CONSTR_ID = 5;
const PAIR2_CONSTR_ID = 6;
const PAIR_SYMMETRIC_CONSTR_ID = 7;
const TUPLE_CONSTR_ID = 7;

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
  /** Type code for `Coll[T] for some T` type used in TypeSerializer. */
  code: (MAX_PRIMITIVE_TYPE_CODE + 1) * COLL_CONSTR_ID,
  /** Type code for `Coll[Coll[T]] for some T` type used in TypeSerializer. */
  nestedTypeCode: (MAX_PRIMITIVE_TYPE_CODE + 1) * NESTED_COLL_CONSTR_ID,
  embeddable: false,
  primitive: false,
  name: "Coll",
  test(typeCode) {
    return typeCode >= this.code && typeCode <= this.nestedTypeCode + MAX_PRIMITIVE_TYPE_CODE;
  }
});

interface ITupleType extends ISigmaConstructorType {
  pair1TypeCode: number;
  pair2TypeCode: number;
  tripleTypeCode: number;
  symmetricPairTypeCode: number;
  quadrupleTypeCode: number;
  tupleTypeCode: number;
}

export const tupleType = Object.freeze<ITupleType>({
  code: (MAX_PRIMITIVE_TYPE_CODE + 1) * PAIR1_CONSTR_ID,
  /** Type code for `(E, T) for some embeddable T` type used in TypeSerializer. */
  pair1TypeCode: (MAX_PRIMITIVE_TYPE_CODE + 1) * PAIR1_CONSTR_ID,
  /** Type code for `(T, E) for some embeddable T` type used in TypeSerializer. */
  pair2TypeCode: (MAX_PRIMITIVE_TYPE_CODE + 1) * PAIR2_CONSTR_ID,
  tripleTypeCode: (MAX_PRIMITIVE_TYPE_CODE + 1) * PAIR2_CONSTR_ID,
  /** Type code of symmetric pair `(T, T)` for some embeddable T. */
  symmetricPairTypeCode: (MAX_PRIMITIVE_TYPE_CODE + 1) * PAIR_SYMMETRIC_CONSTR_ID,
  quadrupleTypeCode: (MAX_PRIMITIVE_TYPE_CODE + 1) * PAIR_SYMMETRIC_CONSTR_ID,
  tupleTypeCode: (MAX_PRIMITIVE_TYPE_CODE + 1) * TUPLE_CONSTR_ID,
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

export interface ISPrimitiveValue<T> extends ISigmaValue {
  value: T;
}

export interface ISCollValue<T> extends ISigmaValue {
  items: ArrayLike<T>;
  itemsType: ISigmaType;
}

export interface ISTupleValue extends ISigmaValue {
  items: ArrayLike<ISigmaValue>;
}

export function SByte(value: number): ISPrimitiveValue<number>;
export function SByte(): ISigmaType;
export function SByte(value?: number): ISPrimitiveValue<number> | ISigmaType {
  return createPrimitiveValue(byteType, value);
}

export function SBool(value: boolean): ISPrimitiveValue<boolean>;
export function SBool(): ISigmaType;
export function SBool(value?: boolean): ISPrimitiveValue<boolean> | ISigmaType {
  return createPrimitiveValue(boolType, value);
}

export function SShort(value: number): ISPrimitiveValue<number>;
export function SShort(): ISigmaType;
export function SShort(value?: number): ISPrimitiveValue<number> | ISigmaType {
  return createPrimitiveValue(shortType, value);
}

export function SInt(value: number): ISPrimitiveValue<number>;
export function SInt(): ISigmaType;
export function SInt(value?: number): ISPrimitiveValue<number> | ISigmaType {
  return createPrimitiveValue(intType, value);
}

export function SLong(value: number | string | bigint): ISPrimitiveValue<bigint>;
export function SLong(): ISigmaType;
export function SLong(value?: number | string | bigint): ISPrimitiveValue<bigint> | ISigmaType {
  return createPrimitiveValue(longType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SBigInt(value: string | bigint): ISPrimitiveValue<bigint>;
export function SBigInt(): ISigmaType;
export function SBigInt(value?: string | bigint): ISPrimitiveValue<bigint> | ISigmaType {
  return createPrimitiveValue(bigIntType, isDefined(value) ? ensureBigInt(value) : undefined);
}

export function SUnit(): ISPrimitiveValue<null>;
export function SUnit(): ISigmaType;
export function SUnit(): ISPrimitiveValue<null> | ISigmaType {
  return createPrimitiveValue(unitType, null);
}

export function SGroupElement(value: Uint8Array): ISPrimitiveValue<Uint8Array>;
export function SGroupElement(): ISigmaType;
export function SGroupElement(value?: Uint8Array): ISPrimitiveValue<Uint8Array> | ISigmaType {
  return createPrimitiveValue(groupElementType, value);
}

export function SSigmaProp(value: ISPrimitiveValue<Uint8Array>): ISPrimitiveValue<ISigmaValue>;
export function SSigmaProp(): ISigmaType;
export function SSigmaProp(
  value?: ISPrimitiveValue<Uint8Array>
): ISPrimitiveValue<ISigmaValue> | ISigmaType {
  return createPrimitiveValue(sigmaPropType, value);
}

function createPrimitiveValue<T>(type: ISigmaType, value?: T): ISPrimitiveValue<T> | ISigmaType {
  return value !== undefined ? { type, value } : type;
}

export function SColl<T>(typeConstructor: () => ISigmaType, items: ArrayLike<T>): ISCollValue<T> {
  return { type: collType, itemsType: typeConstructor(), items };
}

export function STuple(...items: ISigmaValue[]): ISTupleValue {
  return { type: tupleType, items };
}
