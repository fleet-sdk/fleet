import { VLQ } from "./vlq";

describe("VLQ serialization - Variable-length quantity", () => {
  const testVectors = [
    { uint: 0, bytes: Buffer.from([0x00]) },
    { uint: 126, bytes: Buffer.from([0x7e]) },
    { uint: 127, bytes: Buffer.from([0x7f]) },
    { uint: 128, bytes: Buffer.from([0x80, 0x01]) },
    { uint: 129, bytes: Buffer.from([0x81, 0x01]) },
    { uint: 16383, bytes: Buffer.from([0xff, 0x7f]) },
    { uint: 16384, bytes: Buffer.from([0x80, 0x80, 0x01]) },
    { uint: 16385, bytes: Buffer.from([0x81, 0x80, 0x01]) },
    { uint: 2097151, bytes: Buffer.from([0xff, 0xff, 0x7f]) },
    { uint: 2097152, bytes: Buffer.from([0x80, 0x80, 0x80, 0x01]) },
    { uint: 268435455, bytes: Buffer.from([0xff, 0xff, 0xff, 0x7f]) },
    { uint: 268435456, bytes: Buffer.from([0x80, 0x80, 0x80, 0x80, 0x01]) }
  ];

  it("Should encode", () => {
    testVectors.forEach((tv) => {
      expect(VLQ.encode(tv.uint)).toEqual(tv.bytes);
    });
  });

  it("Should fail trying to encode negative values", () => {
    expect(() => {
      VLQ.encode(-1);
    }).toThrow();
  });

  it("Should decode", () => {
    testVectors.forEach((tv) => {
      expect(VLQ.decode(tv.bytes)).toEqual(tv.uint);
    });
  });

  it("Should decode empty Buffer to 0", () => {
    expect(VLQ.decode(Buffer.from([]))).toEqual(0);
  });

  it("Should encode/decode radom numbers", () => {
    Array.from(Array(100))
      .map(() => Math.ceil(Math.random() * 100000))
      .forEach((n) => {
        expect(VLQ.decode(VLQ.encode(n))).toBe(n);
      });
  });
});
