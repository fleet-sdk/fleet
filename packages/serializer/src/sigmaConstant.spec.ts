import { ensureBigInt } from "@fleet-sdk/common";
import { hex, randomBytes, utf8 } from "@fleet-sdk/crypto";
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
} from "./_test-vectors/constantVectors";
import { SigmaByteWriter } from "./coders";
import { dataSerializer } from "./serializers";
import { decode, parse, SConstant } from "./sigmaConstant";
import type { SGroupElementType } from "./types";
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
} from "./types/";
import { STuple } from "./types/constructors";

describe("Primitive types serialization and parsing", () => {
  it.each(boolVectors)("Should road-trip SBool($value)", (tv) => {
    const sconst = SBool(tv.value);

    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SBool");
    expect(SConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(byteVectors)("Should road-trip SByte($value)", (tv) => {
    const sconst = SByte(tv.value);

    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SByte");
    expect(SConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(shortVectors)("Should road-trip SShort($value)", (tv) => {
    const sconst = SShort(tv.value);

    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SShort");
    expect(SConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(intVectors)("Should road-trip SInt($value)", (tv) => {
    const sconst = SInt(tv.value);

    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SInt");
    expect(SConstant.from(tv.hex).data).to.be.equal(tv.value);
  });

  it.each(longVectors)("Should road-trip SLong($value)", (tv) => {
    const sconst = SLong(tv.value);

    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SLong");
    expect(SLong(String(tv.value)).toHex()).to.be.equal(tv.hex);
    expect(SConstant.from(tv.hex).data).to.be.equal(ensureBigInt(tv.value));
  });

  it.each(bigintVectors)("Should road-trip SBigInt($value)", (tv) => {
    const sconst = SBigInt(tv.value);
    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SBigInt");
    expect(SBigInt(BigInt(tv.value)).toHex()).to.be.equal(tv.hex);
    expect(SConstant.from(tv.hex).data).to.be.equal(ensureBigInt(tv.value));
  });

  it.each(groupElementVectors)(
    "Should road-trip SGroupElement($value)",
    (tv) => {
      const sconst = SGroupElement(tv.value);
      expect(sconst.toHex()).to.be.equal(tv.hex);
      expect(sconst.type.toString()).to.be.equal("SGroupElement");
      expect(SGroupElement(hex.decode(tv.value)).toHex()).to.be.equal(tv.hex);

      expect(SConstant.from(tv.hex).data).to.be.deep.equal(
        hex.decode(tv.value)
      );
    }
  );

  it.each(sigmaPropVectors)(
    "Should road-trip SSigmaProp(ProveDlog($value))",
    (tv) => {
      const sconst = SSigmaProp(SGroupElement(tv.value));

      expect(sconst.toHex()).to.be.equal(tv.hex);
      expect(sconst.type.toString()).to.be.equal("SSigmaProp");
      expect(
        SSigmaProp(SGroupElement(hex.decode(tv.value))).toHex()
      ).to.be.equal(tv.hex);

      expect(SConstant.from(tv.hex).data).to.be.deep.equal(
        hex.decode(tv.value)
      );
    }
  );

  it("Should coerce alternative input types", () => {
    const expectedBytes = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);

    expect(SGroupElement("deadbeef").data).to.be.deep.equal(expectedBytes);
    expect(SLong("1").data).to.be.deep.equal(1n);
    expect(SBigInt("123").data).to.be.deep.equal(123n);
  });
});

describe("Monomorphic types serialization and parsing", () => {
  it("Should serialize SUnit", () => {
    const sUnitHex = "62";
    expect(SUnit().toHex()).toBe(sUnitHex);
    expect(SUnit().type.toString()).toBe("SUnit");
    expect(SConstant.from(sUnitHex).data).to.be.undefined;
  });
});

describe("SColl serialization and parsing", () => {
  it.each(collVectors)("Should serialize $name", (tv) => {
    expect(tv.sconst.toHex()).to.be.equal(tv.hex);
    expect(SConstant.from(tv.hex).data).to.be.deep.equal(tv.value);
    expect(tv.sconst.type.toString()).to.be.equal(tv.name);
  });

  it("Should coerce alternative input types", () => {
    const expectedBytes = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
    expect(SColl(SByte, "deadbeef").data).to.be.deep.equal(expectedBytes);
    expect(SColl(SByte, "deadbeef").data).to.be.instanceOf(Uint8Array);
    expect(SColl(SByte, [222, 173, 190, 239]).data).to.be.deep.equal(
      expectedBytes
    );
    expect(
      SColl(SByte, Uint8Array.from([0xde, 0xad, 0xbe, 0xef])).data
    ).to.be.deep.equal(expectedBytes);

    expect(SColl(SGroupElement, ["deadbeef"]).data).to.be.deep.equal([
      expectedBytes
    ]);
    expect(SColl(SLong, ["1", 2n]).data).to.be.deep.equal([1n, 2n]);
    expect(SColl(SBigInt, ["1", 2n]).data).to.be.deep.equal([1n, 2n]);
  });

  it("Should return a Uint8Array instance when parsing SColl[SByte] type", () => {
    expect(SConstant.from("0e0a46656d616c6520233035").data).to.be.instanceof(
      Uint8Array
    );
  });
});

describe("Data only decoding", () => {
  it("Should decode only data", () => {
    expect(decode("40050002")).to.deep.equal([0, 1n]);
    expect(decode("0101")).to.deep.equal(true);
  });

  it("Should decode and encode using custom coder", () => {
    expect(decode("0e0a46656d616c6520233035", utf8.encode)).to.be.equal(
      "Female #05"
    );
    expect(decode(SInt(1).toHex(), (v: number) => v.toString())).to.be.equal(
      "1"
    );
  });

  it("Should throw with invalid bytes in 'strict' parsing mode", () => {
    expect(() => parse("deadbeef")).to.throw();
    expect(() => parse("deadbeef", "strict")).to.throw();
    expect(() => parse("", "strict")).to.throw();
    expect(() => parse(undefined as unknown as string, "strict")).to.throw();
  });

  it("Should not throw but return undefined with invalid bytes", () => {
    expect(() => decode("deadbeef")).not.to.throw();
    expect(decode("deadbeef")).to.be.undefined;
    expect(decode(undefined)).to.be.undefined;
    expect(decode("")).to.be.undefined;
    expect(decode("0102")).to.be.equal(false);
  });
});

describe("Not implemented types", () => {
  it("Should fail while trying to serialize a not implemented type", () => {
    const unimplementedType = {
      code: 0x64, // AvlTree type code
      embeddable: false,
      coerce: (val: unknown) => val
    } as unknown as SGroupElementType;

    expect(() => {
      new SConstant(unimplementedType, "").toBytes();
    }).to.throw("Serialization error: type not implemented.");

    // not implemented SSigmaProp expression
    expect(() => {
      SSigmaProp(
        new SConstant(unimplementedType, Uint8Array.from([0]))
      ).toBytes();
    }).to.throw("Serialization error: SigmaProp operation not implemented.");

    // not implemented SSigmaProp expression
    expect(() => {
      dataSerializer.serialize("", unimplementedType, new SigmaByteWriter(1));
    }).to.throw("Serialization error: '0x64' type not implemented.");
  });

  it("Should fail when trying to deserialize a not implemented SigmaProp expression", () => {
    expect(() => {
      SConstant.from("08ce");
    }).to.throw();
  });

  it("Should fail when trying to deserialize empty bytes", () => {
    expect(() => {
      SConstant.from("");
    }).to.throw("Empty constant bytes.");
    expect(() => {
      SConstant.from(Uint8Array.from([]));
    }).to.throw("Empty constant bytes.");
  });

  it("Should fail when trying to deserialize a not implemented type", () => {
    expect(() => {
      SConstant.from("deadbeef");
    }).to.throw();
  });
});

describe("Tuple serialization", () => {
  it.each(tupleTestVectors)("Should road-trip $name", (tv) => {
    expect(tv.sconst.toHex()).to.be.equal(tv.hex);
    expect(tv.sconst.type.toString()).to.be.equal(tv.name);
    expect(SConstant.from(tv.hex).data).to.be.deep.equal(tv.value);
  });

  it("Should road trip", () => {
    // quadruple
    expect(
      SConstant.from(
        STuple(
          SColl(SBool, [true, false, true]),
          SBigInt(10n),
          SBool(false),
          SShort(2)
        ).toHex()
      ).data
    ).to.be.deep.equal([[true, false, true], 10n, false, 2]);

    // generic tuple with 4+ items
    expect(
      SConstant.from(
        STuple(
          SBool(false),
          SBigInt(10n),
          SBool(false),
          SShort(2),
          SLong(1232n)
        ).toHex()
      ).data
    ).to.be.deep.equal([false, 10n, false, 2, 1232n]);
    expect(
      SConstant.from(
        STuple(
          SInt(1),
          SInt(2),
          SInt(3),
          SInt(2),
          SInt(4),
          SInt(5),
          SInt(6)
        ).toHex()
      ).data
    ).to.be.deep.equal([1, 2, 3, 2, 4, 5, 6]);
  });

  it("Should fail with tuples with items out of the 2 - 255 range", () => {
    expect(() => STuple(SInt(1)).toHex()).to.throw(
      "Invalid type: tuples must have between 2 and 255 items."
    );

    const _256Items = STuple(
      ...Array.from({ length: 256 }, (_, i) => SShort(i))
    );
    expect(() => _256Items.toHex()).to.throw(
      "Invalid type: tuples must have between 2 and 255 items."
    );
  });
});

describe("Positive fuzzy tests", () => {
  function randomInt(min: number, max: number) {
    const mn = Math.ceil(min);
    const mx = Math.floor(max);
    return Math.floor(Math.random() * (mx - mn + 1)) + mn;
  }

  function getRandomBigInt(bytes: number) {
    return BigInt(`0x${hex.encode(randomBytes(bytes))}`);
  }

  function randomBigInt(min: bigint, max: bigint) {
    // increase the chances of negative numbers generation;
    const rand =
      getRandomBigInt(1) % 2n === 0n
        ? getRandomBigInt(1)
        : getRandomBigInt(1) * -1n;

    return (rand * (max - min + 1n) + min) / 10_000n;
  }

  // https://docs.scala-lang.org/overviews/scala-book/built-in-types.html

  test("SByte fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(0, 127);
      expect(SConstant.from(SByte(value).toHex()).data).toBe(value);
    }
  });

  test("SShort fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(-32_768, 32_767);
      expect(SConstant.from(SShort(value).toHex()).data).toBe(value);
    }
  });

  test("SInt fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomInt(-2_147_483_648, 2_147_483_647);
      expect(SConstant.from(SInt(value).toHex()).data).toBe(value);
    }
  });

  test("SLong fuzzing", () => {
    for (let i = 0; i < 100; i++) {
      const value = randomBigInt(
        -9_223_372_036_854_775_808n,
        9_223_372_036_854_775_807n
      );
      expect(SConstant.from(SLong(value).toHex()).data).toBe(value);
    }
  });

  test("SBigInt fuzzing", () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomBigInt(
        -9_223_372_036_854_775_808_000n,
        9_223_372_036_854_775_807_000n
      );
      expect(SConstant.from(SBigInt(value).toHex()).data).toBe(value);
    }
  });
});
