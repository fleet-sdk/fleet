import { ZigZag } from "./zigZag";

describe("ZigZag encoding", () => {
  it("Should encode", () => {
    expect(ZigZag.encode(0n)).toBe(0n);
    expect(ZigZag.encode(-1n)).toBe(1n);
    expect(ZigZag.encode(1n)).toBe(2n);
    expect(ZigZag.encode(-2n)).toBe(3n);
    expect(ZigZag.encode(2n)).toBe(4n);
    expect(ZigZag.encode(-3n)).toBe(5n);

    expect(ZigZag.encode(0x3fffffffn)).toBe(0x7ffffffen);
    expect(ZigZag.encode(0x000000003fffffffn)).toBe(0x000000007ffffffen);
  });

  it("Should decode", () => {
    expect(ZigZag.decode(0n)).toBe(0n);
    expect(ZigZag.decode(1n)).toBe(-1n);
    expect(ZigZag.decode(2n)).toBe(1n);
    expect(ZigZag.decode(3n)).toBe(-2n);
    expect(ZigZag.decode(4n)).toBe(2n);
    expect(ZigZag.decode(5n)).toBe(-3n);

    expect(ZigZag.decode(0x7ffffffen)).toBe(0x3fffffffn);
    expect(ZigZag.decode(0x000000007ffffffen)).toBe(0x000000003fffffffn);
  });

  it("Should encode/decode radom numbers", () => {
    Array.from(Array(100))
      .map(() => BigInt(Math.ceil(Math.random() * 100000)))
      .forEach((n) => {
        expect(ZigZag.decode(ZigZag.encode(n))).toBe(n);
      });
  });
});
