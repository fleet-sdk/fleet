/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { isEmpty } from "@fleet-sdk/common";
import { SigmaConstant } from "../sigmaConstant";
import { SType } from "./base";
import { descriptors } from "./descriptors";
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

export type BigIntInput = string | bigint;
export type ByteInput = Uint8Array | string;

export type SConstructor<T = unknown> = (arg?: T) => SType | SCollType<SType>;
type SCollConstant<T> = SigmaConstant<ArrayLike<T>>;
type STupleConstant<T> = SigmaConstant<T, STupleType>;

type Constructable<T = any> = { new (...args: any): T };
type GenericProxyArgs<R> = R extends (...args: any) => unknown ? Parameters<R> : [];

type SProxy<T extends SType, I, O = I> = {
  (value: I): SigmaConstant<O, T>;
  (value?: I): T;
};

/**
 * Creates a proxy for monomorphic types, this allows constructor
 * functions to be equivalent to their corresponding type.
 *
 * This function will return one instance of `ctor` if not params as set.
 * Otherwise it will return an `SigmaConstant` instance of `ctor` type.
 *
 * @example
 * // SInt is a proxy for SIntType
 * (intConstant instanceof SInt) === true
 * (intConstant instanceof SIntType) === true
 * @param ctor Class to be proxied.
 * @param cache If defined, proxy will return this instead of a new instance of `ctor`.
 * @param forceConstruction If true, bypasses the constant creation and returns a type.
 * @returns
 */
function monoProxy<I, O = I, T extends SType = SType<I, O>>(
  ctor: Constructable<T>,
  cache?: T,
  forceConstruction?: boolean
): SProxy<T, I, O> {
  return new Proxy(ctor, {
    apply: (target, _, args) => {
      const instance = cache ?? new target();
      if (!forceConstruction && isEmpty(args)) return instance;

      return new (SigmaConstant as Constructable)(instance, ...args);
    }
  }) as any;
}

/**
 * Creates a proxy for generic types.
 */
function genericProxy<T extends SType, R>(
  ctor: Constructable<T>,
  handler: (target: Constructable<T>, thisArgs: unknown, args: GenericProxyArgs<R>) => unknown
) {
  return new Proxy(ctor, {
    apply: handler
  }) as R;
}

export const SByte = monoProxy<number>(SByteType, descriptors.byte);

export const SBool = monoProxy<boolean>(SBoolType, descriptors.bool);

export const SShort = monoProxy<number>(SShortType, descriptors.short);

export const SInt = monoProxy<number>(SIntType, descriptors.int);

export const SLong = monoProxy<BigIntInput, bigint>(SLongType, descriptors.long);

export const SBigInt = monoProxy<BigIntInput, bigint>(SBigIntType, descriptors.bigInt);

export const SGroupElement = monoProxy<ByteInput, Uint8Array>(
  SGroupElementType,
  descriptors.groupElement
);

export const SSigmaProp = monoProxy<SigmaConstant<Uint8Array>>(
  SSigmaPropType,
  descriptors.sigmaProp
);

type SUnit = (value?: undefined) => SigmaConstant<undefined>;
export const SUnit: SUnit = monoProxy(SUnitType, undefined, true);

type SColl = {
  <T>(type: SConstructor<T>): SConstructor<ArrayLike<T>>;
  <T>(type: SConstructor<T>, elements?: ArrayLike<T>): SCollConstant<T>;
  <T>(
    type: SConstructor<T>,
    elements?: ArrayLike<T>
  ): SCollConstant<T> | SConstructor<ArrayLike<T>>;
};

export const SColl = genericProxy<SCollType, SColl>(SCollType, (target, _, args) => {
  const [type, elements] = args;
  const elementsType = type();
  if (!elements) return () => new target(elementsType);

  return new SigmaConstant(new target(elementsType), elements);
});

export function STuple(...items: SigmaConstant[]) {
  return new SigmaConstant(
    new STupleType(items.map((x) => x.type)),
    items.map((x) => x.data)
  );
}

type SPair = {
  <L, R>(left: SigmaConstant<L>, right: SigmaConstant<R>): STupleConstant<[L, R]>;
  <L, R>(left: SConstructor<L>, right: SConstructor<R>): SConstructor<[L, R]>;
  <L, R>(
    left: SigmaConstant<L> | SConstructor<L>,
    right: SigmaConstant<R> | SConstructor<R>
  ): STupleConstant<[L, R]> | SConstructor<[L, R]>;
};

export const SPair = genericProxy<STupleType, SPair>(STupleType, (target, _, args) => {
  const [left, right] = args;

  if (typeof left === "function" && typeof right === "function") {
    return () => new target([left(), right()]);
  } else if (left instanceof SigmaConstant && right instanceof SigmaConstant) {
    return new SigmaConstant(new target([left.type, right.type]), [left.data, right.data]);
  }

  throw new Error("Invalid tuple declaration.");
});
