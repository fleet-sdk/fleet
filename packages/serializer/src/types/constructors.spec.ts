import { describe, expect, it } from "vitest";
import {
  SBigInt,
  SBool,
  SByte,
  SColl,
  SGroupElement,
  SInt,
  SLong,
  SPair,
  SShort,
  SSigmaProp,
  SUnit
} from "./constructors";
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

describe("Constructor proxies", () => {
  it("Should correspond to proxied type", () => {
    expect(new SByteType()).to.be.instanceof(SByte);
    expect(new SBoolType()).to.be.instanceof(SBool);
    expect(new SShortType()).to.be.instanceof(SShort);
    expect(new SIntType()).to.be.instanceof(SInt);
    expect(new SLongType()).to.be.instanceof(SLong);
    expect(new SBigIntType()).to.be.instanceof(SBigInt);
    expect(new SGroupElementType()).to.be.instanceof(SGroupElement);
    expect(new SSigmaPropType()).to.be.instanceof(SSigmaProp);
    expect(new SUnitType()).to.be.instanceof(SUnit);
    expect(new SCollType(new SByteType())).to.be.instanceof(SColl);
    expect(new STupleType([SBool(), SInt()])).to.be.instanceof(SPair);
  });
});

describe("SPair constructor", () => {
  it("Should thoro if params are of different types", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => SPair(SBool(true) as any, SBool() as any)).to.throw("Invalid tuple declaration.");
  });
});
