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
    expect(SBool(tv.value).toHex()).to.be.equal(tv.hex);
    expect(SigmaConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(byteVectors)("Should road-trip SByte($value)", (tv) => {
    expect(SByte(tv.value).toHex()).to.be.equal(tv.hex);
    expect(SigmaConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(shortVectors)("Should road-trip SShort($value)", (tv) => {
    expect(SShort(tv.value).toHex()).to.be.equal(tv.hex);
    expect(SigmaConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(intVectors)("Should road-trip SInt($value)", (tv) => {
    expect(SInt(tv.value).toHex()).to.be.equal(tv.hex);
    expect(SigmaConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(longVectors)("Should road-trip SLong($value)", (tv) => {
    expect(SLong(tv.value).toHex()).to.be.equal(tv.hex);
    expect(SLong(String(tv.value)).toHex()).to.be.equal(tv.hex);

    expect(SigmaConstant.from(tv.hex).data).to.be.equal(ensureBigInt(tv.value));
  });

  it.each(groupElementVectors)("Should road-trip SGroupElement($value)", (tv) => {
    expect(SGroupElement(tv.value).toHex()).to.be.equal(tv.hex);
    expect(SGroupElement(hex.decode(tv.value)).toHex()).to.be.equal(tv.hex);

    expect(SigmaConstant.from(tv.hex).data).to.be.deep.equal(hex.decode(tv.value));
  });

  it.each(sigmaPropVectors)("Should road-trip SSigmaProp(ProveDlog($value))", (tv) => {
    expect(SSigmaProp(SGroupElement(tv.value)).toHex()).to.be.equal(tv.hex);
    expect(SSigmaProp(SGroupElement(hex.decode(tv.value))).toHex()).to.be.equal(tv.hex);

    expect(SigmaConstant.from(tv.hex).data).to.be.deep.equal(hex.decode(tv.value));
  });

  it.each(bigintVectors)("Should road-trip SBigInt($value)", (tv) => {
    expect(SBigInt(tv.value).toHex()).to.be.equal(tv.hex);
    expect(SBigInt(BigInt(tv.value)).toHex()).to.be.equal(tv.hex);

    expect(SigmaConstant.from(tv.hex).data).to.be.equal(BigInt(tv.value));
  });
});

describe("Monomorphic types serialization and parsing", () => {
  it("Should serialize SUnit", () => {
    const sUnitHex = "62";
    expect(SUnit().toHex()).toBe(sUnitHex);
    expect(SigmaConstant.from(sUnitHex).data).to.be.undefined;
  });
});

describe("SColl serialization and parsing", () => {
  it.each(collVectors)("Should serialize $name", (tv) => {
    expect(tv.sconst.toHex()).to.be.equal(tv.hex);
    expect(SigmaConstant.from(tv.hex).data).to.be.deep.equal(tv.value);
  });
});

describe("Not implemented types", () => {
  it("Should fail while trying to serialize a not implemented type", () => {
    const unimplementedType: SType = {
      code: 0x64, // AvlTree type code
      embeddable: false
    };

    expect(() => {
      new SigmaConstant(unimplementedType, "").toBytes();
    }).toThrow();

    // not implemented SSigmaProp expression
    expect(() => {
      SSigmaProp(new SigmaConstant(unimplementedType, Uint8Array.from([0]))).toBytes();
    }).toThrow();
  });

  it("Should fail while trying to deserialize a not implemented SigmaProp expression", () => {
    expect(() => {
      SigmaConstant.from("08ce");
    }).toThrow();
  });

  it("Should fail while trying to deserialize a not implemented type", () => {
    expect(() => {
      SigmaConstant.from("deadbeef");
    }).toThrow();
  });
});

describe("Tuple serialization", () => {
  it.each(tupleTestVectors)("Should road-trip $name", (tv) => {
    expect(tv.sconst.toHex()).to.be.equal(tv.hex);
    expect(SigmaConstant.from(tv.hex).data).to.be.deep.equal(tv.value);
  });

  it("Should road trip", () => {
    // quadruple
    expect(
      SigmaConstant.from(
        STuple(SColl(SBool, [true, false, true]), SBigInt(10n), SBool(false), SShort(2)).toHex()
      ).data
    ).to.be.deep.equal([[true, false, true], 10n, false, 2]);

    // generic tuple with 4+ items
    expect(
      SigmaConstant.from(
        STuple(SBool(false), SBigInt(10n), SBool(false), SShort(2), SLong(1232n)).toHex()
      ).data
    ).to.be.deep.equal([false, 10n, false, 2, 1232n]);
    expect(
      SigmaConstant.from(
        STuple(SInt(1), SInt(2), SInt(3), SInt(2), SInt(4), SInt(5), SInt(6)).toHex()
      ).data
    ).to.be.deep.equal([1, 2, 3, 2, 4, 5, 6]);
  });

  it("Should fail with tuples with items out of the 2 - 255 range", () => {
    expect(() => STuple(SInt(1)).toHex()).to.throw(
      "Invalid type: tuples must have between 2 and 255 items."
    );

    const _256Items = STuple(...Array.from({ length: 256 }, (_, i) => SShort(i)));
    expect(() => _256Items.toHex()).to.throw(
      "Invalid type: tuples must have between 2 and 255 items."
    );
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

  // https://docs.scala-lang.org/overviews/scala-book/built-in-types.html

  test("SByte fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(0, 127);
      expect(SigmaConstant.from(SByte(value).toHex()).data).toBe(value);
    }
  });

  test("SShort fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(-32_768, 32_767);
      expect(SigmaConstant.from(SShort(value).toHex()).data).toBe(value);
    }
  });

  test("SInt fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(-2_147_483_648, 2_147_483_647);
      expect(SigmaConstant.from(SInt(value).toHex()).data).toBe(value);
    }
  });

  test("SLong fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomBigInt(-9_223_372_036_854_775_808n, 9_223_372_036_854_775_807n);
      expect(SigmaConstant.from(SLong(value).toHex()).data).toBe(value);
    }
  });

  test("SBigInt fuzzing", () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomBigInt(-9_223_372_036_854_775_808_000n, 9_223_372_036_854_775_807_000n);
      expect(SigmaConstant.from(SBigInt(value).toHex()).data).toBe(value);
    }
  });
});
