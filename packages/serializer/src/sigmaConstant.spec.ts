import { type Box, ensureBigInt } from "@fleet-sdk/common";
import { hex } from "@fleet-sdk/crypto";
import fc from "fast-check";
import { Value$ } from "sigmastate-js/main";
import { describe, expect, it, test, vitest } from "vitest";
import { SPair } from "../dist";
import {
  bigintVectors,
  boolVectors,
  byteVectors,
  collVectors,
  groupElementVectors,
  intVectors,
  longVectors,
  sBoxVectors,
  shortVectors,
  sigmaPropVectors,
  tupleTestVectors
} from "./_test-vectors/constantVectors";
import { SigmaByteReader, SigmaByteWriter } from "./coders";
import {
  MAX_I8,
  MAX_I16,
  MAX_I32,
  MAX_I64,
  MAX_I256,
  MIN_I8,
  MIN_I16,
  MIN_I32,
  MIN_I64,
  MIN_I256
} from "./coders/numRanges";
import { dataSerializer } from "./serializers";
import { SConstant, decode, parse, stypeof } from "./sigmaConstant";
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
  STupleType,
  SUnit
} from "./types/";
import { SBox, STuple } from "./types/constructors";

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

  it.each(groupElementVectors)("Should road-trip SGroupElement($value)", (tv) => {
    const sconst = SGroupElement(tv.value);
    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SGroupElement");
    expect(SGroupElement(hex.decode(tv.value)).toHex()).to.be.equal(tv.hex);

    expect(SConstant.from(tv.hex).data).to.be.deep.equal(hex.decode(tv.value));
  });

  it.each(sigmaPropVectors)("Should road-trip SSigmaProp(ProveDlog($value))", (tv) => {
    const sconst = SSigmaProp(SGroupElement(tv.value));

    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SSigmaProp");
    expect(SSigmaProp(SGroupElement(hex.decode(tv.value))).toHex()).to.be.equal(tv.hex);

    expect(SConstant.from(tv.hex).data).to.be.deep.equal(hex.decode(tv.value));
  });

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

describe("AVL Tree serialization and parsing", () => {
  const avlTreeHex = "643100d2e101ff01fc047c7f6f00ff80129df69a5090012f01ffca99f5bfff0c803601800100";
  const avlTreeWithValueLengthOptHex =
    "643100d2e101ff01fc047c7f6f00ff80129df69a5090012f01ffca99f5bfff0c80360180010115";
  it("Should deserialize AVL Tree", () => {
    expect(Value$.fromHex(avlTreeHex).data).to.deep.equal({
      digest: "3100d2e101ff01fc047c7f6f00ff80129df69a5090012f01ffca99f5bfff0c8036",
      insertAllowed: true,
      keyLength: 128,
      removeAllowed: false,
      updateAllowed: false,
      valueLengthOpt: undefined
    });

    expect(SConstant.from(avlTreeHex).data).to.deep.equal({
      digest: "3100d2e101ff01fc047c7f6f00ff80129df69a5090012f01ffca99f5bfff0c8036",
      insertAllowed: true,
      keyLength: 128,
      removeAllowed: false,
      updateAllowed: false,
      valueLengthOpt: undefined
    });

    expect(SConstant.from(avlTreeWithValueLengthOptHex).data).to.deep.equal({
      digest: "3100d2e101ff01fc047c7f6f00ff80129df69a5090012f01ffca99f5bfff0c8036",
      insertAllowed: true,
      keyLength: 128,
      removeAllowed: false,
      updateAllowed: false,
      valueLengthOpt: 21
    });
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
    expect(SColl(SByte, [222, 173, 190, 239]).data).to.be.deep.equal(expectedBytes);
    expect(SColl(SByte, Uint8Array.from([0xde, 0xad, 0xbe, 0xef])).data).to.be.deep.equal(
      expectedBytes
    );

    expect(SColl(SGroupElement, ["deadbeef"]).data).to.be.deep.equal([expectedBytes]);
    expect(SColl(SLong, ["1", 2n]).data).to.be.deep.equal([1n, 2n]);
    expect(SColl(SBigInt, ["1", 2n]).data).to.be.deep.equal([1n, 2n]);
  });

  it("Should return a Uint8Array instance when parsing SColl[SByte] type", () => {
    expect(SConstant.from("0e0a46656d616c6520233035").data).to.be.instanceof(Uint8Array);
  });
});

