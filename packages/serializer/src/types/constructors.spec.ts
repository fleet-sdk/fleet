import { describe, expect, it } from "vitest";
import { SConstant } from "../sigmaConstant";
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
    expect(new SByteType()).to.be.instanceof(SByte).and.to.be.instanceOf(SByteType);
    expect(new SBoolType()).to.be.instanceof(SBool).and.to.be.instanceOf(SBoolType);
    expect(new SShortType()).to.be.instanceof(SShort).and.to.be.instanceOf(SShortType);
    expect(new SIntType()).to.be.instanceof(SInt).and.to.be.instanceOf(SIntType);
    expect(new SLongType()).to.be.instanceof(SLong).and.to.be.instanceOf(SLongType);
    expect(new SBigIntType()).to.be.instanceof(SBigInt).and.to.be.instanceOf(SBigIntType);
    expect(new SGroupElementType())
      .to.be.instanceof(SGroupElement)
      .and.to.be.instanceOf(SGroupElementType);
    expect(new SSigmaPropType()).to.be.instanceof(SSigmaProp).and.to.be.instanceOf(SSigmaPropType);
    expect(new SUnitType()).to.be.instanceof(SUnit).and.to.be.instanceOf(SUnitType);
    expect(new SCollType(new SByteType())).to.be.instanceof(SColl).and.to.be.instanceOf(SCollType);
    expect(new STupleType([SBool(), SInt()]))
      .to.be.instanceof(SPair)
      .and.to.be.instanceOf(STupleType);
  });
});

describe("SPair constructor", () => {
  it("Should throw if params contains different types", () => {
    // @ts-expect-error invalid pair construction
    expect(() => SPair(SBool(true), SBool())).to.throw("Invalid tuple declaration.");
    // @ts-expect-error invalid pair construction
    expect(() => SPair(SBool(), SBool(true))).to.throw("Invalid tuple declaration.");
  });
});

describe("SColl constructor", () => {
  it("Should construct an empty SConstant from an empty string", () => {
    const empty = SColl(SByte, "");
    expect(empty).to.be.instanceOf(SConstant);
    expect(empty.data).to.be.deep.equal(new Uint8Array());
    expect(empty.toHex()).to.be.equal("0e00");
  });

  it("Should return a type constructor when elements are omitted", () => {
    const typeCtor = SColl(SByte);
    expect(typeof typeCtor).to.be.equal("function");
    expect(typeCtor()).to.be.instanceOf(SCollType);
    expect(typeCtor().toString()).to.be.equal("SColl[SByte]");
  });
});
