import { describe, expect, it } from "vitest";
import {
  SBigInt,
  SBool,
  SByte,
  SGroupElement,
  SInt,
  SLong,
  SShort,
  SSigmaProp
} from "./constructors";
import { getPrimitiveType } from "./descriptors";

describe("Primitive type object fetching", () => {
  it("Should return correct types", () => {
    expect(getPrimitiveType(0x01)).to.be.instanceOf(SBool);
    expect(getPrimitiveType(0x02)).to.be.instanceOf(SByte);
    expect(getPrimitiveType(0x03)).to.be.instanceOf(SShort);
    expect(getPrimitiveType(0x04)).to.be.instanceOf(SInt);
    expect(getPrimitiveType(0x05)).to.be.instanceOf(SLong);
    expect(getPrimitiveType(0x06)).to.be.instanceOf(SBigInt);
    expect(getPrimitiveType(0x07)).to.be.instanceOf(SGroupElement);
    expect(getPrimitiveType(0x08)).to.be.instanceOf(SSigmaProp);
  });

  it("Should throw if type code is not a primitive", () => {
    expect(() => getPrimitiveType(0xff)).to.throw();
  });
});
