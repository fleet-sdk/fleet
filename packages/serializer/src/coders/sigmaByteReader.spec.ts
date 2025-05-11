import { describe, it, expect } from "vitest";
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
});
