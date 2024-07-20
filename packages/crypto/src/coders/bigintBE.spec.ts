import { describe, expect, it } from "vitest";
import { bigintBE } from "./bigintBE";

describe("Big Endian BigInt coder", () => {
  it("Should encode Uint8Array to bigint", () => {
    expect(bigintBE.encode(Uint8Array.from([1]))).to.be.equal(1n);
    expect(bigintBE.encode(Uint8Array.from([0]))).to.be.equal(0n);
    expect(bigintBE.encode(Uint8Array.from([]))).to.be.equal(0n);
    expect(bigintBE.encode(Uint8Array.from([0xde, 0xad, 0xbe, 0xef]))).to.be.equal(
      3735928559n
    );
  });

  it("Should decode bigint to Uint8Array", () => {
    expect(bigintBE.decode(1n)).to.be.deep.equal(Uint8Array.from([1]));
    expect(bigintBE.decode(0n)).to.be.deep.equal(Uint8Array.from([0]));
    expect(bigintBE.decode(3735928559n)).to.be.deep.equal(
      Uint8Array.from([0xde, 0xad, 0xbe, 0xef])
    );
  });
});
