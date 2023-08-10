import { ensureBigInt } from "@fleet-sdk/common";
import { hex, randomBytes } from "@fleet-sdk/crypto";
import { describe, expect, it, test } from "vitest";
import {
  bigintVectors,
  boolVectors,
  byteVectors,
  collVectors,
  groupElementVectors,
  intVectors,
  longVectors,
  shortVectors,
  sigmaPropVectors,
  tupleTestVectors
} from "../_test-vectors/constantVectors";
import { SConstant, SParse } from "./constantSerializer";
import {
  SBigInt,
  SBool,
  SByte,
  SColl,
  SGroupElement,
  SigmaConstant,
  SInt,
  SLong,
  SShort,
  SSigmaProp,
  STuple,
  SType,
  SUnit
} from "./sigmaTypes";

describe("Primitive types serialization and parsing", () => {
  it.each(boolVectors)("Should road-trip SBool($value)", (tv) => {
    expect(SConstant(SBool(tv.value))).to.be.equal(tv.hex);
    expect(SParse(tv.hex)).to.be.equal(tv.value);
  });

  it.each(byteVectors)("Should road-trip SByte($value)", (tv) => {
    expect(SConstant(SByte(tv.value))).to.be.equal(tv.hex);
    expect(SParse(tv.hex)).to.be.equal(tv.value);
  });

  it.each(shortVectors)("Should road-trip SShort($value)", (tv) => {
    expect(SConstant(SShort(tv.value))).to.be.equal(tv.hex);
    expect(SParse(tv.hex)).to.be.equal(tv.value);
  });

  it.each(intVectors)("Should road-trip SInt($value)", (tv) => {
    expect(SConstant(SInt(tv.value))).to.be.equal(tv.hex);
    expect(SParse(tv.hex)).to.be.equal(tv.value);
  });

  it.each(longVectors)("Should road-trip SLong($value)", (tv) => {
    expect(SConstant(SLong(tv.value))).to.be.equal(tv.hex);
    expect(SConstant(SLong(String(tv.value)))).to.be.equal(tv.hex);

    expect(SParse(tv.hex)).to.be.equal(ensureBigInt(tv.value));
  });

  it.each(groupElementVectors)("Should road-trip SGroupElement($value)", (tv) => {
    expect(SConstant(SGroupElement(tv.value))).to.be.equal(tv.hex);
    expect(SConstant(SGroupElement(hex.decode(tv.value)))).to.be.equal(tv.hex);

    expect(SParse(tv.hex)).to.be.deep.equal(hex.decode(tv.value));
  });

  it.each(sigmaPropVectors)("Should road-trip SSigmaProp(ProveDlog($value))", (tv) => {
    expect(SConstant(SSigmaProp(SGroupElement(tv.value)))).to.be.equal(tv.hex);
    expect(SConstant(SSigmaProp(SGroupElement(hex.decode(tv.value))))).to.be.equal(tv.hex);

    expect(SParse(tv.hex)).to.be.deep.equal(hex.decode(tv.value));
  });

  it.each(bigintVectors)("Should road-trip SBigInt($value)", (tv) => {
    expect(SConstant(SBigInt(tv.value))).to.be.equal(tv.hex);
    expect(SConstant(SBigInt(BigInt(tv.value)))).to.be.equal(tv.hex);

    expect(SParse(tv.hex)).to.be.equal(BigInt(tv.value));
  });
});

describe("Monomorphic types serialization and parsing", () => {
  it("Should serialize SUnit", () => {
    const sUnitHex = "62";
    expect(SConstant(SUnit())).toBe(sUnitHex);
    expect(SParse(sUnitHex)).to.be.undefined;
  });
});

describe("SColl serialization and parsing", () => {
  it.each(collVectors)("Should serialize $name", (tv) => {
    expect(SConstant(tv.sconst)).to.be.equal(tv.hex);
    expect(SParse(tv.hex)).to.be.deep.equal(tv.value);
  });
});

describe("Not implemented types", () => {
  it("Should fail while trying to serialize a not implemented type", () => {
    const unimplementedType: SType = {
      code: 0x64, // AvlTree type code
      embeddable: false
    };

    expect(() => {
      SConstant(new SigmaConstant(unimplementedType, ""));
    }).toThrow();

    // not implemented SSigmaProp expression
    expect(() => {
      SConstant(SSigmaProp(new SigmaConstant(unimplementedType, Uint8Array.from([0]))));
    }).toThrow();
  });

  it("Should fail while trying to deserialize a not implemented SigmaProp expression", () => {
    expect(() => {
      SParse("08ce");
    }).toThrow();
  });

  it("Should fail while trying to deserialize a not implemented type", () => {
    expect(() => {
      SParse("deadbeef");
    }).toThrow();
  });
});

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

    const _256Items = STuple(...Array.from({ length: 256 }, (_, i) => SShort(i)));
    expect(() => SConstant(_256Items)).to.throw(
      "Invalid type: tuples must have between 2 and 255 items."
    );
  });
});

describe("SColl deserialization", () => {
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

describe("Positive fuzzy tests", () => {
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

  test("S SByte fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(0, 127);
      expect(SParse(SConstant(SByte(value)))).toBe(value);
    }
  });

  test("SShort fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(-32_768, 32_767);
      expect(SParse(SConstant(SShort(value)))).toBe(value);
    }
  });

  test("SInt fuzzing", () => {
    // https://docs.scala-lang.org/overviews/scala-book/built-in-types.html

    for (let i = 0; i < 100; i++) {
      const value = randomInt(-2_147_483_648, 2_147_483_647);
      expect(SParse(SConstant(SInt(value)))).toBe(value);
    }
  });

  test("SLong fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomBigInt(-9_223_372_036_854_775_808n, 9_223_372_036_854_775_807n);
      expect(SParse(SConstant(SLong(value)))).toBe(value);
    }
  });

  test("SBigInt fuzzing", () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomBigInt(-9_223_372_036_854_775_808_000n, 9_223_372_036_854_775_807_000n);
      expect(SParse(SConstant(SBigInt(value)))).toBe(value);
    }
  });
});
