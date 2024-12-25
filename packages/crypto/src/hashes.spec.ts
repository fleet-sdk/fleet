import { describe, expect, it } from "vitest";
import { hex, utf8 } from "./coders";
import { blake2b, blake2b256, sha256 } from "./hashes";

describe("Hashes smoke tests", () => {
  it("Should hash message using BLAKE2b256", () => {
    const msg = utf8.decode("blake2b256");
    expect(blake2b256(msg)).to.be.deep.equal(
      hex.decode("eb95e6932cedac15db722fcdb0cfd21437f94690339a716251fad2f89842ea8b")
    );
  });

  it("Should hash message using BLAKE2b with parameters", () => {
    const xpk =
      "0488b21e000000000000000000b345a673afdeb85091c35d02083035f6e0ca284b1846223b23b566c4070a0cec02a3ad1969b60e85426791b75eccf038e6105c3afab8167af7eb6b73e709b81882";

    expect(
      hex.encode(
        blake2b(utf8.decode(xpk), {
          dkLen: 64,
          personalization: "wallets checksum"
        })
      )
    ).to.be.equal(
      "5d33031ea3bbba9d3332559b1dafd8612683092f535273a4c15ffa103ffa3fc11f7b6992f5a034b3c8dd30f6f103b24e500c44ba4cff2e5c7f6e3e2eb124cd32"
    );
  });

  it("Should have the same result regardless input format", () => {
    const byte = Uint8Array.from([0xde, 0xad, 0xbe, 0xef]);
    const hex = "deadbeef";

    expect(blake2b256(byte)).to.be.deep.equal(blake2b256(hex));
    expect(sha256(byte)).to.be.deep.equal(sha256(hex));
  });

  it("Should hash message using sha256", () => {
    expect(sha256(utf8.decode("sha256"))).to.be.deep.equal(
      hex.decode("5d5b09f6dcb2d53a5fffc60c4ac0d55fabdf556069d6631545f42aa6e3500f2e")
    );
  });
});
