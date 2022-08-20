import { VLQ } from "./vlq";

describe("VLQ serialization - Variable-length quantity", () => {
  const wikipediaExamples = [
    { int: 0, bytes: "00" },
    { int: 127, bytes: "7f" },
    { int: 128, bytes: "8100" },
    { int: 8192, bytes: "c000" },
    { int: 16383, bytes: "ff7f" },
    { int: 16384, bytes: "818000" },
    { int: 2097151, bytes: "ffff7f" },
    { int: 2097152, bytes: "81808000" },
    { int: 134217728, bytes: "c0808000" },
    { int: 268435455, bytes: "ffffff7f" }
  ];

  it("Should encode", () => {
    wikipediaExamples.forEach((tv) => {
      expect(VLQ.encode(tv.int).toString("hex")).toEqual(tv.bytes);
    });
  });

  it("Should fail trying to encode values over the max value", () => {
    expect(() => {
      VLQ.encode(VLQ.maxIntegerValue + 1);
    }).toThrow();
  });

  it("Should fail trying to encode negative values", () => {
    expect(() => {
      VLQ.encode(-1);
    }).toThrow();
  });

  it("Should decode", () => {
    wikipediaExamples.forEach((tv) => {
      expect(VLQ.decode(Buffer.from(tv.bytes, "hex"))).toEqual(tv.int);
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
