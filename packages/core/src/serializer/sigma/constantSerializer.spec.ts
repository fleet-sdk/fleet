import { hex, randomBytes, utf8 } from "@fleet-sdk/crypto";
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
import {
  IPrimitiveType,
  ITuple,
  SBigInt,
  SBool,
  SByte,
  SColl,
  SGroupElement,
  SInt,
  SIntType,
  SLong,
  SShort,
  SSigmaProp,
  STuple,
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
      expect(SConstant(SGroupElement(hex.decode(tv.value)))).toBe(tv.hex);
    }
  });

  it("Should serialize SSigmaProp", () => {
    for (const tv of sSigmaPropTestVectors) {
      expect(SConstant(SSigmaProp(SGroupElement(hex.decode(tv.value))))).toBe(tv.hex);
    }
  });

  it("Should throw for not implemented type", () => {
    const unimplementedType: IPrimitiveType = {
      code: 0x64, // AvlTree type code
      embeddable: false,
      primitive: true,
      name: "AvlTree"
    };

    expect(() => {
      SConstant({ type: unimplementedType });
    }).toThrow();

    // not implemented SSigmaProp expression
    expect(() => {
      SConstant(SSigmaProp({ type: unimplementedType, value: Uint8Array.from([]) }));
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
      const bytes = utf8.decode(tv.string);
      expect(SConstant(SColl(SByte, bytes))).toBe(tv.hex);
      expect(SConstant(SColl(SByte, hex.encode(bytes)))).toBe(tv.hex);
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

    // const bytes1 = new Uint8Array([1, 2, 3]);
    // const bytes2 = new Uint8Array([3, 2, 1]);
    // const hex = SConstant(SColl(() => SCollType, [SColl(SByte, bytes1), SColl(SByte, bytes2)]));
    // console.log(hex);
    // , SParse(hex)
  });
});

const tupleTestVectors: { name: string; sconst: ITuple; value: unknown[]; hex: string }[] = [
  {
    name: "(SInt, SInt)",
    sconst: STuple(SInt(2), SInt(2)),
    value: [2, 2],
    hex: "580404"
  },
  {
    name: "(SInt, SLong)",
    sconst: STuple(SInt(0), SLong(1)),
    value: [0, 1n],
    hex: "40050002"
  },
  {
    name: "(SInt, SByte)",
    sconst: STuple(SInt(7), SByte(1)),
    value: [7, 1],
    hex: "40020e01"
  },
  {
    name: "(SInt, [SByte])",
    sconst: STuple(SInt(1), SColl(SByte, "0a0c")),
    value: [1, Uint8Array.from([10, 12])],
    hex: "400e02020a0c"
  },
  {
    name: "([SByte], [SByte])",
    sconst: STuple(SColl(SByte, "505250"), SColl(SByte, "596f7572206c6f616e204a616e75617279")),
    value: [hex.decode("505250"), hex.decode("596f7572206c6f616e204a616e75617279")],
    hex: "3c0e0e0350525011596f7572206c6f616e204a616e75617279"
  },
  {
    name: "([SByte], SBool, SByte)",
    sconst: STuple(SColl(SByte, [10, 12]), SBool(true), SByte(2)),
    value: [Uint8Array.from([10, 12]), true, 2],
    hex: "480e0102020a0c0102"
  },
  {
    name: "([SByte], SGroupElement)",
    sconst: STuple(
      SColl(SByte, "8743542e50d2195907ce017595f8adf1f496c796d9bcc1148ff9ec94d0bf5006"),
      SGroupElement(
        hex.decode("036ebe10da76e99b081b5893635db7518a062bd0f89b07fc056ad9b77c2abce607")
      )
    ),
    value: [
      hex.decode("8743542e50d2195907ce017595f8adf1f496c796d9bcc1148ff9ec94d0bf5006"),
      hex.decode("036ebe10da76e99b081b5893635db7518a062bd0f89b07fc056ad9b77c2abce607")
    ],
    hex: "4f0e208743542e50d2195907ce017595f8adf1f496c796d9bcc1148ff9ec94d0bf5006036ebe10da76e99b081b5893635db7518a062bd0f89b07fc056ad9b77c2abce607"
  }
];

describe("Tuple serialization", () => {
  it.each(tupleTestVectors)("Should serialize $name", (tv) => {
    expect(SConstant(tv.sconst)).to.be.equal(tv.hex);
  });

  it.each(tupleTestVectors)("Should parse $name", (tv) => {
    expect(SParse(tv.hex)).to.be.deep.equal(tv.value);
  });

  it("Should road trip", () => {
    // quadruple
    expect(
      SParse(
        SConstant(STuple(SColl(SBool, [true, false, true]), SBigInt(10n), SBool(false), SShort(2)))
      )
    ).to.be.deep.equal([[true, false, true], 10n, false, 2]);

    // generic tuple with 4+ items
    expect(
      SParse(SConstant(STuple(SBool(false), SBigInt(10n), SBool(false), SShort(2), SLong(1232n))))
    ).to.be.deep.equal([false, 10n, false, 2, 1232n]);
    expect(
      SParse(SConstant(STuple(SInt(1), SInt(2), SInt(3), SInt(2), SInt(4), SInt(5), SInt(6))))
    ).to.be.deep.equal([1, 2, 3, 2, 4, 5, 6]);
  });

  it("Should fail with tuples with items out of the 2 - 255 range", () => {
    const _1item = STuple(SInt(1));
    expect(() => SConstant(_1item)).to.throw(
      "Invalid type: tuples must have between 2 and 255 items."
    );

    const _256Items = STuple(...new Array(256).map((_, i) => ({ type: SIntType, value: i })));
    expect(() => SConstant(_256Items)).to.throw(
      "Invalid type: tuples must have between 2 and 255 items."
    );
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
      expect(hex.encode(SParse(tv.hex))).toBe(tv.value);
    }
  });

  it("Should deserialize SSigmaProp", () => {
    for (const tv of sSigmaPropTestVectors) {
      expect(hex.encode(SParse(tv.hex))).toBe(tv.value);
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
      expect(utf8.encode(SParse(tv.hex))).toBe(tv.string);
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
    const register =
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
    ].map((x) => hex.decode(x));

    expect(SParse(register)).to.be.deep.equal(expected);
  });
});

describe("Serialize -> Parse roundtrip", () => {
  function randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomBigInt(bytes: number) {
    return BigInt(`0x${hex.encode(randomBytes(bytes))}`);
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
      expect(SParse(SConstant(SGroupElement(hex.decode(tv.value))))).toEqual(hex.decode(tv.value));
    }
  });

  it("Should roundtrip SSigmaProp", () => {
    for (const tv of sSigmaPropTestVectors) {
      expect(SParse(SConstant(SSigmaProp(SGroupElement(hex.decode(tv.value)))))).toEqual(
        hex.decode(tv.value)
      );
    }
  });
});
