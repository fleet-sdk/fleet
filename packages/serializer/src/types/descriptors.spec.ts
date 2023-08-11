import { describe, expect, it } from "vitest";
import { getPrimitiveType } from "./descriptors";
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

describe("Primitive type object fetching", () => {
  it("Should return correct types", () => {
    expect(getPrimitiveType(0x01)).to.be.instanceOf(SBoolType);
    expect(getPrimitiveType(0x02)).to.be.instanceOf(SByteType);
    expect(getPrimitiveType(0x03)).to.be.instanceOf(SShortType);
    expect(getPrimitiveType(0x04)).to.be.instanceOf(SIntType);
    expect(getPrimitiveType(0x05)).to.be.instanceOf(SLongType);
    expect(getPrimitiveType(0x06)).to.be.instanceOf(SBigIntType);
    expect(getPrimitiveType(0x07)).to.be.instanceOf(SGroupElementType);
    expect(getPrimitiveType(0x08)).to.be.instanceOf(SSigmaPropType);
  });

  it("Should throw if type code is not a primitive", () => {
    expect(() => getPrimitiveType(0xff)).to.throw();
  });
});
