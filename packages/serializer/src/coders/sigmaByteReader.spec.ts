import { describe, expect, it } from "vitest";
import { MAX_I256, MIN_I256 } from "./numRanges";
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

  it("should read boundary BigInt values", () => {
    // MAX_I256: VLQ length 32 + 0x7fff…ff
    const maxReader = new SigmaByteReader(u8a([0x20, 0x7f, ...new Array(31).fill(0xff)]));
    expect(maxReader.readI256()).toBe(MAX_I256);

    // MIN_I256: VLQ length 32 + 0x8000…00
    const minReader = new SigmaByteReader(u8a([0x20, 0x80, ...new Array(31).fill(0x00)]));
    expect(minReader.readI256()).toBe(MIN_I256);
  });

  it("should reject BigInt values that don't fit in 256 bits", () => {
    const i256Err = "out of range for a 256-bit integer";

    // MAX_I256 + 1 (2^255): VLQ length 33 + 0x008000…00
    const overMaxReader = new SigmaByteReader(u8a([0x21, 0x00, 0x80, ...new Array(31).fill(0x00)]));
    expect(() => overMaxReader.readI256()).to.throw(i256Err);

    // MIN_I256 - 1 (-2^255 - 1): VLQ length 33 + 0xff7fff…ff
    const underMinReader = new SigmaByteReader(
      u8a([0x21, 0xff, 0x7f, ...new Array(31).fill(0xff)])
    );
    expect(() => underMinReader.readI256()).to.throw(i256Err);
  });

  it("should read remaining bytes", () => {
    const bytes = u8a([0x01, 0x02, 0x03, 0x04]);
    const reader = new SigmaByteReader(bytes);

    expect(reader.readByte()).toBe(0x01);
    expect(reader.readRemainingBytes()).toEqual(u8a([0x02, 0x03, 0x04]));
    expect(reader.readRemainingBytes()).toEqual(new Uint8Array(0)); // no bytes left
  });
});
