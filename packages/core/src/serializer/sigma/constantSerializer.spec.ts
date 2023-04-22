import { bytesToHex, hexToBytes, randomBytes } from "@noble/hashes/utils";
import { bytesToString, stringToBytes } from "@scure/base";
import { describe, expect, it } from "vitest";
import {
  collBoolTestVectors,
  collByteTestVectors,
  collIntTestVectors,
  collLongTestVectors,
  collShortTestVectors,
  sBigIntTestVectors,
  sGroupElementTestVectors,
  sIntTestVectors,
  sLongTestVectors,
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

  it("Should serialize SBigInt", () => {
    for (const tv of sBigIntTestVectors) {
      expect(SConstant(SBigInt(tv.value))).toBe(tv.hex);
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

  it("Should fail for not implemented SSigmaProp expression", () => {
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
      const bytes = stringToBytes("utf8", tv.string);
      expect(SConstant(SColl(SByte, bytes))).toBe(tv.hex);
      expect(SConstant(SColl(SByte, bytesToHex(bytes)))).toBe(tv.hex);
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

  it("Should deserialize SGroupElement", () => {
    for (const tv of sGroupElementTestVectors) {
      expect(bytesToHex(SParse(tv.hex))).toBe(tv.value);
    }
  });

  it("Should deserialize SSigmaProp", () => {
    for (const tv of sSigmaPropTestVectors) {
      expect(bytesToHex(SParse(tv.hex))).toBe(tv.value);
    }
  });

  it("Should fail for not implemented SSigmaProp expression", () => {
    expect(() => {
      SParse("08ce");
    }).toThrow();
  });

  it("Should fail while trying to deserialize a not implemented type", () => {
    expect(() => {
      SParse("6122");
    }).toThrow();
  });
});

describe("SColl deserialization", () => {
  it("Should deserialize 'Coll[SBoolean]'", () => {
    for (const tv of collBoolTestVectors) {
      expect(SParse(tv.hex)).toEqual(tv.coll);
    }
  });

  it("Should deserialize 'Coll[SByte]'", () => {
    for (const tv of collByteTestVectors) {
      expect(bytesToString("utf8", SParse(tv.hex))).toBe(tv.string);
    }
  });

  it("Should deserialize 'Coll[SShort]'", () => {
    for (const tv of collShortTestVectors) {
      expect(SParse(tv.hex)).toEqual(tv.coll);
    }
  });

  it("Should deserialize 'Coll[SInt]'", () => {
    for (const tv of collIntTestVectors) {
      expect(SParse(tv.hex)).toEqual(tv.coll);
    }
  });

  it("Should deserialize SBigInt", () => {
    for (const tv of sBigIntTestVectors) {
      expect(SParse<bigint>(tv.hex).toString()).toBe(tv.value);
    }
  });

  it("Should deserialize 'Coll[SLong]'", () => {
    for (const tv of collLongTestVectors) {
      expect(SParse(tv.hex)).toEqual(tv.coll);
    }
  });

  it("Should deserialize 'Coll[Coll[Byte]]'", () => {
    const hex =
      "1a0c4065653430323366366564303963313332326234363630376538633163663737653733653030353039613334343838306232663339616332643430623433376463046572676f0763617264616e6f3339666965744263636a48774c774b4c5339573131453641766d565a6e4e6938347042487854317a3946723978314b6b79424a686761646472317179733577356d76796665783572646c75683039393273766d3074747834643439346336767979346a3933336573707a6d776e6c343277633833763837736b6c71773979387266766a6366743973616433376c61747778677170637132747a36347a08000000003b9aca00080000000002faf080080000000000013880036572672c6173736574316a7935713561307670737475747135713664386367646d72643471753579656663646e6a677a40366331346131353637363364613936303962383065386638326363613436663630363330346630613864306363363665356565323234306336333165666166640800000000000ee48c";
    const expected = [
      "65653430323366366564303963313332326234363630376538633163663737653733653030353039613334343838306232663339616332643430623433376463",
      "6572676f",
      "63617264616e6f",
      "39666965744263636a48774c774b4c5339573131453641766d565a6e4e6938347042487854317a3946723978314b6b79424a68",
      "61646472317179733577356d76796665783572646c75683039393273766d3074747834643439346336767979346a3933336573707a6d776e6c343277633833763837736b6c71773979387266766a6366743973616433376c61747778677170637132747a36347a",
      "000000003b9aca00",
      "0000000002faf080",
      "0000000000013880",
      "657267",
      "6173736574316a7935713561307670737475747135713664386367646d72643471753579656663646e6a677a",
      "36633134613135363736336461393630396238306538663832636361343666363036333034663061386430636336366535656532323430633633316566616664",
      "00000000000ee48c"
    ].map((x) => hexToBytes(x));

    expect(SParse(hex)).toStrictEqual(expected);
  });
});

describe("Serialize -> Parse roundtrip", () => {
  function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomBigInt(bytes: number) {
    return BigInt(`0x${bytesToHex(randomBytes(bytes))}`);
  }

  function randomBigInt(min: bigint, max: bigint) {
    // increase the chances of negative numbers generation;
    const rand = getRandomBigInt(1) % 2n === 0n ? getRandomBigInt(1) : getRandomBigInt(1) * -1n;

    return (rand * (max - min + 1n) + min) / 10_000n;
  }

  it("Should roundtrip SBoolean", () => {
    expect(SParse(SConstant(SBool(true)))).toBe(true);
    expect(SParse(SConstant(SBool(false)))).toBe(false);
  });

  it("Should roundtrip SByte", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(0, 127);
      expect(SParse(SConstant(SByte(value)))).toBe(value);
    }
  });

  it("Should roundtrip SShort", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(-32_768, 32_767);
      expect(SParse(SConstant(SShort(value)))).toBe(value);
    }
  });

  it("Should roundtrip SInt", () => {
    // https://docs.scala-lang.org/overviews/scala-book/built-in-types.html

    for (let i = 0; i < 100; i++) {
      const value = randomInt(-2_147_483_648, 2_147_483_647);
      expect(SParse(SConstant(SInt(value)))).toBe(value);
    }
  });

  it("Should roundtrip SLong", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomBigInt(-9_223_372_036_854_775_808n, 9_223_372_036_854_775_807n);
      expect(SParse(SConstant(SLong(value)))).toBe(value);
    }
  });

  it("Should roundtrip SBigInt", () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomBigInt(-9_223_372_036_854_775_808_000n, 9_223_372_036_854_775_807_000n);
      expect(SParse(SConstant(SBigInt(value)))).toBe(value);
    }
  });

  it("Should roundtrip SGroupElement", () => {
    for (const tv of sGroupElementTestVectors) {
      expect(SParse(SConstant(SGroupElement(hexToBytes(tv.value))))).toEqual(hexToBytes(tv.value));
    }
  });

  it("Should roundtrip SSigmaProp", () => {
    for (const tv of sSigmaPropTestVectors) {
      expect(SParse(SConstant(SSigmaProp(SGroupElement(hexToBytes(tv.value)))))).toEqual(
        hexToBytes(tv.value)
      );
    }
  });
});
