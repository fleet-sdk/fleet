import { concatBytes } from "@fleet-sdk/common";
import { blake2b256, hex, sha256 } from "@fleet-sdk/crypto";
import { describe, expect, it } from "vitest";
import { MAX_CONSTANT_LENGTH } from "../sigmaConstant";
import { SigmaByteWriter } from "./sigmaByteWriter";
import {
  MIN_I16,
  MAX_I16,
  MIN_I32,
  MAX_I32,
  MIN_I64,
  MAX_I64,
  MIN_I256,
  MAX_I256
} from "./numRanges";

describe("Sigma Writer", () => {
  it("Should put a single byte at time", () => {
    const sigmaBuffer = new SigmaByteWriter(MAX_CONSTANT_LENGTH);
    sigmaBuffer.write(0x10).write(0x0f).write(0x00);

    expect(sigmaBuffer).toHaveLength(3);
    expect(sigmaBuffer.toBytes()).toEqual(Uint8Array.from([0x10, 0x0f, 0x00]));
  });

  it("Should put multiple bytes at once", () => {
    const sigmaBuffer = new SigmaByteWriter(MAX_CONSTANT_LENGTH);
    sigmaBuffer.writeBytes(Uint8Array.from([0x00, 0x00, 0x21, 0xff]));
    sigmaBuffer.writeBytes([0x15, 0x0c]);

    expect(sigmaBuffer).toHaveLength(6);
    expect(sigmaBuffer.toBytes()).toEqual(
      Uint8Array.from([0x00, 0x00, 0x21, 0xff, 0x15, 0x0c])
    );
  });

  it("Should put multiple hex string", () => {
    const sigmaBuffer = new SigmaByteWriter(MAX_CONSTANT_LENGTH);

    sigmaBuffer.writeHex("000021ff");
    sigmaBuffer.writeHex("150c");

    expect(sigmaBuffer).toHaveLength(6);
    expect(sigmaBuffer.toBytes()).toEqual(
      Uint8Array.from([0x00, 0x00, 0x21, 0xff, 0x15, 0x0c])
    );
  });

  it("Should put a boolean", () => {
    const sigmaBuffer = new SigmaByteWriter(MAX_CONSTANT_LENGTH);
    sigmaBuffer.writeBool(true);
    sigmaBuffer.writeBool(false);

    expect(sigmaBuffer).toHaveLength(2);
    expect(sigmaBuffer.toBytes()).toEqual(Uint8Array.from([0x01, 0x00]));
  });

  it("Should put Int", () => {
    const testVectors = [
      { int: 0, hex: "00" },
      { int: 50, hex: "64" },
      { int: 100, hex: "c801" },
      { int: 150, hex: "ac02" },
      { int: 200, hex: "9003" },
      { int: 250, hex: "f403" },
      { int: 300, hex: "d804" },
      { int: 350, hex: "bc05" },
      { int: 400, hex: "a006" },
      { int: 450, hex: "8407" },
      { int: 500, hex: "e807" },
      { int: 550, hex: "cc08" },
      { int: 600, hex: "b009" },
      { int: 650, hex: "940a" },
      { int: 700, hex: "f80a" },
      { int: 750, hex: "dc0b" },
      { int: 800, hex: "c00c" },
      { int: 850, hex: "a40d" },
      { int: 900, hex: "880e" },
      { int: 950, hex: "ec0e" }
    ];

    const all = new SigmaByteWriter(MAX_CONSTANT_LENGTH);
    for (const tv of testVectors) {
      all.writeI16(tv.int);
      expect(new SigmaByteWriter(tv.hex.length).writeI16(tv.int).encode(hex)).toBe(
        tv.hex
      );
    }

    expect(all.encode(hex)).toEqual(testVectors.map((x) => x.hex).join(""));
  });

  it("Should fail for out of range values", () => {
    const sigmaBuffer = new SigmaByteWriter(MAX_CONSTANT_LENGTH);

    // Short
    const i16Err = "out of range for a 16-bit integer";
    expect(() => sigmaBuffer.writeI16(MIN_I16 - 1)).to.throw(i16Err);
    expect(() => sigmaBuffer.writeI16(MAX_I16 + 1)).to.throw(i16Err);

    // Int
    const i32Err = "out of range for a 32-bit integer";
    expect(() => sigmaBuffer.writeI32(MIN_I32 - 1)).to.throw(i32Err);
    expect(() => sigmaBuffer.writeI32(MAX_I32 + 1)).to.throw(i32Err);

    // Long
    const i64Err = "out of range for a 64-bit integer";
    expect(() => sigmaBuffer.writeI64(MIN_I64 - 1n)).to.throw(i64Err);
    expect(() => sigmaBuffer.writeI64(MAX_I64 + 1n)).to.throw(i64Err);

    // BigInt
    const i256Err = "out of range for a 256-bit integer";
    expect(() => sigmaBuffer.writeI256(MIN_I256 - 1n)).to.throw(i256Err);
    expect(() => sigmaBuffer.writeI256(MAX_I256 + 1n)).to.throw(i256Err);
  });

  it("Should write a checksum based on the current stream content", () => {
    const bytes = Uint8Array.from([0x00, 0x00, 0x21, 0xff, 0x15, 0x0c]);
    const blakeHash = blake2b256(bytes);
    const shaHash = sha256(bytes);

    const defaultHashSize = new SigmaByteWriter(MAX_CONSTANT_LENGTH)
      .writeBytes(bytes)
      .writeChecksum();

    expect(defaultHashSize.toBytes()).to.be.deep.equal(
      concatBytes(bytes, blakeHash.subarray(0, 4))
    );

    const customHashSize = new SigmaByteWriter(MAX_CONSTANT_LENGTH)
      .writeBytes(bytes)
      .writeChecksum(10);

    expect(customHashSize.toBytes()).to.be.deep.equal(
      concatBytes(bytes, blakeHash.subarray(0, 10))
    );

    const fullHashSize = new SigmaByteWriter(MAX_CONSTANT_LENGTH)
      .writeBytes(bytes)
      .writeChecksum(0);

    expect(fullHashSize.toBytes()).to.be.deep.equal(concatBytes(bytes, blakeHash));

    const customHashFn = new SigmaByteWriter(MAX_CONSTANT_LENGTH)
      .writeBytes(bytes)
      .writeChecksum(10, sha256);
    expect(customHashFn.toBytes()).to.be.deep.equal(
      concatBytes(bytes, shaHash.subarray(0, 10))
    );
  });
});
