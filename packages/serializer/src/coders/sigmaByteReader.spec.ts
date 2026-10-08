import { describe, expect, it } from "vitest";
import { SigmaByteReader } from "./sigmaByteReader";

const u8a = (bytes: number[]) => new Uint8Array(bytes);

describe("Sigma byte reader", () => {
  it("should read bytes and move the cursor", () => {
    const bytes = u8a([0x01, 0x02, 0x03, 0x04]);
    const reader = new SigmaByteReader(bytes);

    expect(reader.readByte()).toBe(0x01);
    expect(reader.readBytes(2)).toEqual(u8a([0x02, 0x03]));
    expect(reader.readByte()).toBe(0x04);
  });

  it("should peek bytes ahead but not move the cursor", () => {
    const bytes = u8a([0x01, 0x02, 0x03, 0x04]);
    const reader = new SigmaByteReader(bytes);

    expect(reader.peek(1)).toEqual(u8a([0x01]));
    expect(reader.peek(2)).toEqual(u8a([0x01, 0x02]));
    expect(reader.peek(10)).toEqual(u8a([0x01, 0x02, 0x03, 0x04])); // read all bytes if length is greater than available bytes

    expect(reader.readByte()).toBe(0x01); // move cursor
    expect(reader.peek(1)).toEqual(u8a([0x02]));
  });

  it("should peek bytes ahead but not move the cursor with offset", () => {
    const bytes = u8a([0x01, 0x02, 0x03, 0x04]);
    const reader = new SigmaByteReader(bytes);

    expect(reader.peek(1, 1)).toEqual(u8a([0x02]));
    expect(reader.peek(2, 2)).toEqual(u8a([0x03, 0x04]));
    expect(reader.peek(10, 2)).toEqual(u8a([0x03, 0x04])); // read all bytes if length is greater than available bytes

    expect(reader.readByte()).toBe(0x01); // move cursor
    expect(reader.peek(1, 2)).toEqual(u8a([0x04]));
  });

  it("should match bytes ahead", () => {
    const bytes = u8a([0x01, 0x02, 0x03, 0x04]);
    const reader = new SigmaByteReader(bytes);

    expect(reader.match(u8a([0x01, 0x02]))).toBe(true);
    expect(reader.match(u8a([0x02, 0x03]))).toBe(false);

    expect(reader.match(u8a([0x01, 0x02, 0x03, 0x04]))).toBe(true);
    expect(reader.match(u8a([0x01, 0x02, 0x03, 0x04, 0x05]))).toBe(false);

    expect(reader.readByte()).toBe(0x01); // move cursor
    expect(reader.match(u8a([0x02, 0x03]))).toBe(true);
  });

  it("should match bytes ahead with offset", () => {
    const bytes = u8a([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]);
    const reader = new SigmaByteReader(bytes);

    expect(reader.match(u8a([0x03, 0x04]), 2)).toBe(true);
    expect(reader.match(u8a([0x01, 0x02]), 1)).toBe(false);

    expect(reader.match(u8a([0x04, 0x05, 0x06]), 3)).toBe(true);
    expect(reader.match(u8a([0x04, 0x05, 0x06, 0x07]), 3)).toBe(false);
  });

  it("should throw when reading a byte past the end of the input", () => {
    const reader = new SigmaByteReader(u8a([0x01]));

    expect(reader.readByte()).toBe(0x01);
    expect(() => reader.readByte()).toThrow(RangeError);
    expect(() => new SigmaByteReader(u8a([])).readByte()).toThrow(RangeError);
  });

  it("should throw when reading more bytes than remain", () => {
    const reader = new SigmaByteReader(u8a([0x01, 0x02, 0x03]));

    expect(reader.readBytes(2)).toEqual(u8a([0x01, 0x02]));
    expect(() => reader.readBytes(2)).toThrow(RangeError);
    expect(reader.readBytes(1)).toEqual(u8a([0x03])); // exact remainder still works
    expect(() => reader.readBytes(1)).toThrow(RangeError);
    expect(() => reader.readBytes(-1)).toThrow(RangeError);
  });

  it("should throw when reading bits past the end of the input", () => {
    const reader = new SigmaByteReader(u8a([0xff]));

    expect(reader.readBits(8)).toEqual([true, true, true, true, true, true, true, true]);
    expect(() => reader.readBits(1)).toThrow(RangeError);
    expect(() => new SigmaByteReader(u8a([0xff])).readBits(9)).toThrow(RangeError);
  });

  it("should throw on a VLQ truncated with the continuation bit set", () => {
    expect(() => new SigmaByteReader(u8a([0x80])).readUInt()).toThrow(RangeError);
    expect(() => new SigmaByteReader(u8a([0x80])).readBigUInt()).toThrow(RangeError);
    expect(() => new SigmaByteReader(u8a([0xff, 0xff])).readUInt()).toThrow(RangeError);
  });

  it("should throw when a length-prefixed field is truncated", () => {
    // SLong header is not involved here: readI256 reads a VLQ length (5) and then
    // expects 5 bytes, but only 2 remain.
    const reader = new SigmaByteReader(u8a([0x05, 0x01, 0x02]));
    expect(() => reader.readI256()).toThrow(RangeError);
  });

  it("should read remaining bytes", () => {
    const bytes = u8a([0x01, 0x02, 0x03, 0x04]);
    const reader = new SigmaByteReader(bytes);

    expect(reader.readByte()).toBe(0x01);
    expect(reader.readRemainingBytes()).toEqual(u8a([0x02, 0x03, 0x04]));
    expect(reader.readRemainingBytes()).toEqual(new Uint8Array(0)); // no bytes left
  });
});
