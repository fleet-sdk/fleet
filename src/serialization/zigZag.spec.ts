import { ZigZag } from "./zigZag";

describe("ZigZag encoding", () => {
  it("Should encode", () => {
    expect(ZigZag.encode(0)).toBe(0);
    expect(ZigZag.encode(-1)).toBe(1);
    expect(ZigZag.encode(1)).toBe(2);
    expect(ZigZag.encode(-2)).toBe(3);
    expect(ZigZag.encode(2)).toBe(4);
    expect(ZigZag.encode(-3)).toBe(5);

    expect(ZigZag.encode(0x3fffffff)).toBe(0x7ffffffe);
    expect(ZigZag.encode(0x000000003fffffff)).toBe(0x000000007ffffffe);
  });

  it("Should decode", () => {
    expect(ZigZag.decode(0)).toBe(0);
    expect(ZigZag.decode(1)).toBe(-1);
    expect(ZigZag.decode(2)).toBe(1);
    expect(ZigZag.decode(3)).toBe(-2);
    expect(ZigZag.decode(4)).toBe(2);
    expect(ZigZag.decode(5)).toBe(-3);

    expect(ZigZag.decode(0x7ffffffe)).toBe(0x3fffffff);
    expect(ZigZag.decode(0x000000007ffffffe)).toBe(0x000000003fffffff);
  });

  it("Should encode/decode radom numbers", () => {
    Array.from(Array(1000))
      .map(() => Math.ceil(Math.random() * 100000))
      .forEach((n) => {
        expect(ZigZag.decode(ZigZag.encode(n))).toBe(n);
      });
  });
});
