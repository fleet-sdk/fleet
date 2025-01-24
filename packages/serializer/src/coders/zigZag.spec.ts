import { describe, expect, it, test } from "vitest";
import {
  zigZagDecode,
  zigZagDecodeBigInt,
  zigZagEncode,
  zigZagEncodeBigInt,
  zigZag32
} from "./zigZag";
import fc from "fast-check";

describe("ZigZag 32-bit codec", () => {
  const tv = [
    { input: 0, output: 0n },
    { input: 2147483647, output: 18446744073709551614n }, // max i32 max
    { input: -2147483648, output: 18446744073709551615n }, // min i32
    { input: 1, output: 2n },
    { input: -1, output: 1n }
  ];

  test.each(tv)("Should encode %i", (t) => {
    expect(zigZag32.encode(t.input)).to.be.equal(t.output);
  });

  test.each(tv)("Should decode %i", (t) => {
    expect(zigZag32.decode(t.output)).to.be.equal(t.input);
  });
});

describe("ZigZag encoding", () => {
  it("Should encode", () => {
    expect(zigZagEncode(0)).toBe(0);
    expect(zigZagEncode(-1)).toBe(1);
    expect(zigZagEncode(1)).toBe(2);
    expect(zigZagEncode(-2)).toBe(3);
    expect(zigZagEncode(2)).toBe(4);
    expect(zigZagEncode(-3)).toBe(5);

    expect(zigZagEncode(0x3fffffff)).toBe(0x7ffffffe);
    expect(zigZagEncode(0x000000003fffffff)).toBe(0x000000007ffffffe);
  });

  it("Should decode", () => {
    expect(zigZagDecode(0)).toBe(0);
    expect(zigZagDecode(1)).toBe(-1);
    expect(zigZagDecode(2)).toBe(1);
    expect(zigZagDecode(3)).toBe(-2);
    expect(zigZagDecode(4)).toBe(2);
    expect(zigZagDecode(5)).toBe(-3);

    expect(zigZagDecode(0x7ffffffe)).toBe(0x3fffffff);
    expect(zigZagDecode(0x000000007ffffffe)).toBe(0x000000003fffffff);
  });

  it("Should encode/decode radom numbers", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000000000 }), (n) => {
        expect(zigZagDecode(zigZagEncode(n))).to.be.equal(n);
      })
    );
  });
});

describe("BigInt ZigZag encoding", () => {
  it("Should encode", () => {
    expect(zigZagEncodeBigInt(0n)).toBe(0n);
    expect(zigZagEncodeBigInt(-1n)).toBe(1n);
    expect(zigZagEncodeBigInt(1n)).toBe(2n);
    expect(zigZagEncodeBigInt(-2n)).toBe(3n);
    expect(zigZagEncodeBigInt(2n)).toBe(4n);
    expect(zigZagEncodeBigInt(-3n)).toBe(5n);
    expect(zigZagEncodeBigInt(0x3fffffffn)).toBe(0x7ffffffen);
    expect(zigZagEncodeBigInt(0x000000003fffffffn)).toBe(0x000000007ffffffen);
  });

  it("Should decode", () => {
    expect(zigZagDecodeBigInt(0n)).toBe(0n);
    expect(zigZagDecodeBigInt(1n)).toBe(-1n);
    expect(zigZagDecodeBigInt(2n)).toBe(1n);
    expect(zigZagDecodeBigInt(3n)).toBe(-2n);
    expect(zigZagDecodeBigInt(4n)).toBe(2n);
    expect(zigZagDecodeBigInt(5n)).toBe(-3n);

    expect(zigZagDecodeBigInt(0x7ffffffen)).toBe(0x3fffffffn);
    expect(zigZagDecodeBigInt(0x000000007ffffffen)).toBe(0x000000003fffffffn);
  });

  it("Should encode/decode radom numbers", () => {
    fc.assert(
      fc.property(fc.bigInt({ min: 0n, max: BigInt(Number.MAX_SAFE_INTEGER) }), (n) => {
        expect(zigZagDecodeBigInt(zigZagEncodeBigInt(n))).to.be.equal(n);
      })
    );
  });
});
