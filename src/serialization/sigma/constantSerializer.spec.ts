import {
  collBoolTestVectors,
  collByteTestVectors,
  collIntTestVectors,
  collLongTestVectors,
  collShortTestVectors,
  sIntTestVectors,
  sLongTestVectors
} from "../../tests/testVectors/constants.tv";
import { SConstant } from "./constantSerializer";
import { SigmaTypeCode } from "./sigmaTypeCode";
import { SBool, SByte, SColl, SInt, SLong, SShort } from "./sigmaTypes";

describe("Primary types serialization", () => {
  it("Should serialize SBoolean", () => {
    expect(SConstant(SBool(true)).toString("hex")).toBe("0101");
    expect(SConstant(SBool(false)).toString("hex")).toBe("0100");
  });

  it("Should serialize SByte", () => {
    expect(SConstant(SByte(1)).toString("hex")).toBe("0201");
    expect(SConstant(SByte(2)).toString("hex")).toBe("0202");
    expect(SConstant(SByte(76)).toString("hex")).toBe("024c");
  });

  it("Should serialize SShort", () => {
    expect(SConstant(SShort(1)).toString("hex")).toBe("0302");
    expect(SConstant(SShort(-2)).toString("hex")).toBe("0303");
    expect(SConstant(SShort(17)).toString("hex")).toBe("0322");
  });

  it("Should serialize SInt", () => {
    for (const tv of sIntTestVectors) {
      expect(SConstant(SInt(tv.value)).toString("hex")).toBe(tv.hex);
    }
  });

  it("Should serialize SLong", () => {
    for (const tv of sLongTestVectors) {
      expect(SConstant(SLong(tv.value)).toString("hex")).toBe(tv.hex);
    }
  });

  it("Should throw if try to serialize not implemented type", () => {
    expect(() => {
      SConstant({ type: SigmaTypeCode.AvlTree });
    }).toThrow();
  });
});

describe("SColl serialization", () => {
  it("Should serialize 'Coll[SBoolean]'", () => {
    for (const tv of collBoolTestVectors) {
      expect(SConstant(SColl(SBool, tv.coll)).toString("hex")).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SByte]'", () => {
    for (const tv of collByteTestVectors) {
      expect(SConstant(SColl(SByte, Buffer.from(tv.string, "utf-8"))).toString("hex")).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SShort]'", () => {
    for (const tv of collShortTestVectors) {
      expect(SConstant(SColl(SShort, tv.coll)).toString("hex")).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SInt]'", () => {
    for (const tv of collIntTestVectors) {
      expect(SConstant(SColl(SInt, tv.coll)).toString("hex")).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SLong]'", () => {
    for (const tv of collLongTestVectors) {
      expect(SConstant(SColl(SLong, tv.coll)).toString("hex")).toBe(tv.hex);
    }
  });
});
