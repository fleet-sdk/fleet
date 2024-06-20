import { describe, expectTypeOf, it } from "vitest";
import type { SConstant } from "../sigmaConstant";
import {
  type ByteInput,
  SBigInt,
  SBool,
  SByte,
  SColl,
  type SConstructor,
  SGroupElement,
  SInt,
  SLong,
  SPair,
  SShort,
  SSigmaProp,
  SUnit
} from "./constructors";
import type { SUnitType } from "./monomorphics";
import type {
  SBigIntType,
  SBoolType,
  SByteType,
  SGroupElementType,
  SIntType,
  SLongType,
  SShortType,
  SSigmaPropType
} from "./primitives";

describe("Constructor proxies types", () => {
  it("Should ensure correct types for monomorphics.", () => {
    expectTypeOf(SByte).parameter(0).toMatchTypeOf<number | undefined>();
    expectTypeOf(SByte()).toMatchTypeOf<SByteType>();
    expectTypeOf(SByte(1)).toMatchTypeOf<SConstant<number, SByteType>>();

    expectTypeOf(SBool).parameter(0).toMatchTypeOf<boolean | undefined>();
    expectTypeOf(SBool()).toMatchTypeOf<SBoolType>();
    expectTypeOf(SBool(true)).toMatchTypeOf<SConstant<boolean, SBoolType>>();

    expectTypeOf(SShort).parameter(0).toMatchTypeOf<number | undefined>();
    expectTypeOf(SShort()).toMatchTypeOf<SShortType>();
    expectTypeOf(SShort(1)).toMatchTypeOf<SConstant<number, SShortType>>();

    expectTypeOf(SInt).parameter(0).toMatchTypeOf<number | undefined>();
    expectTypeOf(SInt()).toMatchTypeOf<SIntType>();
    expectTypeOf(SInt(1)).toMatchTypeOf<SConstant<number, SIntType>>();

    expectTypeOf(SLong)
      .parameter(0)
      .toMatchTypeOf<string | bigint | undefined>();
    expectTypeOf(SLong()).toMatchTypeOf<SLongType>();
    expectTypeOf(SLong(1n)).toMatchTypeOf<SConstant<bigint, SLongType>>();
    expectTypeOf(SLong("1")).toMatchTypeOf<SConstant<bigint, SLongType>>();

    expectTypeOf(SBigInt)
      .parameter(0)
      .toMatchTypeOf<string | bigint | undefined>();
    expectTypeOf(SBigInt()).toMatchTypeOf<SBigIntType>();
    expectTypeOf(SBigInt(1n)).toMatchTypeOf<SConstant<bigint, SBigIntType>>();
    expectTypeOf(SBigInt("1")).toMatchTypeOf<SConstant<bigint, SBigIntType>>();

    expectTypeOf(SGroupElement)
      .parameter(0)
      .toMatchTypeOf<Uint8Array | string | undefined>();
    expectTypeOf(SGroupElement()).toMatchTypeOf<SGroupElementType>();
    expectTypeOf(SGroupElement(Uint8Array.from([1, 2, 3]))).toMatchTypeOf<
      SConstant<Uint8Array, SGroupElementType>
    >();
    expectTypeOf(SGroupElement("deadbeef")).toMatchTypeOf<
      SConstant<Uint8Array, SGroupElementType>
    >();

    expectTypeOf(SSigmaProp)
      .parameter(0)
      .toMatchTypeOf<SConstant<Uint8Array> | undefined>();
    expectTypeOf(SSigmaProp()).toMatchTypeOf<SSigmaPropType>();
    expectTypeOf(SSigmaProp(SGroupElement("deadbeef"))).toMatchTypeOf<
      SConstant<SConstant<Uint8Array>, SSigmaPropType>
    >();

    expectTypeOf(SUnit()).not.toMatchTypeOf<SUnitType>();
    expectTypeOf(SUnit()).toMatchTypeOf<SConstant<undefined, SUnitType>>();
  });

  it("Should ensure correct types for generics", () => {
    expectTypeOf(SColl(SByte)).toMatchTypeOf<
      SConstructor<number[], SByteType>
    >();
    expectTypeOf(SColl(SBool)).toMatchTypeOf<
      SConstructor<boolean[], SBoolType>
    >();
    expectTypeOf(SColl(SShort)).toMatchTypeOf<
      SConstructor<number[], SShortType>
    >();
    expectTypeOf(SColl(SInt)).toMatchTypeOf<SConstructor<number[], SIntType>>();
    expectTypeOf(SColl(SLong)).toMatchTypeOf<
      SConstructor<bigint[], SLongType>
    >();
    expectTypeOf(SColl(SBigInt)).toMatchTypeOf<
      SConstructor<bigint[], SBigIntType>
    >();
    expectTypeOf(SColl(SGroupElement)).toMatchTypeOf<
      SConstructor<Uint8Array[], SGroupElementType>
    >();
    expectTypeOf(SColl(SSigmaProp)).toMatchTypeOf<
      SConstructor<SConstant<Uint8Array>[], SSigmaPropType>
    >();

    expectTypeOf(
      SColl(SPair(SColl(SByte), SColl(SByte)), [
        [Uint8Array.from([1, 2, 3]), "deadbeef"],
        [
          [1, 2, 3],
          [4, 5, 6]
        ]
      ]).data
    ).toMatchTypeOf<[ByteInput | number[], ByteInput | number[]][]>();

    expectTypeOf(
      SColl(SPair(SColl(SBool), SColl(SByte)), [
        [[true, false], "deadbeef"],
        [
          [false, true],
          [4, 5, 6]
        ]
      ]).data
    ).toMatchTypeOf<[boolean[], ByteInput | number[]][]>();

    expectTypeOf(SColl(SBool, [true, false, true, true]).data).toMatchTypeOf<
      boolean[]
    >();

    expectTypeOf(SColl(SByte, "deadbeef").data).toMatchTypeOf<Uint8Array>();
    expectTypeOf(SColl(SByte, [1, 2]).data).toMatchTypeOf<Uint8Array>();
    expectTypeOf(
      SColl(SByte, Uint8Array.from([1])).data
    ).toMatchTypeOf<Uint8Array>();
    expectTypeOf(SColl(SInt, [1, 2, 3]).data).toMatchTypeOf<number[]>();
    expectTypeOf(
      SColl(SColl(SBool), [
        [true, false],
        [false, false]
      ]).data
    ).toMatchTypeOf<boolean[][]>();

    expectTypeOf(SPair(SInt(1), SBool(false)).data).toMatchTypeOf<
      [number, boolean]
    >();
    expectTypeOf(SPair(SBool(true), SInt(1)).data).toMatchTypeOf<
      [boolean, number]
    >();
    expectTypeOf(SPair(SInt(1), SLong("1")).data).toMatchTypeOf<
      [number, bigint]
    >();
    expectTypeOf(
      SPair(SPair(SBool(true), SInt(1)), SLong("1")).data
    ).toMatchTypeOf<[[boolean, number], bigint]>();

    // @ts-expect-error elements should be boolean[]
    SColl(SPair(SColl(SByte), SColl(SInt)), [[[1, 2, 3], 1]]);
    // @ts-expect-error elements should be boolean[]
    SColl(SBool, [true, false, true, 1]);
    // @ts-expect-error elements should be number[]
    SColl(SInt, Uint8Array.from([1]));
    // @ts-expect-error elements should be number[]
    SColl(SShort, "");
    // @ts-expect-error elements should be number[]
    SColl(SShort, {});
    // @ts-expect-error elements should be boolean[][]
    SColl(SColl(SBool), [
      [true, false],
      [false, "true"]
    ]);
  });
});
