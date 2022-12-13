import { hexToBytes } from "@noble/hashes/utils";
import { stringToBytes } from "@scure/base";
import {
  collBoolTestVectors,
  collByteTestVectors,
  collIntTestVectors,
  collLongTestVectors,
  collShortTestVectors,
  sGroupElementTestVectors,
  sIntTestVectors,
  sLongTestVectors,
  sNegativeBigIntTestVectors,
  sPositiveBigIntTestVectors,
  sSigmaPropTestVectors
} from "../../tests/testVectors/constantsTestVectors";
import { SConstant, SParse } from "./constantSerializer";
import { SigmaTypeCode } from "./sigmaTypeCode";
import {
  SBigInt,
  SBool,
  SByte,
  SColl,
  SGroupElement,
  SInt,
  SLong,
  SShort,
  SSigmaProp,
  SUnit
} from "./sigmaTypes";

describe("Primary types serialization", () => {
  it("Should serialize SBoolean", () => {
    expect(SConstant(SBool(true))).toBe("0101");
    expect(SConstant(SBool(false))).toBe("0100");
  });

  it("Should serialize SByte", () => {
    expect(SConstant(SByte(1))).toBe("0201");
    expect(SConstant(SByte(2))).toBe("0202");
    expect(SConstant(SByte(76))).toBe("024c");
  });

  it("Should serialize SShort", () => {
    expect(SConstant(SShort(1))).toBe("0302");
    expect(SConstant(SShort(-2))).toBe("0303");
    expect(SConstant(SShort(17))).toBe("0322");
  });

  it("Should serialize SInt", () => {
    for (const tv of sIntTestVectors) {
      expect(SConstant(SInt(tv.value))).toBe(tv.hex);
    }
  });

  it("Should serialize SLong", () => {
    for (const tv of sLongTestVectors) {
      expect(SConstant(SLong(tv.value))).toBe(tv.hex);
    }
  });

  it("Should serialize positive SBigInt", () => {
    for (const tv of sPositiveBigIntTestVectors) {
      expect(SConstant(SBigInt(tv.value))).toBe(tv.hex);
    }
  });

  it("Should fail for negative SBigInt", () => {
    for (const tv of sNegativeBigIntTestVectors) {
      expect(() => {
        SConstant(SBigInt(tv.value));
      }).toThrow();
    }
  });

  it("Should serialize SUnit", () => {
    expect(SConstant(SUnit())).toBe("62");
  });

  it("Should serialize SGroupElement", () => {
    for (const tv of sGroupElementTestVectors) {
      expect(SConstant(SGroupElement(hexToBytes(tv.value)))).toBe(tv.hex);
    }
  });

  it("Should serialize SSigmaProp", () => {
    for (const tv of sSigmaPropTestVectors) {
      expect(SConstant(SSigmaProp(SGroupElement(hexToBytes(tv.value))))).toBe(tv.hex);
    }
  });

  it("Should for not implemented SSigmaProp expression", () => {
    expect(() => {
      SConstant(SSigmaProp({ type: SigmaTypeCode.AvlTree, value: Uint8Array.from([]) }));
    }).toThrow();
  });

  it("Should throw for not implemented type", () => {
    expect(() => {
      SConstant({ type: SigmaTypeCode.AvlTree });
    }).toThrow();

    expect(() => {
      SConstant({ type: SigmaTypeCode.Tuple2 });
    }).toThrow();
  });
});

describe("SColl serialization", () => {
  it("Should serialize 'Coll[SBoolean]'", () => {
    for (const tv of collBoolTestVectors) {
      expect(SConstant(SColl(SBool, tv.coll))).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SByte]'", () => {
    for (const tv of collByteTestVectors) {
      expect(SConstant(SColl(SByte, stringToBytes("utf8", tv.string)))).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SShort]'", () => {
    for (const tv of collShortTestVectors) {
      expect(SConstant(SColl(SShort, tv.coll))).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SInt]'", () => {
    for (const tv of collIntTestVectors) {
      expect(SConstant(SColl(SInt, tv.coll))).toBe(tv.hex);
    }
  });

  it("Should serialize 'Coll[SLong]'", () => {
    for (const tv of collLongTestVectors) {
      expect(SConstant(SColl(SLong, tv.coll))).toBe(tv.hex);
    }
  });
});
``;

describe("Deserialization", () => {
  it("Should deserialize SBoolean", () => {
    expect(SParse("0101")).toBe(true);
    expect(SParse("0100")).toBe(false);
  });

  it("Should deserialize SByte", () => {
    expect(SParse("0201")).toBe(1);
    expect(SParse("0202")).toBe(2);
    expect(SParse("024c")).toBe(76);
  });

  it("Should deserialize SInt", () => {
    for (const tv of sIntTestVectors) {
      expect(SParse(tv.hex)).toBe(tv.value);
    }
  });

  it("Should deserialize SLong", () => {
    for (const tv of sLongTestVectors) {
      expect(SParse(tv.hex)).toBe(tv.value);
    }
  });

  it("Should deserialize SShort", () => {
    expect(SParse("0302")).toBe(1);
    expect(SParse("0303")).toBe(-2);
    expect(SParse("0322")).toBe(17);
  });

  it("Should fail when trying to deserialize a not implemented type", () => {
    expect(() => {
      SParse("6122");
    }).toThrow();
  });
});
