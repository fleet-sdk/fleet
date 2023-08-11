import { isDefined } from "@fleet-sdk/common";
import { SigmaConstant } from "../sigmaConstant";
import { SPrimitiveType, SType } from "./base";
import { descriptors } from "./descriptors";
import { SCollType, STupleType } from "./generics";
import {
  SBigIntType,
  SBoolType,
  SByteType,
  SGroupElementType,
  SLongType,
  SShortType,
  SSigmaPropType
} from "./primitives";

export type SConstructor<T> = (arg?: T) => SType | SCollType<SType>;
type SCollConstant<T> = SigmaConstant<ArrayLike<T>>;
type STupleConstant<T> = SigmaConstant<T, STupleType>;

export function SByte(value: number): SigmaConstant<number>;
export function SByte(value?: number): SByteType;
export function SByte(value?: number) {
  return createPrimitiveValue(descriptors.byte, value);
}

export function SBool(value: boolean): SigmaConstant<boolean>;
export function SBool(value?: boolean): SBoolType;
export function SBool(value?: boolean) {
  return createPrimitiveValue(descriptors.bool, value);
}

export function SShort(value: number): SigmaConstant<number>;
export function SShort(value?: number): SShortType;
export function SShort(value?: number) {
  return createPrimitiveValue(descriptors.short, value);
}

export function SInt(value: number): SigmaConstant<number>;
export function SInt(value?: number): SShortType;
export function SInt(value?: number) {
  return createPrimitiveValue(descriptors.int, value);
}

export function SLong(value: string | bigint): SigmaConstant<bigint>;
export function SLong(value?: string | bigint): SLongType;
export function SLong(value?: string | bigint) {
  return createPrimitiveValue(
    descriptors.long,
    isDefined(value) ? descriptors.long.coerce(value) : undefined
  );
}

export function SBigInt(value: string | bigint): SigmaConstant<bigint>;
export function SBigInt(value?: string | bigint): SBigIntType;
export function SBigInt(value?: string | bigint) {
  return createPrimitiveValue(
    descriptors.bigInt,
    isDefined(value) ? descriptors.bigInt.coerce(value) : undefined
  );
}

export function SGroupElement(value: Uint8Array | string): SigmaConstant<Uint8Array>;
export function SGroupElement(value?: Uint8Array | string): SGroupElementType;
export function SGroupElement(value?: Uint8Array | string) {
  return createPrimitiveValue(descriptors.groupElement, value);
}

export function SSigmaProp(
  value: SigmaConstant<Uint8Array>
): SigmaConstant<SigmaConstant<Uint8Array>>;
export function SSigmaProp(value?: SigmaConstant<Uint8Array>): SSigmaPropType;
export function SSigmaProp(value?: SigmaConstant<Uint8Array>) {
  return createPrimitiveValue(descriptors.sigmaProp, value);
}

function createPrimitiveValue<T>(type: SPrimitiveType<T>, value?: T): SigmaConstant<T> | SType {
  return isDefined(value) ? new SigmaConstant(type, type.coerce(value)) : type;
}

export function SUnit(): SigmaConstant<undefined> {
  return new SigmaConstant(descriptors.unit, undefined);
}

export function SColl<T>(type: SConstructor<T>): SConstructor<ArrayLike<T>>;
export function SColl<T>(
  type: SConstructor<T>,
  elements?: ArrayLike<T> | Uint8Array
): SCollConstant<T>;
export function SColl<T>(
  type: SConstructor<T>,
  elements?: ArrayLike<T> | Uint8Array
): SCollConstant<T> | SConstructor<ArrayLike<T>> {
  const elementsType = type();
  if (!elements) return () => new SCollType(elementsType);

  if (elementsType.code === descriptors.byte.code && !(elements instanceof Uint8Array)) {
    elements = Uint8Array.from(elements as ArrayLike<number>);
  }

  return new SigmaConstant(new SCollType(elementsType), elements as ArrayLike<T>);
}

export function STuple(...items: SigmaConstant[]) {
  return new SigmaConstant(
    new STupleType(items.map((x) => x.type)),
    items.map((x) => x.data)
  );
}

export function SPair<L, R>(
  left: SigmaConstant<L>,
  right: SigmaConstant<R>
): STupleConstant<[L, R]>;
export function SPair<L, R>(left: SConstructor<L>, right: SConstructor<R>): SConstructor<[L, R]>;
export function SPair<L, R>(
  left: SigmaConstant<L> | SConstructor<L>,
  right: SigmaConstant<R> | SConstructor<R>
): STupleConstant<[L, R]> | SConstructor<[L, R]> {
  if (typeof left === "function") {
    return () => new STupleType([left(), (right as SConstructor<R>)()]);
  } else {
    return STuple(left, right as SigmaConstant<R>) as STupleConstant<[L, R]>;
  }
}