describe("stypeof", () => {
  it("Should return the type of a valid constant", () => {
    expect(stypeof(SBool(true).bytes)).to.be.instanceOf(SBool);
    expect(stypeof(SByte(1).bytes)).to.be.instanceOf(SByte);
    expect(stypeof(SShort(1).bytes)).to.be.instanceOf(SShort);
    expect(stypeof(SInt(1).bytes)).to.be.instanceOf(SInt);
    expect(stypeof(SLong(1n).bytes)).to.be.instanceOf(SLong);
    expect(stypeof(SBigInt(1n).bytes)).to.be.instanceOf(SBigInt);
    expect(stypeof(SGroupElement(hex.decode("deadbeef")).bytes)).to.be.instanceOf(SGroupElement);
    expect(stypeof(SSigmaProp(SGroupElement("deadbeef")).bytes)).to.be.instanceOf(SSigmaProp);
    expect(stypeof(SColl(SByte, [1, 2, 3]).bytes)).to.be.instanceOf(SColl);
    expect(stypeof(STuple(SByte(1), SByte(2)).bytes)).to.be.instanceOf(STupleType);
    expect(stypeof(SUnit().bytes)).to.be.instanceOf(SUnit);
  });

  it("Should return SUnit for empty bytes", () => {
    expect(stypeof(Uint8Array.from([]))).to.be.equal(undefined);
    expect(stypeof(undefined)).to.be.equal(undefined);
    expect(stypeof("deadbeef")).to.be.equal(undefined);
  });
});

describe("bytes memoization", () => {
  it("Should memoize bytes", () => {
    vitest.spyOn(SConstant.prototype, "serialize");
    const sconst = SInt(1);

    const bytes1 = sconst.bytes; // memoize
    const bytes2 = sconst.bytes; // should return from cache
    expect(bytes1).to.be.deep.equal(bytes2);
    expect(SConstant.prototype.serialize).toHaveBeenCalledTimes(1);

    const bytes3 = sconst.toBytes(); // should call serialize again and memoize
    const bytes4 = sconst.bytes; // should return from cache
    expect(bytes3).to.be.deep.equal(bytes4);
    expect(SConstant.prototype.serialize).toHaveBeenCalledTimes(2);
  });

  it("should save right bytes when reading from a SigmaByteReader", () => {
    const reader = new SigmaByteReader(
      new SigmaByteWriter(1000)
        .writeBytes(SBigInt(100n).serialize())
        .writeBytes(SBool(true).serialize())
        .toBytes()
    );

    const bigint = SConstant.from(reader);
    expect(bigint.data).to.be.equal(100n);
    expect(bigint.bytes).to.be.deep.equal(SBigInt(100n).serialize());

    const bool = SConstant.from(reader);
    expect(bool.data).to.be.equal(true);
    expect(bool.bytes).to.be.deep.equal(SBool(true).serialize());
  });
});

describe("Safe decoding", () => {
  const validVectors = [
    { hex: "40050002", data: [0, 1n], type: "(SInt, SLong)" },
    { hex: "0101", data: true, type: "SBool" }
  ];

  test.each(validVectors)("Should decode valid bytes", (tv) => {
    let c: SConstant | undefined;
    expect(() => {
      c = decode(tv.hex);
    }).not.to.throw();

    expect(c?.data).to.deep.equal(tv.data);
    expect(c?.type.toString()).to.be.equal(tv.type);
    expect(c?.toHex()).to.be.equal(tv.hex);
  });

  it("Should not throw but return undefined for invalid inputs", () => {
    expect(() => decode("deadbeef")).not.to.throw();
    expect(decode("deadbeef")).to.be.undefined;
    expect(decode(undefined)).to.be.undefined;
    expect(decode("")).to.be.undefined;
  });
});

describe("Data only decoding", () => {
  it("Should decode only data", () => {
    expect(parse("40050002")).to.deep.equal([0, 1n]);
    expect(parse("0101")).to.deep.equal(true);
    expect(parse("0101"), "safe").to.deep.equal(true);
  });

  it("Should throw with invalid bytes in 'strict' parsing mode", () => {
    expect(() => parse("deadbeef")).to.throw();
    expect(() => parse("deadbeef", "strict")).to.throw();
    expect(() => parse("", "strict")).to.throw();
    expect(() => parse(undefined as unknown as string, "strict")).to.throw();
  });

  it("Should return undefined with invalid bytes in 'safe' parsing mode", () => {
    expect(() => parse("deadbeef", "safe")).not.to.throw();
    expect(parse("deadbeef", "safe")).to.be.undefined;
    expect(parse("", "safe")).to.be.undefined;
    expect(parse(undefined as unknown as string, "safe")).to.be.undefined;
  });
});

