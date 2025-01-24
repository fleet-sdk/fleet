import { describe, expect, it, test } from "vitest";
import { zigZag32, zigZag64 } from "./zigZag";
import fc from "fast-check";
import { MAX_I32, MAX_I64, MIN_I32, MIN_I64 } from "./numRanges";

describe("ZigZag 32-bit codec", () => {
  const tv = [
    { input: 0, output: 0n },
    { input: 1, output: 2n },
    { input: -1, output: 1n },
    { input: 0x3fffffff, output: 0x7ffffffen },
    { input: 0x000000003fffffff, output: 0x000000007ffffffen },
    { input: MAX_I32, output: 18446744073709551614n },
    { input: MIN_I32, output: 18446744073709551615n }
  ];

  test.each(tv)("Should encode %i", (t) => {
    expect(zigZag32.encode(t.input)).to.be.equal(t.output);
  });

  test.each(tv)("Should decode %i", (t) => {
    expect(zigZag32.decode(t.output)).to.be.equal(t.input);
  });

  test("Round-trip fuzzing", () => {
    fc.assert(
      fc.property(fc.integer({ min: MIN_I32, max: MAX_I32 }), (n) => {
        expect(zigZag32.decode(zigZag32.encode(n))).to.be.equal(n);
      })
    );
  });
});

describe("ZigZag 64-bit codec", () => {
  const tv = [
    { input: 0n, output: 0n },
    { input: 1n, output: 2n },
    { input: -1n, output: 1n },
    { input: 0x3fffffffn, output: 0x7ffffffen },
    { input: 0x000000003fffffffn, output: 0x000000007ffffffen },
    { input: MAX_I64, output: 18446744073709551614n },
    { input: MIN_I64, output: 18446744073709551615n }
  ];

  test.each(tv)("Should encode %i", (t) => {
    expect(zigZag64.encode(t.input)).to.be.equal(t.output);
  });

  test.each(tv)("Should decode %i", (t) => {
    expect(zigZag64.decode(t.output)).to.be.equal(t.input);
  });

  test("Round-trip fuzzing", () => {
    fc.assert(
      fc.property(fc.bigInt({ min: MIN_I64, max: MAX_I64 }), (n) => {
        expect(zigZag64.decode(zigZag64.encode(n))).to.be.equal(n);
      })
    );
  });
});
