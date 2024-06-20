import { isEmpty } from "@fleet-sdk/common";
import { SConstant } from "../sigmaConstant";
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

export type SConstructor<
  T = unknown,
  S extends SType = SType | SCollType<SType>
> = (arg?: T) => S;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Any = any;

type Constructable<T = Any> = { new (...args: Any): T };
type GenericProxyArgs<R> = R extends (...args: Any) => unknown
  ? Parameters<R>
  : [];

type SProxy<T extends SType, I, O = I> = {
  (value: I): SConstant<O, T>;
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
function monoProxy<T extends SType, I, O = I>(
  ctor: Constructable<T>,
  cache?: T,
  forceConstruction?: boolean
): SProxy<T, I, O> {
  return new Proxy(ctor, {
    apply: (target, _, args) => {
      const instance = cache ?? new target();
      if (!forceConstruction && isEmpty(args)) return instance;

      return new (SConstant as Constructable)(instance, ...args);
    }
  }) as Any;
}

/**
 * Creates a proxy for generic types.
 */
function genericProxy<T extends SType, R>(
  ctor: Constructable<T>,
  handler: (
    target: Constructable<T>,
    thisArgs: unknown,
    args: GenericProxyArgs<R>
  ) => unknown
) {
  return new Proxy(ctor, {
    apply: handler
  }) as R;
}

export const SByte = monoProxy<SByteType, number>(SByteType, descriptors.byte);

export const SBool = monoProxy<SBoolType, boolean>(SBoolType, descriptors.bool);

export const SShort = monoProxy<SShortType, number>(
  SShortType,
  descriptors.short
);

export const SInt = monoProxy<SIntType, number>(SIntType, descriptors.int);

export const SLong = monoProxy<SLongType, BigIntInput, bigint>(
  SLongType,
  descriptors.long
);

export const SBigInt = monoProxy<SBigIntType, BigIntInput, bigint>(
  SBigIntType,
  descriptors.bigInt
);

export const SGroupElement = monoProxy<
  SGroupElementType,
  ByteInput,
  Uint8Array
>(SGroupElementType, descriptors.groupElement);

export const SSigmaProp = monoProxy<SSigmaPropType, SConstant<Uint8Array>>(
  SSigmaPropType,
  descriptors.sigmaProp
);

type SUnit = (value?: undefined) => SConstant<undefined, SUnitType>;
export const SUnit: SUnit = monoProxy(SUnitType, undefined, true);

type SColl = {
  <D, T extends SType>(type: SConstructor<D, T>): SConstructor<D[], T>;
  <D, T extends SByteType>(
    type: SConstructor<D, T>,
    elements: ByteInput | D[]
  ): SConstant<Uint8Array, T>;
  <D, T extends SType>(
    type: SConstructor<D, T>,
    elements: D[]
  ): SConstant<D[], T>;
};

export const SColl = genericProxy<SCollType, SColl>(
  SCollType,
  (target, _, args) => {
    const [type, elements] = args;
    const elementsType = type();
    if (!elements) return () => new target(elementsType);

    return new SConstant(new target(elementsType), elements);
  }
);

export function STuple(...items: SConstant[]) {
  return new SConstant(
    new STupleType(items.map((x) => x.type)),
    items.map((x) => x.data)
  );
}

type ByteInputOr<D, T extends SType> = T extends SByteType ? ByteInput | D : D;
type SPair = {
  <L, R>(
    left: SConstant<L>,
    right: SConstant<R>
  ): SConstant<[L, R], STupleType>;
  <LD, RD, LT extends SType, RT extends SType>(
    left: SConstructor<LD, LT>,
    right: SConstructor<RD, RT>
  ): SConstructor<[ByteInputOr<LD, LT>, ByteInputOr<RD, RT>]>;
};

export const SPair = genericProxy<STupleType, SPair>(
  STupleType,
  (target, _, args) => {
    const [left, right] = args;

    if (typeof left === "function" && typeof right === "function") {
      return () => new target([left(), right()]);
    }

    if (left instanceof SConstant && right instanceof SConstant) {
      return new SConstant(new target([left.type, right.type]), [
        left.data,
        right.data
      ]);
    }

    throw new Error("Invalid tuple declaration.");
  }
);