describe("Not implemented types", () => {
  it("Should fail while trying to serialize a not implemented type", () => {
    const unimplementedType = {
      code: 0x64, // AvlTree type code
      embeddable: false,
      coerce: (val: unknown) => val
    } as unknown as SGroupElementType;

    expect(() => new SConstant(unimplementedType, "").bytes).to.throw(
      "Serialization error: type not implemented."
    );

    // not implemented SSigmaProp expression
    expect(() => SSigmaProp(new SConstant(unimplementedType, Uint8Array.from([0]))).bytes).to.throw(
      "Serialization error: SigmaProp operation not implemented."
    );

    // not implemented SSigmaProp expression
    expect(() => {
      dataSerializer.serialize("", unimplementedType, new SigmaByteWriter(1));
    }).to.throw("Serialization error: '0x64' type not implemented.");
  });

  it("Should fail when trying to deserialize a not implemented SigmaProp expression", () => {
    expect(() => SConstant.from("08ce")).to.throw();
  });

  it("Should fail when trying to deserialize empty bytes", () => {
    expect(() => SConstant.from("")).to.throw("Empty constant bytes.");
    expect(() => SConstant.from(Uint8Array.from([]))).to.throw("Empty constant bytes.");
  });

  it("Should fail when trying to deserialize a not implemented type", () => {
    expect(() => SConstant.from("deadbeef")).to.throw();
  });
});

describe("SBox serialization", () => {
  test.each(sBoxVectors)("SBox serialization bytes", (tv) => {
    const sconst = SBox(tv.value);
    expect(sconst.toHex()).to.be.equal(tv.hex);
    expect(sconst.type.toString()).to.be.equal("SBox");
  });

  test.each(sBoxVectors)("SBox roundtrip", (tv) => {
    expect(SBox(SConstant.from<Box>(tv.hex).data).toHex()).to.be.equal(tv.hex);
  });

  it("Should not embed SBox", () => {
    // @ts-expect-error SBox is not compatible with SColl
    expect(() => SColl(SBox, [sBoxVectors[0].value])).toThrow();
    // @ts-expect-error SBox is not compatible with SPair
    expect(() => SPair(SBox(sBoxVectors[0].value), SBox(sBoxVectors[1]))).toThrow();
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
        STuple(SColl(SBool, [true, false, true]), SBigInt(10n), SBool(false), SShort(2)).toHex()
      ).data
    ).to.be.deep.equal([[true, false, true], 10n, false, 2]);

    // generic tuple with 4+ items
    expect(
      SConstant.from(
        STuple(SBool(false), SBigInt(10n), SBool(false), SShort(2), SLong(1232n)).toHex()
      ).data
    ).to.be.deep.equal([false, 10n, false, 2, 1232n]);
    expect(
      SConstant.from(STuple(SInt(1), SInt(2), SInt(3), SInt(2), SInt(4), SInt(5), SInt(6)).toHex())
        .data
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
  test("SByte fuzzing", () => {
    fc.assert(
      fc.property(fc.integer({ min: MIN_I8, max: MAX_I8 }), (val) => {
        const serialized = SByte(val).toHex();
        expect(serialized).to.be.equal(Value$.ofByte(val).toHex()); // ensure compatibility with sigmastate-js
        expect(SConstant.from(serialized).data).to.be.equal(val);
      })
    );
  });

  test("SShort fuzzing", () => {
    fc.assert(
      fc.property(fc.integer({ min: MIN_I16, max: MAX_I16 }), (val) => {
        const serialized = SShort(val).toHex();
        expect(serialized).to.be.equal(Value$.ofShort(val).toHex()); // ensure compatibility with sigmastate-js
        expect(SConstant.from(serialized).data).to.be.equal(val);
      })
    );
  });

  test("SInt fuzzing", () => {
    fc.assert(
      fc.property(fc.integer({ min: MIN_I32, max: MAX_I32 }), (val) => {
        const serialized = SInt(val).toHex();
        expect(serialized).to.be.equal(Value$.ofInt(val).toHex()); // ensure compatibility with sigmastate-js
        expect(SConstant.from(serialized).data).to.be.equal(val);
      })
    );
  });

  test("SLong fuzzing", () => {
    fc.assert(
      fc.property(fc.bigInt({ min: MIN_I64, max: MAX_I64 }), (val) => {
        const serialized = SLong(val).toHex();
        expect(serialized).to.be.equal(Value$.ofLong(val).toHex()); // ensure compatibility with sigmastate-js
        expect(SConstant.from(serialized).data).to.be.equal(val);
      })
    );
  });

  test("SBigInt fuzzing", () => {
    fc.assert(
      fc.property(fc.bigInt({ min: MIN_I256, max: MAX_I256 }), (val) => {
        const serialized = SBigInt(val).toHex();
        expect(serialized).to.be.equal(Value$.ofBigInt(val).toHex()); // ensure compatibility with sigmastate-js
        expect(SConstant.from(serialized).data).to.be.equal(val);
      })
    );
  });
});
